var WebSocketServer = require('websocket').server;
var http = require('http');
var ecstatic = require('ecstatic');

var server = http.createServer(ecstatic({
  root: __dirname + '/app',
  autoindex: true,
  defaultExt: 'html'
}));
server.listen(process.env.PORT || 8080);
var wsServer = new WebSocketServer({ httpServer: server });

var playlist = {
  clients: [],
  items: [
    'https://soundcloud.com/rjdjme/map-tile-open',
    'https://soundcloud.com/rjdjme/map-tile-click',
    'https://soundcloud.com/asaf-avidan/reckoning-song-classical',
    'https://soundcloud.com/cityslang/dear-reader-down-under-mining'
  ]
};

var id = 0;

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  connection.id = id++;
  var index = playlist.clients.push(connection) - 1;
  console.log('request '+connection.id);

  function send(client, event, value) {
    console.log('message to   ' + client.id, event, value);
    client.sendUTF(JSON.stringify({
      event: event,
      value: value
    }));
  }

  function broadcast(event, value) {
    playlist.clients.forEach(function(client) {
      if(client != connection) {
        send(client, event, value);
      }
    });
  }

  send(connection, 'reset', playlist.items);
  if('playing' in playlist) {
    send(connection, 'play', playlist.playing);
  }

  connection.on('message', function(message) {
    var json;
    if (message.type === 'utf8') {
      try {
        json = JSON.parse(message.utf8Data);
      } catch (e) {
        console.log('This doesn\'t look like a valid JSON: ', message.utf8Data);
        return;
      }
      console.log('message from ' + connection.id, json.event, json.value);
      switch(json.event) {
        case 'add':
          playlist.items.push(json.value);
          broadcast('add', json.value);
          break;
        case 'remove':
          playlist.items.splice(playlist.items.indexOf(json.value), 1);
          broadcast('remove', json.value);
          break;
        case 'play':
          playlist.playing = json.value;
          broadcast('play', json.value);
          break;
        case 'stop':
          delete playlist.playing;
          broadcast('stop', json.value);
          break;
      }
    }
  });

  connection.on('close', function() {
    playlist.clients.splice(index, 1);
    console.log('close ' + connection.id, playlist.clients.length);
  });
});
