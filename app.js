var express = require('express');
var app = express();
var io = require('socket.io')();

// … Configure Express, and register necessary route handlers
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
// …

// … Socket.io config
const change = (users) => {
    io.emit('info', users);
};

io.listen(4000);
// …

// … PeerJS config
var peer = require('peer').ExpressPeerServer(
    app.listen(process.env.PORT || 3000, () => console.log('listening')),
    {
        debug: true,
    }
);

var users = [];

peer.on('connection', (client) => {
    if (!users.includes(client.id)) {
        users.push(client.id);
    }
    change(users);
});

peer.on('disconnect', (client) => {
    if (users.includes(client.id)) {
        users.splice(users.indexOf(client.id), 1);
    }
    change(users);
});
// …

app.use('/peerjs', peer);
