import Player from "../GameLogics/player";
import Enemy from "../GameLogics/enemy";
import Phaser from "phaser";
import { useGameStore } from '../store/gameStore';

export class Stage2Scene extends Phaser.Scene {
    player!: Player;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    enemies!: Phaser.Physics.Arcade.Group;

    private setStageCount: (count: number) => void;
    private getDeathCount: () => number;
    private setDeathCount: (count: number) => void;

    constructor() { // 생성자에서 인자를 받지 않습니다.
        super({ key: 'Stage2Scene' });
        this.setStageCount = useGameStore.getState().setStageCount;
        this.setDeathCount = useGameStore.getState().setDeathCount;
        this.getDeathCount = () => useGameStore.getState().deathCount;

        console.log("Stage2Scene: Constructor Called.");
    }

    preload() {
        // PreloaderScene에서 모든 자산을 로드했으므로 여기는 비워둡니다.

        console.log("Stage2Scene: Preload (assets loaded by PreloaderScene).");
    }

    create() {
        console.log("Stage2Scene: Create Started.");
        console.log("Stage2Scene: Checking if tilemap 'stage1' is loaded:", this.sys.game.cache.tilemap.has('stage1'));
        console.log("Stage2Scene: Checking if texture 'tileset' is loaded:", this.sys.game.textures.exists('tileset'));

        const map = this.make.tilemap({ key: 'stage2' });
        const tileset1 = map.addTilesetImage('tileset', 'tileset');
        const tileset2 = map.addTilesetImage('tilestoke', 'tilestoke');

        const mapOffsetX = 525;
        const mapOffsetY = 100;

        const backgroundLayer = map.createLayer('Layer1', [tileset1, tileset2], mapOffsetX, mapOffsetY);
        const collisionLayer2 = map.createLayer('Layer2', [tileset1, tileset2], mapOffsetX, mapOffsetY);
        const collisionLayer3 = map.createLayer('Layer3', [tileset1, tileset2], mapOffsetX, mapOffsetY);

        if (collisionLayer2) collisionLayer2.setCollisionByProperty({ collides: true });
        if (collisionLayer3) collisionLayer3.setCollisionByProperty({ collides: true });
        else {
            console.warn("Stage2Scene: Collision layer 3 is null, cannot set collision properties.");
        }

        this.player = new Player(this, 650, 350, 'player');
        this.enemies = this.add.group({ runChildUpdate: true });

        const enemy2 = new Enemy(this, 814, 350, 'enemy_image', 'vertical', 700, 150, -1);
        const enemy1 = new Enemy(this, 747, 350, 'enemy_image', 'vertical', 700, 150, 1);
        const enemy3 = new Enemy(this, 875, 350, 'enemy_image', 'vertical', 700, 150, 1);
        const enemy4 = new Enemy(this, 940, 350, 'enemy_image', 'vertical', 700, 150, -1);
        const enemy5 = new Enemy(this, 1005, 350, 'enemy_image', 'vertical', 700, 150, 1);
        const enemy6 = new Enemy(this, 1070, 350, 'enemy_image', 'vertical', 700, 150, -1);
        const enemy7 = new Enemy(this, 1130, 350, 'enemy_image', 'vertical', 700, 150, 1);
        const enemy8 = new Enemy(this, 1195, 350, 'enemy_image', 'vertical', 700, 150, -1);




        this.enemies.addMultiple([enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7, enemy8]);

        this.physics.add.collider(this.player, [collisionLayer2, collisionLayer3].filter(Boolean));
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);

        this.physics.add.overlap(this.player, [collisionLayer2, collisionLayer3].filter(Boolean), this.handleClearOverlap, null, this);

        this.cursors = this.input.keyboard!.createCursorKeys();
    }

    update(time: number, delta: number): void {
        this.player.update(this.cursors);
    }

    handleClearOverlap(player: Player, tile: Phaser.Tilemaps.Tile) {
    console.log('Overlap detected with tile:', tile);
    console.log('Tile properties:', tile.properties);
    if (tile.properties && tile.properties.isClearPoint === true) {
        console.log(`Stage2Scene: 클리어 지점 도달! (Zustand로 다음 스테이지 업데이트)`);
        this.setStageCount(3); 
        (player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
        (player.body as Phaser.Physics.Arcade.Body).setEnable(false);
    }
}

    handlePlayerEnemyCollision(player: Player, enemy: Enemy) {
        console.log('플레이어와 적 충돌!');
        player.die();
        const body = player.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        body.setEnable(false);
        const currentDeathCount = this.getDeathCount();
        this.setDeathCount(currentDeathCount + 1);


        this.sound.play('death_sound', { volume: 0.2, loop: false });

        this.tweens.add({
            targets: player, alpha: 0, duration: 1000, ease: 'Linear',
            onComplete: () => {
                player.setActive(false).setVisible(false);
                this.time.delayedCall(100, () => {
                    player.alpha = 1; player.respawn(); body.setEnable(true);
                }, [], this);
            }
        });
    }
}