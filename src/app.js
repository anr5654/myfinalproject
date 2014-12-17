//import libraries 
var path = require('path'); 
var express = require('express');  
var compression = require('compression');  
var favicon = require('serve-favicon'); 
var cookieParser = require('cookie-parser'); 
var bodyParser = require('body-parser'); 
var mongoose = require('mongoose'); 
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var url = require('url');
var io = require('socket.io-client');
var socketio = require('socket.io');
var sockets = require('./socket.js');
 
var dbURL = process.env.MONGOHQ_URL || "mongodb://localhost/Chatroom";

var db = mongoose.connect(dbURL, function(error) {
    if(error) {
        console.log("Could not connect to database");
        throw error;
    }
});

var redisURL = {
    hostname: 'localhost',
    port: 6379
};

var redisPASS;

if(process.env.REDISCLOUD_URL){
    redisURL = url.parse(process.env.REDISCLOUD_URL);
    redisPASS = redisURL.auth.split(":")[1];
}

//pull in our routes
var router = require('./router.js'); 

var server;  
var port = process.env.PORT || process.env.NODE_PORT || 3000; 

var app = express(); 
app.use('/assets', express.static(path.resolve(__dirname+'../../client/'))); 
app.use(compression()); 
app.use(bodyParser.urlencoded({ 
  extended: true                
}));                            
app.use(session({
    store: new RedisStore({
        host: redisURL.hostname,
        port: redisURL.port,
        pass: redisPASS 
    }),
    secret: 'mysecretfriend',
    resave: true,
    saveUninitialized: true
}));                             
app.set('view engine', 'jade'); 
app.set('views', __dirname + '/views'); 
app.use(favicon(__dirname + '/../client/img/favicon.png')); 
app.use(cookieParser()); 

router(app); 

server = app.listen(port, function(error) { 
    if (error) {
      throw error;
    }
    console.log('Listening on port ' + port);
});

var io = socketio.listen(server);

sockets.load(io);