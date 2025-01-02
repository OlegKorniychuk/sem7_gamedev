class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  preload () {
    this.load.image('sky', 'assets/sky.png');
  }

  create(score) {
    this.add.image(800, 450, 'sky').setScale(2);

    this.gameOver = this.add.text(720, 340, 'Game Over', { fontSize: '32px', fill: 'black' })
    this.score = this.add.text(720, 380, `Score: ${score}`, { fontSize: '32px', fill: 'black' })
    this.startButton = this.add.text(715, 420, 'Main Menu', { fontSize: '32px', fill: 'black' })
    .setInteractive()
    .on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}