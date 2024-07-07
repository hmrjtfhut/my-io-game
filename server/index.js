const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const players = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  players[socket.id] = { x: 0, y: 0 };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, x: 0, y: 0 });

  socket.on('playerMovement', (movementData) => {
    players[socket.id].x += movementData.x;
    players[socket.id].y += movementData.y;
    io.emit('playerMoved', { id: socket.id, x: players[socket.id].x, y: players[socket.id].y });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    delete players[socket.id];
    io.emit('disconnect', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});
