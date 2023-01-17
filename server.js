const express=require('express');
const axios=require('axios');
const fs=require('fs');
const http=require('http');
const app=express();
const ejs=require('ejs')
var path = require ('path');
var cookieParser = require('cookie-parser');

app.listen(3000, ()=>{
    console.log(`App started on port 3000`);
})
app.set('view engine', 'ejs');
app.get('/',(req,res)=>{
    res.render('login');
})
app.get('/login',async(req,res)=>{
    const code=req.query.code;
    const params = new URLSearchParams();
    let user;
    params.append('client_id', process.env.CLIENT_ID);
    params.append('client_secret', process.env.CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', "https://client.unknownnodes.ml/login");
  res.render(`loggingin.ejs`);
    app.get('/dashboard',async(req,res)=>{
      try{
        const response=await axios.post('https://discord.com/api/oauth2/token',params)
        const { access_token,token_type}=response.data;
        const userDataResponse=await axios.get('https://discord.com/api/users/@me',{
            headers:{
                authorization: `${token_type} ${access_token}`
            }
        })
        console.log('Data: ',userDataResponse.data)
        module.exports = user={
            username:userDataResponse.data.username,
            email:userDataResponse.data.email,
            id:userDataResponse.data.id,
            avatarid:userDataResponse.data.avatar,
            avatar:`https://cdn.discordapp.com/avatars/${userDataResponse.data.id}/${userDataResponse.data.avatar}`
        }

             }catch(error){
        console.log('Error',error)
        return res.send('Some error occurred! ')
    } 
        res.render('dashboard', {user: user});
        })
  })
