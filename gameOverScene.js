class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOverScene");
  }

  preload () {
    this.load.image('sky', 'assets/sky.png');
  }

  create(score) {
    this.add.image(400, 300, 'sky');

    this.gameOver = this.add.text(350, 300, 'Game Over', { fontSize: '32px', fill: 'black' })
    this.score = this.add.text(350, 340, `Score: ${score}`, { fontSize: '32px', fill: 'black' })
    this.startButton = this.add.text(350, 380, 'Start Game', { fontSize: '32px', fill: 'black' })
    .setInteractive()
    .on('pointerdown', () => {
      this.scene.start('MainScene');
    });
  }
}