import Phaser from "phaser";

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight - 150,
    backgroundColor: "#222",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
};

export default gameConfig;