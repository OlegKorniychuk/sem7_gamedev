class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload () {
    this.load.image('sky', 'assets/sky.png');
  }

  create() {
    this.add.image(800, 450, 'sky').setScale(2);

    this.add.text(200, 600, 'Move the Dude  with arrows', { fontSize: '32px', fill: 'black' });
    this.add.text(200, 640, 'Arrow down to powerslam', { fontSize: '32px', fill: 'black' });
    this.add.text(200, 680, 'Press "Esc" to pause', { fontSize: '32px', fill: 'black' });
    this.startButton = this.add.text(720, 380, 'Start Game', { fontSize: '32px', fill: 'black' })
    .setInteractive()
    .on('pointerdown', () => {
      this.scene.start('MainScene');
    });
  }
}