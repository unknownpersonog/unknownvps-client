const express = require("express");
const session = require("express-session");
const app = express();
const ejs = require("ejs");
require("dotenv").config();
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path")
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("login");
});

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
  new DiscordStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CLIENT_REDIRECT_URI,
      scope: ["identify", "email", "guilds"],
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
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

MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
  if (err) throw err;
  console.log("Connected to MongoDB Atlas database");
  const db = client.db("test");
  const usersCollection = db.collection("users");

  app.get(
    "/login/callback",
    passport.authenticate("discord", { failureRedirect: "/login" }),
    function (req, res) {
      usersCollection.findOne({ discord_id: req.user.id }, (err, user) => {
        if (err) throw err;
        if (user) {
          // update user's information
          usersCollection.updateOne(
            { discord_id: req.user.id },
            { $set: { username: req.user.username, email: req.user.email } },
            (err, result) => {
              if (err) throw err;
              console.log("User information updated");
            }
          );
        } else {
          // insert new user's information
          usersCollection.insertOne(
            {
              discord_id: req.user.id,
              username: req.user.username,
              email: req.user.email,
              coins: 0,
              ram: 0,
              cpu: 0,
              disk: 0,
              slots: 0
            },
            (err, result) => {
              if (err) throw err;
              console.log("User information inserted into database");
            }
          );
        }
      });
      // Successful authentication, redirect home.
      res.redirect("/dashboard");
    }
  );
  app.get("/dashboard", ensureAuthenticated, function (req, res) {
    const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
    client
      .db("test")
      .collection("users")
      .findOne({ discord_id: req.user.id }, (err, result) => {
        if (err) {
          console.log(err);
          return res.send("An error occurred");
        }
        res.render("dashboard", {
          user: req.user,
          avatarURL,
          coins: result.coins,
          ram: result.ram,
          cpu: result.cpu,
          disk: result.disk,
          vpsno: result.vpsno
        });
      });
  });
  app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
  app.get("/earn", ensureAuthenticated, function (req, res) {
    const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
    client
      .db("test")
      .collection("users")
      .findOne({ discord_id: req.user.id }, (err, result) => {
        if (err) {
          console.log(err);
          return res.send("An error occurred");
        }
        res.render("earn", {
          user: req.user,
          avatarURL,
          coins: result.coins,
        });
      });
  });
  app.get("/store", ensureAuthenticated, function (req, res) {
    const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
    client
      .db("test")
      .collection("users")
      .findOne({ discord_id: req.user.id }, (err, result) => {
        if (err) {
          console.log(err);
          return res.send("An error occurred");
        }
        res.render("store", {
          user: req.user,
          avatarURL,
          coins: result.coins,
        });
      });
  });
  app.get("/ads.txt", function (req, res) {
  res.sendFile('views/ads.txt', { root: __dirname });
  })

  app.listen(3000, () => {
    console.log(`App started on port 3000`);
  });
});
