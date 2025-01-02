// setup
let config = {
  type: Phaser.AUTO,
    width: 1600,
    height: 900,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, MainScene, GameOverScene, PauseScene]
};

let game = new Phaser.Game(config);
