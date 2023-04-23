# Unknown VPS

UnknownVPS is a project run by UnknownGamer & associates to give out free vpses to everyone for doing task. It can help both the team and the customer.

[Website](https://www.fogsmp.ml) is our simple website coded in basic html and available in [repository](https://github.com/unknownpersonog/unknownpersonog.github.io/).

[Client Area](https://client.fogsmp.ml/) the point this repository is about. Currently uses Discord login functionality.


## What's in this project?
1] views -> Contains the HTMLs for the webpages.

2] LICENSE -> Permitted use of this repo.

3] package.json -> Node.js packages file.

4] README.md -> Details for REPO

5] server.js -> The main server

6] env.example -> Basic env structure

7] .gitignore -> Files to be ignored

## Using this for your own use
You are allowed to use this as long as your do not use this for "illegal" purpose.
We cannot force you but please keep the UnknownVPS trademark on the footer

## Installing and using... (All steps are a must)
Download all dependencies using `npm i` and ensure if all dependencies are installed

Go to env.example, copy it and paste it a new file called .env

If you do not have Discord OAuth2 setup yet, check a video on youtube and set it up first

Fill in the required data. We are currently using SSH package due to LXC API limitations. Please use root user or feel free to modify the project and do a pull request.
The file is self-explanatory

Now, execute `npm run start` or `node server.js`

Once everything is running, close the process using Ctrl+C.

Head over to views folder and modify the brandings (avoid footer).

Start the server again using `npm run start` or `node server.js`