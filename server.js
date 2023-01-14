const express=require('express');
const axios=require('axios');
const fs=require('fs');
const http=require('http');
const app=express();


app.listen(process.env.PORT, ()=>{
    console.log(`App started on port ${process.env.PORT}`);
})

app.get('/',(req,res)=>{
    res.send(`
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UnknownVPS &bullet; Login</title>
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <style>
        [x-cloak] {
            display: none !important;
        }
        div.fixed {
    background: linear-gradient(to bottom right, #0d324d 0%, #7f5a83 100%);
}
    </style>
</head>
<body>
<body class="relative antialiased">
<!-- This example requires Tailwind CSS v2.0+ -->
<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="fixed inset-0 transition-opacity"></div>
  <div class="fixed inset-0 z-10 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <!--
        Modal panel, show/hide based on modal state.
        Entering: "ease-out duration-300"
          From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          To: "opacity-100 translate-y-0 sm:scale-100"
        Leaving: "ease-in duration-200"
          From: "opacity-100 translate-y-0 sm:scale-100"
          To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      -->
      <div class="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
              <!-- Heroicon name: outline/exclamation-triangle -->
              <img src="https://img.icons8.com/ios-glyphs/25/2563EB/lock--v1.png"/>
            </div>
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg font-medium leading-6 text-gray-900" id="modal-title">Authentication</h3>
              <h5 class="text-md font-medium text-white">Login to be granted access to the dashboard</h5>
            </div>
          </div>
        </div>
        <div style="padding-top: 8px;" class="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <a href="https://discord.com/api/oauth2/authorize?client_id=1058719156691795989&redirect_uri=https%3A%2F%2Fclient.unknownnodes.ml%2Fauth%2Fdiscord&response_type=code&scope=identify%20guilds%20guilds.join%20email" type="button" class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">Login using Discord</a>
          <a href="https://discord.gg/U4fQJXxyDS" type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-100 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Discord Server</a>
        </div>
      </div>
    </div>
  </div>
</div>
    </main>
    </body>
    `)
})
app.get('/auth/discord',async(req,res)=>{
    const code=req.query.code;
    const params = new URLSearchParams();
    let user;
    params.append('client_id', "1058719156691795989");
    params.append('client_secret', "ancloRjJm_QQ5u1ClsJRakkqBX9qdd9X");
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', "https://client.unknownnodes.ml/auth/discord");
    try{
        const response=await axios.post('https://discord.com/api/oauth2/token',params)
        const { access_token,token_type}=response.data;
        const userDataResponse=await axios.get('https://discord.com/api/users/@me',{
            headers:{
                authorization: `${token_type} ${access_token}`
            }
        })
        console.log('Data: ',userDataResponse.data)
        user={
            username:userDataResponse.data.username,
            email:userDataResponse.data.email,
            avatar:`https://cdn.discordapp.com/avatars/${userDataResponse.data.id}/${userDataResponse.data.avatar}`

        }
        app.get('/dashboard') ,res.send(`
<html lang="en"><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <link rel="icon" type="image/x-icon" href="Unknown%20VPS_files/Server-ico.png">
<style>
.fullpage {
    height: 100%;
    }
html, body {
    height: 100%;
    background: linear-gradient(to bottom right, #0d324d 0%, #7f5a83 100%);
}
</style>
    </head>
    <body>
    <nav class="navbar navbar-expand-lg text-white">
    <div class="container-fluid">
    <a class="navbar-brand" href="#" style="color: azure">Unknown VPS</a>
    <button style="color: azure" class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#" style="color: azure">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" style="color: azure">Support</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" style="color: azure" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Store
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
            <li><a class="dropdown-item" href="#">VPS</a></li>
            <li><a class="dropdown-item" href="#">Minecraft Server</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Donate</a></li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://discord.gg/U4fQJXxyDS" style="color: azure" tabindex="-1" aria-disabled="false">Discord</a>
        </li>
      </ul>
      <form class="d-flex">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit" style="color: azure">Search</button>
      </form>
    </div>
  </div>
</nav>
    <title>Unknown VPS</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>

    <div class="container p-5 text-center">
          <h3 style="color: azure">Login Success</h3>
                <img src="${user.avatar}"/>
                <h3 style="color: azure">Welcome ${user.username}</h3>
                <span style="color: azure">Email: ${user.email}</span>
        </div>
      </div>
    </div>
    </body>
</html>
        `)
        
    }catch(error){
        console.log('Error',error)
        return res.send('Some error occurred! ')
    } 
})
