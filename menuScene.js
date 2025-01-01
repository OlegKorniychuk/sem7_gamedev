class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload () {
    this.load.image('sky', 'assets/sky.png');
  }

  create() {
    this.add.image(400, 300, 'sky');

    this.startButton = this.add.text(350, 300, 'Start Game', { fontSize: '32px', fill: 'black' })
    .setInteractive()
    .on('pointerdown', () => {
      this.scene.start('MainScene');
    });
  }
}