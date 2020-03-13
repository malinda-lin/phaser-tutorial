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
  this.load.image('sky', './assets/sky.png');
  this.load.image('ground', './assets/platform.png');
  this.load.image('star', './assets/star.png');
  this.load.image('bomb', './assets/bomb.png');
  this.load.spritesheet('dude', './assets/dude.png', {
    frameWidth: 32,
    frameHeight: 48
  });
}

let platforms;
let player;
let stars;
let score = 0;
let level = 1;
let scoreText;
let levelText;
let bombs;
let gameOver = false;

function create() {
  // images added in order, first images added will be on the bottom, last image will be on top
  // this.add.image(x(width), y(height), item)
  this.add.image(400, 300, 'sky');
  // --------------------Platforms------------------------------
  // Arcade Physics(two types of physics bodies): Dynamic and Static
  platforms = this.physics.add.staticGroup();
  platforms
    .create(400, 568, 'ground')
    .setScale(2)
    .refreshBody();
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');
  // ---------------------Sprite---------------------------------
  player = this.physics.add.sprite(100, 450, 'dude');
  player.setBounce(0.3);
  // prevents the player from running/jumping out of the scene dimensions
  player.setCollideWorldBounds(true);
  // player.body.setGravityY();
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
  // ----------------------Stars-------------------------------
  // this.physics.add.group is a dynamic group
  stars = this.physics.add.group({
    // texture key = star img
    key: 'star',
    // one star is auto created, 11 makes 12 in total
    repeat: 11,
    // x, y are the starting positions, stepX is how far away each repeat will be
    setXY: {x: 12, y: 0, stepX: 70}
  });
  stars.children.iterate(function(child) {
    // .setBounceY sets how much they bounce once they make collision contact
    // Phaser.Math.FloatBetween(0.4, 0.8) produces random numbers range inputted
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });
  // ---------------------Bombs-----------------------------
  // if no object is passed into .group() no objects will be created automatically
  bombs = this.physics.add.group();
  // ---------------------Score & Level-----------------------------
  scoreText = this.add.text(16, 60, 'Score: 0', {
    fontSize: '30px',
    fontFamily: '"lato"',
    fill: '#fff'
  });
  levelText = this.add.text(16, 16, 'Level: 1', {
    fontSize: '40px',
    fontFamily: '"lato',
    fill: '#fff'
  });
  // ---------------------interactions------------------------
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
  function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
  }

  // .overlap(firstObj, secondObj, collideCallback, processCallback, callbackContext)
  this.physics.add.overlap(player, stars, collectStar, null, this);
  function collectStar(player, star) {
    // parent Game Object is made inactive and invisible, star is removed from display
    star.disableBody(true, true);
    // incements score on collision
    score += 1;
    // .setText changes the text displayed, can take template literal or string concat
    scoreText.setText(`Score: ${score}`);
    // when .countActive(no more stars) stars become visible again
    if (stars.countActive(true) === 0) {
      level += 1;
      levelText.setText(`Level: ${level}`);
      stars.children.iterate(function(child) {
        // .enableBody(boolean, x position, y position)
        // child.x is the x coordinate
        // 0 is for the y coordinate
        child.enableBody(true, child.x, 0, true, true);
      });
      // creates # of children depending on < | > 400
      const x =
        // player.x is the x coordinate
        // bomb.x will be created on the opposite side the player is on when function is triggered
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);
      // .create(x, y, texture)
      const bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }
}

let cursors;
let gameOverText;

function update() {
  if (gameOver) {
    gameOverText = this.add.text(200, 300, 'GAME OVER!!', {
      fontSize: '70px',
      fontFamily: '"lato"',
      color: '#ff0000'
    });
    return;
  }
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
