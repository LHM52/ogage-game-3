import Phaser from "phaser";

const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#b4b5fe",
    parent: "phaser-container", 
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT, // 이 부분을 FIT으로 변경
        autoCenter: Phaser.Scale.CENTER_BOTH, // 캔버스를 중앙에 배치
        width: '100%', // 게임의 논리적인 해상도 (픽셀 단위로 고정)
        height: '100%', // 게임의 논리적인 해상도 (픽셀 단위로 고정)
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
        },
    },
};

export default gameConfig;