class PauseScene extends Phaser.Scene {
  constructor() {
    super("PauseScene");
  }

  create() {
    this.resumeButon = this.add.text(720, 380, 'Resume', { fontSize: '32px', fill: 'white' })
    .setInteractive()
    .on('pointerdown', () => {
      this.scene.stop('PauseScene');
      this.scene.resume('MainScene');
    });
  }
}