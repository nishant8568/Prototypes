Video Chat APP using WebRTC & Socket.io
=======


Please run following commands to run this front end and application

##Prerequisite:
1. Download and install bower
2. Download and install Gulp
3. Download and install NPM/nodejs
4. Need any webserver preferably nginx if needed otherwise just use inbuilt express static webserver

##Commands to run: (Inside the project root directory)
1. bower install
2. npm install

##On Development:

- To Inject bower dependencies, after bower install, execute
```
gulp inject
```

- To Run the application and watch for changes execute
```
gulp serve
```

##On Production:

- To build the application to dist folder
```
gulp build
```
- To run the application, under **dist folder**, execute below command using node or PM2 or forever
```
 node server/app.js
```