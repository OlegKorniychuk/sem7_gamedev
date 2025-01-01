// setup
let config = {
  type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let platforms
let score = 0;
let scoreText;

// loading images
function preload () {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 
    'assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
  );
}

function create () {
  cursors = this.input.keyboard.createCursorKeys();

  const updateScore = (score) => {
    this.score += score;
    this.scoreText.setText('Score: ' + this.score);
  
    const scoreTextX = this.scoreText.x + this.scoreText.width + 20;
    const scoreTextY = Phaser.Math.Between(this.scoreText.y - 10, this.scoreText.y + 10)
    const bonusText = this.add.text(scoreTextX, scoreTextY, '+10', {
      fontSize: '32px',
      fill: '#ff0000'
    });
  
    this.tweens.add({
      targets: bonusText,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        bonusText.destroy();
      }
    });
  }

  // background
  this.add.image(400, 300, 'sky');

  // platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  // player sprite
  player = this.physics.add.sprite(100, 450, 'dude');

  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.physics.add.collider(player, platforms);

  // player animations
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // stars
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  this.physics.add.collider(stars, platforms);

  function collectStar(player, star) {
    star.disableBody(true, true);
  
    updateScore(10);
  
    if (stars.countActive(true) === 0) {
      stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      });
  
      const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
  
      const bomb = bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  this.physics.add.overlap(player, 
    stars, 
    collectStar, 
    null, 
    this
  );

  // bombs
  bombs = this.physics.add.group();

  this.physics.add.collider(bombs, platforms);

  this.physics.add.collider(
    player, 
    bombs, 
    () => {
      this.physics.pause();

      player.setTint(0xff0000);
  
      player.anims.play('turn');
  
      gameOver = true;
    }, 
    null, 
    this
  );

  // score
  this.score = 0;
  this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

  // powerslam status
  this.powerslamReady = true
  this.powerslamCharging = 0;
  this.powerslamStatus = this.add.text(16, 52, 'Powerslam: Ready', { fontSize:'32px', fill: '#000' })
}

// player movement
function update () {
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

  if (cursors.down.isDown & this.powerslamReady) {
    player.setVelocityY(500)
    this.powerslamReady = false;
    this.powerslamCharging = 0;
    this.powerslamStatus.setText('Powerslam: Charging (0%)');

    this.time.addEvent({
      delay: 500,
      repeat: 9,
      callback: () => {
        this.powerslamCharging += 10;
        this.powerslamStatus.setText(`Powerslam: Charging (${this.powerslamCharging}%)`);
        if (this.powerslamCharging >= 100) {
          this.powerslamReady = true;
          this.powerslamStatus.setText('Powerslam: Ready');
        }
      },
      callbackScope: this
    });
  }
}