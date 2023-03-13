const express = require("express");
const session = require("express-session");
const app = express();
const ejs = require("ejs");
require("dotenv").config();
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path")
const bodyParser = require('body-parser');
app.set("view engine", "ejs");
const request = require('request');
const fs = require('fs');

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/views', express.static(path.join(__dirname, 'views')));

app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new DiscordStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CLIENT_REDIRECT_URI,
            scope: ["identify", "email", "guilds"],
        },
        function(accessToken, refreshToken, profile, done) {
            done(null, profile);
        }
    )
);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

app.get("/login", passport.authenticate("discord"));

const mongodb = require("mongodb-legacy");
const MongoClient = mongodb.MongoClient;

const uri = process.env.DB_URI;

MongoClient.connect(uri, {
    useNewUrlParser: true
}, (err, client) => {
    if (err) throw err;
    console.log("Connected to MongoDB Database successfully!");
    const db = client.db("test");
    const usersCollection = db.collection("users");

    app.get("/", (req, res) => {
        if (req.isAuthenticated()) {
            res.redirect('/dashboard');
        } else {
            res.render("login");
        }
    });

    app.get(
        "/login/callback",
        passport.authenticate("discord", {
            failureRedirect: "/login"
        }),
        function(req, res) {
            usersCollection.findOne({
                discord_id: req.user.id
            }, (err, user) => {
                if (err) throw err;
                if (user) {
                    // update user's information
                    usersCollection.updateOne({
                            discord_id: req.user.id
                        }, {
                            $set: {
                                username: req.user.username,
                                email: req.user.email
                            }
                        },
                        (err, result) => {
                            if (err) throw err;
                            console.log("User " + req.user.id + " information updated successfully");
                        }
                    );
                } else {
                    // insert new user's information
                    usersCollection.insertOne({
                            discord_id: req.user.id,
                            username: req.user.username,
                            email: req.user.email,
                            coins: 0,
                            project: {
                                vps: {
                                    ram: 0,
                                    disk: 0,
                                    cpu: 0,
                                    amt: "N/A"
                                },
                                info: {
                                    name: "No Project Yet",
                                    category: "N/A"
                                }
                            },
                            slots: 0
                        },
                        (err, result) => {
                            if (err) throw err;
                            console.log("User " + req.user.id + " inserted into database");
                        }
                    );
                }
            });
            // Successful authentication, redirect home.
            res.redirect("/dashboard");
        }
    );


    app.get("/dashboard", ensureAuthenticated, function(req, res) {
        const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
        client
            .db("test")
            .collection("users")
            .findOne({
                discord_id: req.user.id
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("An error occurred");
                }
                if (result.project.info.name == "No Project Yet" || result.project.info.category == "N/A") {
                    return res.render("dashboard", {
                        user: req.user,
                        avatarURL,
                        coins: result.coins,
                        vpsno: result.slots,
                        vps: result.project.vps,
                        project_name: result.project.info.name,
                        project_category: result.project.info.category,
                        pageName: "Dashboard",
                        req: req,
                        has_project: false,
                        has_vps: false,
                    });
                }
                if (result.project.vps.amt == "N/A") {
                    return res.render("dashboard", {
                        user: req.user,
                        avatarURL,
                        coins: result.coins,
                        vpsno: result.slots,
                        vps: result.project.vps,
                        project_name: result.project.info.name,
                        project_category: result.project.info.category,
                        pageName: "Dashboard",
                        req: req,
                        has_project: true,
                        has_vps: false,
                    });
                }
                res.render("dashboard", {
                    user: req.user,
                    avatarURL,
                    coins: result.coins,
                    vpsno: result.slots,
                    vps: result.project.vps,
                    project_name: result.project.info.name,
                    project_category: result.project.info.category,
                    pageName: "Dashboard",
                    req: req,
                    has_project: true,
                    has_vps: true
                });
            });

    });
    app.get("/earn", ensureAuthenticated, function(req, res) {
        const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
        client
            .db("test")
            .collection("users")
            .findOne({
                discord_id: req.user.id
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("An error occurred");
                }
                res.render("earn", {
                    user: req.user,
                    avatarURL,
                    coins: result.coins,
                    pageName: "Earn"
                });
            });
    });
    app.get("/store", ensureAuthenticated, function(req, res) {
        const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
        client
            .db("test")
            .collection("users")
            .findOne({
                discord_id: req.user.id
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("An error occurred");
                }
                res.render("store", {
                    user: req.user,
                    avatarURL,
                    coins: result.coins,
                    pageName: "Store"
                });
            });
    });

    app.get("/profile", ensureAuthenticated, function(req, res) {
        const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
        client
            .db("test")
            .collection("users")
            .findOne({
                discord_id: req.user.id
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("An error occurred");
                }
                res.render("profile", {
                    user: req.user,
                    avatarURL,
                    coins: result.coins,
                    pageName: "Profile"
                });
            });
    });

    // Project Creation Starts
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.post('/createProject', ensureAuthenticated, (req, res) => {
        const name = req.body.inputProjectName1;
        const category = req.body.inputCategory1;
        if (!name || !category) {
            console.error('Invalid request body:', req.body);
            return res.status(400).send('Bad request');
        }
        usersCollection.findOne({
            discord_id: req.user.id
        }, (err, user, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal server error');
            }
            if (!user) {
                console.error(`User with discord_id ${req.user.id} not found`);
                return res.status(404).send('User not found');
            }
            // update user's information
            usersCollection.updateOne({
                    discord_id: req.user.id
                }, {
                    $set: {
                        "project.info.name": name,
                        "project.info.category": category
                    }
                },
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Internal server error');
                    }
                    console.log("Project Creation Success");
                    return res.redirect("/dashboard?success=projectsuccess");
                });
        });
    });
    // Project Creation Ends
    async function wait() {
        await new Promise(resolve => setTimeout(resolve, 30000));
        console.log('30 seconds have passed.');
    }

    //LXD API Starts
    let containerName;
    app.post("/createVPS", ensureAuthenticated, (req, res) => {

        app.use(bodyParser.urlencoded({
            extended: true
        }));
        app.use(bodyParser.json());

        const os = req.body.inputOs1;
        const vpsName = req.body.inputVPSName1;
        const vpsPassword = req.body.inputVPSPass1;
        if (!os || !vpsName || !vpsPassword) {
            console.error('Invalid request body:', req.body);
            return res.status(400).send('Bad request');
        }
        // Get the collection for storing container count
        const containerCountCollection = client.db("test").collection('containerCount');
        containerCountCollection.countDocuments({}, function(err, count) {
            if (err) throw err;
            if (count < 6) {
                const db = client.db("test");

                // Select the collection to store allocated ports
                const pocollection = db.collection('data');

                // Fetch the last allocated port
                pocollection.findOne({}, {
                    sort: {
                        port: -1
                    }
                }, function(err, result) {
                    if (err) throw err;

                    let lastPort = result ? result.port : 2000;
                    let nextPort = lastPort + 1;

                    // Insert the new allocated port into the collection
                    pocollection.insertOne({
                        port: nextPort
                    }, function(err, result) {
                        if (err) throw err;
                    });
                    // Allocate a new port for the next container
                    // Select the database
                    const cocollection = client.db("test").collection('containers');

                    // Fetch the last allocated container ID
                    cocollection.findOne({}, {
                        sort: {
                            id: -1
                        }
                    }, function(err, result) {
                        if (err) throw err;

                        let lastID = result ? result.id : 0;
                        let nextID = lastID + 1;

                        // Insert the new allocated container ID into the collection
                        cocollection.insertOne({
                            id: nextID
                        }, function(err, result) {
                            if (err) throw err;

                            // Use the new allocated container ID
                            console.log(`Next container ID: ${nextID}`);
                            const containerName = `vps-${nextID}`;
                            console.log(`Next port: ${nextPort}`);

                            const options = {
                                url: 'https://94.23.116.182:3850/1.0/containers',
                                rejectUnauthorized: false,
                                cert: fs.readFileSync('cert.pem'),
                                key: fs.readFileSync('key.pem'),
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                json: true,
                                body: {
                                    name: containerName,
                                    source: {
                                        type: 'image',
                                        mode: 'pull',
                                        server: 'https://images.linuxcontainers.org',
                                        protocol: 'simplestreams',
                                        alias: `debian/bullseye/amd64`,
                                    },
                                    config: {
                                        "limits.memory": '256MB'
                                    },
                                    devices: {
                                        "ssh": {
                                            "type": "proxy",
                                            "listen": "tcp:0.0.0.0:" + nextPort,
                                            "connect": "tcp:127.0.0.1:22"
                                        }
                                    },
                                },
                            };

                            console.log("Port Being Allocated:" + nextPort)
                            request.post(options, (err, res, body) => {
                                if (err) {
                                    console.error(err);
                                } else {
                                    console.log(body);
                                }
                            });
                            setTimeout(startVPS, 15000);

                            function startVPS(req, res) {
                                console.log(containerName)
                                const {
                                    Client
                                } = require('ssh2');

                                const sshConfig = {
                                    host: process.env.SERVER_IP,
                                    port: process.env.SERVER_PORT,
                                    username: process.env.SERVER_USER,
                                    password: process.env.SERVER_PASS
                                };
                                const commands = [
                                    'lxc config set ' + containerName + ' limits.cpu.allowance 10%',
                                    'lxc config device override ' + containerName + ' root size=512MB',
                                    'lxc start ' + containerName,
                                    'lxc exec ' + containerName + ' -- sh -c "apt-get update"',
                                    'lxc exec ' + containerName + ' -- sh -c "apt-get install curl -y"',
                                    'lxc exec ' + containerName + ` -- sh -c "hostnamectl set-hostname ${vpsName}"`,
                                    'lxc exec ' + containerName + ` -- bash -c "echo -e \'${vpsPassword}\n${vpsPassword}\' | passwd root"`,
                                    'lxc exec ' + containerName + ' -- sh -c "apt-get update"',
                                    'lxc exec ' + containerName + ' -- sh -c "apt-get install wget openssh-server -y"',
                                    'lxc exec ' + containerName + ' -- sh -c "rm -rf /etc/ssh/sshd_config"',
                                    'lxc exec ' + containerName + ' -- sh -c "curl -Lo /etc/ssh/sshd_config https://raw.githubusercontent.com/dxomg/sshd_config/main/sshd_config"',
                                    'lxc exec ' + containerName + ' -- sh -c "systemctl restart ssh"',
                                    'lxc exec ' + containerName + ' -- sh -c "systemctl restart sshd"',
                                    'lxc exec ' + containerName + ' -- sh -c "reboot"',
                                ];

                                const ssh = new Client();
                                ssh.on('ready', () => {
                                    ssh.exec(commands.join(' && '), (err, stream) => {
                                        if (err) {
                                            console.error(err);
                                            ssh.end();
                                            return;
                                        }
                                        stream.on('close', (code, signal) => {
                                            console.log(`Command execution completed with code ${code} and signal ${signal}`);
                                            ssh.end();
                                        }).on('data', (data) => {
                                            console.log(data.toString());
                                        }).stderr.on('data', (data) => {
                                            console.error(data.toString());
                                        });
                                    });
                                }).connect(sshConfig);

                            }
                            usersCollection.findOne({
                                discord_id: req.user.id
                            }, (err, user, result) => {
                                if (err) {
                                    console.error(err);
                                    return res.status(500).send('Internal server error');
                                }
                                if (!user) {
                                    console.error(`User with discord_id ${req.user.id} not found`);
                                    return res.status(404).send('User not found');
                                }
                                // update user's information
                                usersCollection.updateOne({
                                        discord_id: req.user.id
                                    }, {
                                        $set: {
                                            "project.vps.name": vpsName,
                                            "project.vps.id": containerName,
                                            "project.vps.pass": vpsPassword,
                                            "project.vps.os": "Debian Bullseye",
                                            "project.vps.ip": "vps1.fogsmp.ml",
                                            "project.vps.port": nextPort,
                                            "project.vps.amt": 1,
                                            "project.vps.ram": 0.2,
                                            "project.vps.cpu": 0.1,
                                            "project.vps.disk": 0.5,
                                            "slots": 1

                                        }
                                    },
                                    (err, result) => {
                                        if (err) {
                                            console.error(err);
                                            return res.status(500).send('Internal server error');
                                        }
                                    });
                            });
                        });

                    });

                });


                // Update the container count in the collection
                containerCountCollection.insertOne({
                    count: count + 1
                }, function(err, result) {
                    if (err) throw err;

                    console.log(`Created a new container. Total count: ${count + 1}`);
                    setTimeout(function() {
                        // Redirect to another page after 15 seconds
                        res.redirect('/dashboard?success=setupvps');
                    }, 15000);
                });
            } else {
                console.log('Cannot create a new container. Maximum limit reached.');
                res.redirect("/dashboard?err=outofstock")
            }



        });
    });
    app.get("/manage", ensureAuthenticated, (req, res) => {
        const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
        client
            .db("test")
            .collection("users")
            .findOne({
                discord_id: req.user.id
            }, (err, result) => {
                if (err) {
                    console.log(err);
                    return res.send("An error occurred");
                }
                if (result.project.vps.amt == "N/A") {
                    return res.render("manage", {
                        user: req.user,
                        avatarURL,
                        coins: result.coins,
                        pageName: "Manage",
                        req: req,
                        has_vps: false,
                    });
                }
                return res.render("manage", {
                    user: req.user,
                    avatarURL,
                    coins: result.coins,
                    pageName: "Manage",
                    vps: result.project.vps,
                    has_vps: true,
                });
            });
    });

    app.get("/discord", (req, res) => {
        res.redirect("https://discord.gg/xQJ5xfX2k5");
    });

    // Logout Starts
    app.get("/logout", function(req, res, next) {
        req.logout(function(err) {
            if (err) {
                return next(err);
            }
            res.redirect("/");
        });
    });
    // Logout Ends

    app.use(function(req, res, next) {
        res.status(404).render('404', {
            title: '404 - Page Not Found'
        });
    });

    app.listen(3000, () => {
        console.log(`UnknownVPS Client is successfully running on port 3000`);
    });
});
