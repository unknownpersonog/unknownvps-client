
# UnknownVPS Client

Unknown VPS is a VPS Distribution Service. A custom made client area is used for this service. This client area uses Discord OAuth2 for handling logins and MariaDB Atlas Database for user storage. User's information is stored using user's  discord id.

### Who should use?
One who wants a unique solution for his projects. Mainly Game Servers and VPS/VDS.


 
## Acknowledgements

 - Thanks to [ChatGPT](https://chat.openai.com) for some code in the project

## Authors

- [@unknownpersonog](https://www.github.com/unknownpersonog) - Owner and Maintainer of the repository


## Badges

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![AGPL License](https://img.shields.io/github/actions/workflow/status/unknownpersonog/unknownvps-client/node.js.yml)](https://github.com/unknownpersonog/unknownvps-client/actions/workflows/node.js.yml)


## Screenshots
#### Login Page
![Login Page](https://i.ibb.co/cJVVNNr/unknownvps-login.png)

#### Dashboard Page
![Dashboard Page](https://i.ibb.co/WzcdR0D/unknownvps-dash.png)
## Features

- Dark Themed
- Database Storage
- Attractive Design
- Coin System
- Easy to understand User Interface
- Discord OAuth2

## Deployment

To deploy this project on your trusted infrastructure, use the following steps: 

- Step 1: Install the required dependencies 
    ```bash
      npm i
    ```

---

- Step 2: Copy env.example to .env
    ```bash
      cp env.example .env
    ```
---
- Step 3: Go to [Discord Dev Portal](https://discord.com/developers/applications)

- 3.1: Click on `New Application`
- 3.2: Name your OAuth Application and agree to Discord Terms of Service
- 3.3: Click on OAuth and Copy **Client ID** and **Client Secret**
- 3.4: In redirects add your domain in the  following farm
    ``https://<your domain>/login/callback`` (use http if you do not have ssl yet)
---
- Step 4: Fill the .env with required details (You can use env.example for reference)

---

- Step 5: Run the following command to start the server
    ```bash
    npm run start
    ```

---

- Step 6 (Optional): Go to the views folder and modify the brandings but **keep our credits in footbar**




## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`CLIENT_ID`: Obtained using Discord OAuth2

`CLIENT_REDIRECT_URI`: Redirect URI Defined in Discord OAuth2

`CLIENT_SECRET`: Obtained using Discord OAuth2

`DB_URI`: MongoDB Database URI to access and edit the DB

`PORT`: Port to start the Client on.

`SERVER_IP`: IP on which servers are to be created

`SERVER_PASS`: Pass to ssh on the server (ROOT  user required)

`SERVER_LXC_PORT`: Port for LXD API

`SERVER_SSH_PORT`: Port for SSH

`SERVER_USER`: root (Leave unchanged unless you know what this is)

`DB_NAME`: Name of the Database

`DB_COLL`: Collection to store user information


## FAQ

#### I do not want to use root user. What should I do?

Answer: Root user is used to execute direct commands on the server to setup the container. You can replace this user if you add `sudo` before all the commands. Generally this should return an error. We will try to shift to a application based container creation

#### I am getting error Cannot find module some_module. What is the fix for this?

Answer: Ensure you followed steps correctly

#### My MongoDB connection is failing?

Answer: If you are using the correct URI then ensure your net connectivity.


## Future Plans
- Optimizing the VPS Creation System. It is known to have many bugs.

- Creating a custom application to handle requests made from client to ensure safety of data transfer.

- Adding more login options


## Support

Support is available on our [Discord](https://discord.gg/xQJ5xfX2k5) but please ensure that the support is just volunteers and no "real" support team is there.

 If you have any issues that all users have please report them in GitHub Issues.

### That's all for the README. Please leave a star to support us. Thank You

