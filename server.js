const express=require('express');
const axios=require('axios');
const fs=require('fs');
const session = require('express-session');
const app=express();
const ejs=require('ejs');
require('dotenv').config()
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

app.set('view engine', 'ejs');
app.get('/',(req,res)=>{
    res.render('login');
})

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'https://client.unknownnodes.ml/login/callback',
    scope: ['identify','email','guilds']
  },
  function(accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));

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
    res.redirect('/login');
}

app.get('/login', passport.authenticate('discord'));

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Function to check if user already exists in database
function checkUserExists(userId, callback) {
  connection.query("SELECT * FROM users WHERE discord_id = ?", [userId], function (err, result) {
    if (err) throw err;
    callback(result);
  });
}

app.get('/login/callback', 
  passport.authenticate('discord', { failureRedirect: '/login' }),
  function(req, res) {
    checkUserExists(req.user.id, (result) => {
        if(result.length > 0) {
            // update user's information
            const sql = `UPDATE users SET username = '${req.user.username}', email = '${req.user.email}' WHERE discord_id = '${req.user.id}'`;
            connection.query(sql, (err, result) => {
                if (err) throw err;
                console.log('User information updated');
            });
        } else {
            // insert new user's information
            const sql = `INSERT INTO users (discord_id, username, email, coins) VALUES ('${req.user.id}', '${req.user.username}', '${req.user.email}', 0)`;
            connection.query(sql, (err, result) => {
                if (err) throw err;
                console.log('User information inserted into database');
            });
        }
    });
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });
  app.get('/dashboard', ensureAuthenticated, function(req, res) {
    const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
    connection.query(`SELECT coins FROM users WHERE discord_id = ${req.user.id}`, (err, results) => {
        if(err) {
          console.log(err);
          return res.send('An error occurred');
        }
    res.render('dashboard', {user: req.user, avatarURL, coins: results[0].coins});
        })
    });
    app.get('/logout', function(req, res, next){
        req.logout(function(err) {
          if (err) { return next(err); }
          res.redirect('/');
        });
      });
app.listen(3000, ()=>{
  console.log(`App started on port 3000`);
})
      