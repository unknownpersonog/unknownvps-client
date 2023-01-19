const express=require('express');
const axios=require('axios');
const fs=require('fs');
const session = require('express-session');
const app=express();
const ejs=require('ejs');
require('dotenv').config()
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

app.listen(3000, ()=>{
    console.log(`App started on port 3000`);
})
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
    callbackURL: 'http://localhost:3000/login/callback',
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

app.get('/login/callback', 
  passport.authenticate('discord', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });
  app.get('/dashboard', ensureAuthenticated, function(req, res) {
    const avatarURL = `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`;
    res.render('dashboard', {user: req.user, avatarURL});
        })