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
      { frameWidth: 32, frameHeight: 12 }
    );
    this.load.spritesheet('baddie', 
      'assets/baddie.png',
      { frameWidth: 48, frameHeight: 48 }
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
      const bonusText = this.add.text(scoreTextX, scoreTextY, `+${score}`, {
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
    this.add.image(800, 450, 'sky').setScale(2);

    // platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(800, 840, 'ground').setScale(4).refreshBody();

    this.platforms.create(600, 500, 'ground');
    this.platforms.create(1200, 650, 'ground');
    this.platforms.create(1300, 450, 'ground');
    this.platforms.create(50, 350, 'ground');
    this.platforms.create(750, 320, 'ground');
    this.platforms.create(100, 630, 'ground');

    // player sprite
    this.player = this.physics.add.sprite(800, 650, 'dude');

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.platforms, () => {
      if (this.isPowerslamming) {
        const powerslamEffect = this.add.image(this.player.x, this.player.y - 24, 'powerslam').setScale(2); // 24 - halve of the powerslam sprite's height to account for resizing
    
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

    function isArrowPositionValid(y, platforms) {
      let isValid = true;
    
      platforms.children.iterate((platform) => {
        const platformBounds = platform.getBounds();
    
        if (
          y >= platformBounds.top &&
          y <= platformBounds.bottom
        ) {
          isValid = false;
        }
      });
    
      return isValid;
    }

    const spawnArrow = () => {
      let attempts = 10;
      let x, y, startFromLeft

      while (attempts > 0) {
        startFromLeft = Phaser.Math.Between(0, 1) === 0;
        x = startFromLeft ? 0 : 1600;
        y = Phaser.Math.Between(100, 700);
        attempts--;

        if (isArrowPositionValid(y, this.platforms)) {
          break;
        }
      } 

      if (attempts == 0) return;

      const warningText = this.add.text(startFromLeft ? 0 : 1560, y - 24, '!', {
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
      delay: Phaser.Math.Between(2000, 3000),
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
      setXY: { x: 12, y: 0, stepX: Phaser.Math.Between(100, 150) }
    });

    this.stars.children.iterate((child) => {
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

    // enemy

    this.anims.create({
      key: 'enemy_left',
      frames: this.anims.generateFrameNumbers('baddie', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    
    this.anims.create({
      key: 'enemy_right',
      frames: this.anims.generateFrameNumbers('baddie', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.enemies = this.physics.add.group();
    this.physics.add.collider(this.enemies, this.platforms);

    const spawnEnemy = () => {
      const platformArray = this.platforms.getChildren().slice(1);
      const randomPlatform = Phaser.Utils.Array.GetRandom(platformArray);
      const platformBounds = randomPlatform.getBounds();
      
      let spawnX;
      let spawnFromLeft = false;
      if (platformBounds.left + 5 <= 5) {
        spawnX = platformBounds.left + 10
        spawnFromLeft = true;
      } else {
        spawnX = platformBounds.right - 10
      }
    
      const enemy = this.enemies.create(
        spawnX,
        platformBounds.top - 20,
        'enemy'
      );
    
      enemy.setBounce(0);
      enemy.setCollideWorldBounds(false);
      enemy.setGravityY(0);
      enemy.body.allowGravity = false;
    
      enemy.direction = spawnFromLeft ? -1 : 1; // Move right if spawned from left, and vice versa
      enemy.setVelocityX(enemy.direction * 100);
    
      if (enemy.direction < 0) {
        enemy.anims.play('enemy_left', true);
      } else {
        enemy.anims.play('enemy_right', true);
      }
    };

    spawnEnemy()

    this.physics.add.collider(
      this.player, 
      this.enemies, 
      (player, enemy) => {
        if (!this.isPowerslamming) {
          death();
        } else {
          enemy.destroy()
          updateScore(50)
          spawnEnemy()
        }
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

    // prevent enemy from falling
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.direction < 0) {
        enemy.anims.play('enemy_left', true);
      } else {
        enemy.anims.play('enemy_right', true);
      }

      const enemyBounds = enemy.getBounds();
      const platform = this.platforms.getChildren().find((plat) => {
        const platformBounds = plat.getBounds();
        return (
          enemyBounds.centerX >= platformBounds.left + 10 &&
          enemyBounds.centerX <= platformBounds.right - 10 &&
          enemyBounds.bottom <= platformBounds.top + 5 &&
          enemyBounds.bottom >= platformBounds.top - 10
        );
      });

      if (!platform || enemy.body.checkWorldBounds()) {
        enemy.x -= 10 * enemy.direction
        enemy.direction *= -1;
        enemy.setVelocityX(enemy.direction * 100);
      }
    });
  }
}