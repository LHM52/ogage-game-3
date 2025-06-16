// src/scenes/Stage1Scene.ts

export class Stage1Scene extends Phaser.Scene {
    constructor() {
        super({ key: 'Stage1Scene' });
    }

    preload() {
        this.load.tilemapTiledJSON('stage1', '/assets/maps/stage1.tmj');
        this.load.image('tileset', '/assets/tiles/tileset.png');
        this.load.image('tilestoke', '/assets/tiles/tilestoke.png');
    }

    create() {
        const map = this.make.tilemap({ key: 'stage1' });
        // 타일셋 이름은 tmj 파일의 "name"과, 두 번째 인자는 preload의 키와 일치해야 합니다.
        const tileset1 = map.addTilesetImage('tileset', 'tileset');
        const tileset2 = map.addTilesetImage('tilestoke', 'tilestoke');
        // 레이어 이름도 tmj 파일의 "name"과 완전히 일치해야 합니다.
        map.createLayer('Layer1', [tileset1, tileset2], 300, 100);
        map.createLayer('Layer2', [tileset1, tileset2], 300, 100);
    }
}