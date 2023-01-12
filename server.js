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
        return res.send(`
        <title>UnknownVPS Client</title>
        <div>
        <nav class="sidebar sidebar-offcanvas" id="sidebar">
    <div style="background-color: #212530" class="sidebar-brand-wrapper d-none d-lg-flex align-items-center justify-content-center fixed-top">
     <a style="color: white" class="sidebar-brand brand-logo" href="/dashboard"><%= extra.home.name %></a>
    </div>
    <ul class="nav">
          <li class="nav-item nav-category">
            <span class="nav-link text-white"><h4>Management</h4></span>
          </li>
      <li class="nav-item menu-items">
        <a class="nav-link" href="../dashboard">
          <span class="menu-title">Dashboard</span>
        </a>
      </li>
      <li class="nav-item menu-items">
        <a class="nav-link" href="../servers">
          <span class="menu-title">Your Servers</span>
        </a>
      </li>
        <li class="nav-item menu-items">
        <a class="nav-link" href="../settings">
          <span class="menu-title">Account Settings</span>
        </a>
      </li>
          <li class="nav-item nav-category">
            <span class="nav-link text-white"><h4>Coins & Resources</h4></span>
          </li>
      <li class="nav-item menu-items">
        <a class="nav-link" href="../store">
          <span class="menu-title">Resources Store</span>
        </a>
      </li>
      <li class="nav-item menu-items">
        <a class="nav-link" href="../afk">
          <span class="menu-title">AFK Page</span>
        </a>
      </li>
      <li class="nav-item menu-items">
        <a class="nav-link" href="../lv">
          <span class="menu-title">Linkvertise</span>
        </a>
      </li>
      <li class="nav-item menu-items">
        <a class="nav-link" href="../j4r">
          <span class="menu-title">Join for Rewards</span>
        </a>
      </li>
      <li class="nav-item menu-items">
        <a class="nav-link" href="../gift">
          <span class="menu-title">Gift Coins</span>
        </a>
      </li>
      <li class="nav-item menu-items">
        <a class="nav-link" href="../redeem">
          <span class="menu-title">Redeem Coupon</span>
        </a>
      </li>
          <li class="nav-item nav-category">
            <span class="nav-link text-white"><h4>Miscellaneous</h4></span>
          </li>
        <% if (pterodactyl.root_admin == true) { %>
          <li class="nav-item menu-items">
          <a class="nav-link" href="../admin">
            <span class="menu-title">Admin</span>
            </a>
          </li>
        <% } %>
        <li class="nav-item menu-items">
          <a class="nav-link" href="../panel">
            <span class="menu-title">Panel</span>
          </a>
        </li>
        <li class="nav-item menu-items">
          <a class="nav-link" href="../logout">
            <span class="menu-title">Logout</span>
          </a>
        </li>
      </ul>
    </nav>
        </div>
            <style>
            body {
              background: linear-gradient(to bottom right, #0d324d 0%, #7f5a83 100%);
             }
             h3 {
               background: -webkit-linear-gradient(#ffafbd, #ffc3a0);
               -webkit-background-clip: text;
               -webkit-text-fill-color: transparent;
             }
             span {
               background: -webkit-linear-gradient(#ffafbd, #ffc3a0);
               -webkit-background-clip: text;
               -webkit-text-fill-color: transparent;
             }
            </style>
            <div style="margin: 300px auto;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: sans-serif;"
            >
                <img src="${user.avatar}"/>
                
                <h3>Welcome ${user.username}</h3>
                <span>Email: ${user.email}</span>
            </div>
        `)
        
    }catch(error){
        console.log('Error',error)
        return res.send('Some error occurred! ')
    } 
})
