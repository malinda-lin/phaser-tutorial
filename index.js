/* eslint-disable no-use-before-define */

const config = {
  // type(renderer) : Phaser.AUTO means if Phaser.WEBGL fails it uses Phaser.CANVAS
  type: Phaser.AUTO,
  // size of the game (resolution)
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 300},
      debug: false
    }
  },
  scene: {
    // preload function: phaser automatically looks for preload when start and loads everything inside it
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('sky', '../assets/sky.png');
  this.load.image('ground', '../assets/platform.png');
  this.load.image('star', '../assets/star.png');
  this.load.image('bomb', '../assets/bomb.png');
  this.load.spritesheet('dude', '../assets/dude.png', {
    frameWidth: 32,
    frameHeight: 48
  });
}

let platforms;
let player;

function create() {
  // images added in order, first images added will be on the bottom, last image will be on top
  // this.add.image(x(width), y(height), item)
  this.add.image(400, 300, 'sky');
  // Arcade Physics(two types of physics bodies): Dynamic and Static
  platforms = this.physics.add.staticGroup();
  platforms
    .create(400, 568, 'ground')
    .setScale(2)
    .refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');
  // create sprite
  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.3);
  // prevents the player from running/jumping out of the scene dimensions
  player.setCollideWorldBounds(true);
  // player.body.setGravityY();
  this.physics.add.collider(player, platforms);

  this.anims.create({
    // left spritesheet
    key: 'left',
    // left: 0 - 3, turn: 4, right: 5 - 8
    frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
    frameRate: 10,
    // -1 loops
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{key: 'dude', frame: 4}],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
    frameRate: 10,
    repeat: -1
  });
}

let cursors;

function update() {
  cursors = this.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);

    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}
