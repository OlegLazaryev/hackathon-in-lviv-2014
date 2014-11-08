
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    io = require('socket.io');
    games = require('./libs/game');

var app = module.exports = express.createServer(),
    io = io.listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

// Messages

var totalUsers = 0,
    stepID = 0,
    tilesCount = 10,
    tiles = [],
    friendsGroup = [];


io.sockets.on('connection', function (socket) {
  var game = new games.Game()
  // new id
  var thisID = getID();
  // step users++
  addUser();
  game.start({players: friendsGroup, tileCount: tilesCount, io: io})
  // new connection ALL
  io.sockets.emit('connected', { connections: totalUsers });
  // new connection friends
  socket.broadcast.emit('new friend', { friend: thisID });
  // new connection self
  socket.emit('init', { player:thisID, friends: friendsGroup });
  io.sockets.emit('tiles', game.tiles);
  // disconnect friends
  socket.on('disconnect', function (){
      removeUser(thisID);
      socket.broadcast.emit('bye friend', {connections: totalUsers, friend: thisID});
  });
  // mouse move
  socket.on('move',function(data){
      socket.broadcast.emit('move', data);
  });
  socket.on('tile clicked', function (data){
      game.clicked(data)
  });
  //console.log(friendsGroup);
});

// Functions

function getID() {
    friendsGroup.push(++stepID);
    return stepID;
}

function addUser(){
    totalUsers++;
}

function removeUser(thisID){
    friendsGroup = removeFromArray(thisID,friendsGroup);
    totalUsers--;
}

// Helpers

function removeFromArray(string, array) {
  var i = 0;
  for(i in array){
    if(array[i] === string){
      array.splice(i,1);
    }
  }
  return array;
}


app.listen(80);
