// src/GameLogics/PreloaderScene.ts
import Phaser from 'phaser';
import { Stage1Scene } from '../Scene/Stage1Scene';
import { Stage2Scene } from '../Scene/Stage2Scene';
import { Stage3Scene } from '../Scene/Stage3Scene';
import { Stage4Scene } from '../Scene/Stage4Scene';


type PreloaderReadyCallback = () => void;

export class PreloaderScene extends Phaser.Scene {
    private onPreloaderReady?: PreloaderReadyCallback;

    constructor() {
        super({ key: 'PreloaderScene' });
        console.log("PreloaderScene: Constructor Called.");
    }

    init(data: { onPreloaderReady?: PreloaderReadyCallback }) {
        this.onPreloaderReady = data.onPreloaderReady;
        console.log("PreloaderScene: init() called. Callback received:", typeof this.onPreloaderReady);
    }

    preload() {
        console.log("PreloaderScene: Preload Started. Loading all game assets...");

        this.load.tilemapTiledJSON('stage1', '/assets/maps/stage1.tmj');
        this.load.tilemapTiledJSON('stage2', '/assets/maps/stage2.tmj');
        this.load.tilemapTiledJSON('stage3', '/assets/maps/stage3.tmj');
        this.load.tilemapTiledJSON('stage4', '/assets/maps/stage4.tmj');



        this.load.image('tileset', '/assets/tiles/tileset.png');
        this.load.image('tilestoke', '/assets/tiles/tilestoke.png');
        this.load.spritesheet('player', '/assets/objects/playersheet.png', {
            frameWidth: 32,
            frameHeight: 50,
        });
        this.load.image('enemy_image', '/assets/objects/enemy.png');

        this.load.audio('death_sound', '/assets/sounds/death_sound.mp3');

        this.load.on('fileerror', (file: Phaser.Loader.File) => {
            console.error(`PreloaderScene: Failed to load file: ${file.src} (${file.type})`);
        });
    }

    create() {
        console.log("PreloaderScene: create() called.");

        this.scene.add('Stage1Scene', Stage1Scene, false);
        this.scene.add('Stage2Scene', Stage2Scene, false);
        this.scene.add('Stage2Scene', Stage3Scene, false);
        this.scene.add('Stage2Scene', Stage4Scene, false);



        console.log("PreloaderScene: Scenes added. Calling callback...");
        this.onPreloaderReady?.();
    }
}
