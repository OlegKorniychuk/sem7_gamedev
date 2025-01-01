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
    this.load.spritesheet('arrow', 
      'assets/arrow.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  create () {
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause('MainScene');
      this.scene.launch('PauseScene');
    }, this);

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

    const death = () => {
      this.physics.pause();

      this.player.setTint(0xff0000);
  
      this.player.anims.play('turn');
  
      this.gameOver = true;

      this.time.addEvent({
        delay: 700,
        callback: () => {
          this.scene.stop('MainScene')
          this.scene.start('GameOverScene', this.score);
        },
        callbackScope: this,
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

    // arrow
    this.anims.create({
      key: 'arrow_left',
      frames: [ { key: 'arrow', frame: 0 } ],
      frameRate: 20
    });
  
    this.anims.create({
      key: 'arrow_right',
      frames: [ { key: 'arrow', frame: 1 } ],
      frameRate: 20
    });
  
    this.arrows = this.physics.add.group({ allowGravity: false });

    const spawnArrow = () => {
      const startFromLeft = Phaser.Math.Between(0, 1) === 0;
      const x = startFromLeft ? 0 : 800; //
      const y = Phaser.Math.Between(100, 500);
      const warningText = this.add.text(startFromLeft ? 0 : 760, y, '!', {
        fontSize: '48px',
        fill: '#ff0000',
        strokeThickness: 10
      });
    
      this.tweens.add({
        targets: warningText,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
          warningText.destroy();

          const velocity = startFromLeft ? 250 : -250;
          const arrow = this.arrows.create(x, y, 'arrow');
        
          arrow.setVelocityX(velocity);
          arrow.setCollideWorldBounds(false);
          arrow.setBounce(1);
        
          if (startFromLeft) {
            arrow.anims.play('arrow_right');
          } else {
            arrow.anims.play('arrow_left');
          }
        
          arrow.checkWorldBounds = true;
          arrow.outOfBoundsKill = true;
        }
      });
    }

    this.time.addEvent({
      delay: Phaser.Math.Between(1000, 3000),
      callback: spawnArrow,
      callbackScope: this,
      loop: true,
    });

    this.physics.add.collider(
      this.player, 
      this.arrows, 
      death, 
      null, 
      this
    );

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
      death, 
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