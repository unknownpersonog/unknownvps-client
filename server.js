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
        }
        else {
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
                                    cpu: 0
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
                    has_project: true
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

    app.post('/createProject', (req, res) => {
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
    res.status(404).render('404', { title: '404 - Page Not Found' });
  });
  
    app.listen(3000, () => {
        console.log(`UnknownVPS Client is successfully running on port 3000`);
    });
});