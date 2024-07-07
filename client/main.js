const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };
  
  const game = new Phaser.Game(config);
  let cursors;
  let player;
  let otherPlayers = {};
  const socket = io();
  
  function preload() {
    this.load.image('player', 'path/to/player.png');  // Replace with the path to your player image
  }
  
  function create() {
    cursors = this.input.keyboard.createCursorKeys();
  
    socket.on('currentPlayers', (players) => {
      Object.keys(players).forEach((id) => {
        if (id === socket.id) {
          addPlayer(this, players[id]);
        } else {
          addOtherPlayer(this, players[id], id);
        }
      });
    });
  
    socket.on('newPlayer', (playerInfo) => {
      addOtherPlayer(this, playerInfo, playerInfo.id);
    });
  
    socket.on('playerMoved', (playerInfo) => {
      otherPlayers[playerInfo.id].x = playerInfo.x;
      otherPlayers[playerInfo.id].y = playerInfo.y;
    });
  
    socket.on('disconnect', (id) => {
      if (otherPlayers[id]) {
        otherPlayers[id].destroy();
        delete otherPlayers[id];
      }
    });
  }
  
  function update() {
    if (cursors.left.isDown) {
      player.setVelocityX(-150);
    } else if (cursors.right.isDown) {
      player.setVelocityX(150);
    } else {
      player.setVelocityX(0);
    }
  
    if (cursors.up.isDown) {
      player.setVelocityY(-150);
    } else if (cursors.down.isDown) {
      player.setVelocityY(150);
    } else {
      player.setVelocityY(0);
    }
  
    socket.emit('playerMovement', { x: player.body.velocity.x, y: player.body.velocity.y });
  }
  
  function addPlayer(scene, playerInfo) {
    player = scene.physics.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5);
    player.setCollideWorldBounds(true);
  }
  
  function addOtherPlayer(scene, playerInfo, id) {
    const otherPlayer = scene.add.image(playerInfo.x, playerInfo.y, 'player').setOrigin(0.5, 0.5);
    otherPlayers[id] = otherPlayer;
  }
  