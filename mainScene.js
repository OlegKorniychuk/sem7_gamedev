class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
  }

  // loading images
  preload () {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('powerslam', 'assets/powerslam.png');
    this.load.spritesheet('dude', 
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create () {
    this.cursors = this.input.keyboard.createCursorKeys();

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
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    // player sprite
    this.player = this.physics.add.sprite(100, 450, 'dude');

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.platforms, () => {
      if (this.isPowerslamming) {
        const powerslamEffect = this.add.image(this.player.x, this.player.y - 24, 'powerslam').setScale(2); // 24 - halve of the powerslam sprites height to account for resizing
    
        this.tweens.add({
          targets: powerslamEffect,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            powerslamEffect.destroy();
          }
        });
    
        this.isPowerslamming = false;
      }
    });

    // this.player animations
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
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.stars, this.platforms);

    function collectStar(player, star) {
      star.disableBody(true, true);
    
      updateScore(10);
    
      if (this.stars.countActive(true) === 0) {
        this.stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
        });
    
        const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
        const bomb = this.bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      }
    }

    this.physics.add.overlap(this.player, 
      this.stars, 
      collectStar, 
      null, 
      this
    );

    // bombs
    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.collider(
      this.player, 
      this.bombs, 
      () => {
        this.physics.pause();

        this.player.setTint(0xff0000);
    
        this.player.anims.play('turn');
    
        this.gameOver = true;
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
  update () {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }
      
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    if (this.cursors.down.isDown & this.powerslamReady) {
      this.player.setVelocityY(500)

      this.powerslamReady = false;
      this.powerslamCharging = 0;
      this.powerslamStatus.setText('Powerslam: Charging (0%)');
      this.isPowerslamming = true

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
}