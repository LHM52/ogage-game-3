import Player from "../GameLogics/player";
import Enemy from "../GameLogics/enemy";
import Phaser from "phaser";
import { useGameStore } from '../store/gameStore';


type TilemapLayer = Phaser.Tilemaps.TilemapLayer;

export class Stage3Scene extends Phaser.Scene {
    player!: Player;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    enemies!: Phaser.Physics.Arcade.Group;

    private setStageCount: (count: number) => void;
    private getDeathCount: () => number;
    private setDeathCount: (count: number) => void;

    constructor() { // 생성자에서 인자를 받지 않습니다.
        super({ key: 'Stage3Scene' });
        this.setStageCount = useGameStore.getState().setStageCount;
        this.setDeathCount = useGameStore.getState().setDeathCount;
        this.getDeathCount = () => useGameStore.getState().deathCount;

        console.log("Stage3Scene: Constructor Called.");
    }

    preload() {
        // PreloaderScene에서 모든 자산을 로드했으므로 여기는 비워둡니다.

        console.log("Stage3Scene: Preload (assets loaded by PreloaderScene).");
    }

    create() {
        console.log("Stage3Scene: Create Started.");
        console.log("Stage3Scene: Checking if tilemap 'stage1' is loaded:", this.sys.game.cache.tilemap.has('stage3'));
        console.log("Stage3Scene: Checking if texture 'tileset' is loaded:", this.sys.game.textures.exists('tileset'));

        const map = this.make.tilemap({ key: 'stage3' });
        const tileset1 = map.addTilesetImage('tileset', 'tileset');
        const tileset2 = map.addTilesetImage('tilestoke', 'tilestoke');

        if (!tileset1 || !tileset2) {
            throw new Error('Tileset not found');
        }

        const mapOffsetX = 525;
        const mapOffsetY = 100;

        map.createLayer('Layer1', [tileset1, tileset2], mapOffsetX, mapOffsetY);
        const collisionLayer2 = map.createLayer('Layer2', [tileset1, tileset2], mapOffsetX, mapOffsetY);
        const collisionLayer3 = map.createLayer('Layer3', [tileset1, tileset2], mapOffsetX, mapOffsetY);

        if (collisionLayer2) collisionLayer2.setCollisionByProperty({ collides: true });
        if (collisionLayer3) collisionLayer3.setCollisionByProperty({ collides: true });
        else {
            console.warn("Stage2Scene: Collision layer 3 is null, cannot set collision properties.");
        }

        this.player = new Player(this, 620, 195, 'player');
        this.enemies = this.physics.add.group({ runChildUpdate: true });

        const enemy1 = new Enemy(this, 685, 150, 'enemy_image', 'vertical', 200, 50, 1);
        const enemy2 = new Enemy(this, 815, 150, 'enemy_image', 'vertical', 200, 50, 1);
        const enemy3 = new Enemy(this, 940, 150, 'enemy_image', 'vertical', 200, 50, 1);
        const enemy4 = new Enemy(this, 1070, 375, 'enemy_image', 'vertical', 700, 250, 1);
        const enemy5 = new Enemy(this, 1196, 150, 'enemy_image', 'vertical', 200, 50, 1);
        const enemy6 = new Enemy(this, 1196, 150, 'enemy_image', 'vertical', 200, 50, 1);
        const enemy7 = new Enemy(this, 1190, 380, 'enemy_image', 'circular-loop', 100, 150, 1, 0.02);
        const enemy8 = new Enemy(this, 1190, 380, 'enemy_image', 'circular-loop', 100, 150, 1, -0.02);
        const enemy9 = new Enemy(this, 750, 500, 'enemy_image', 'circular-loop', 100, 120, 1, 0.03);






        this.enemies.addMultiple([enemy1, enemy2, enemy3, enemy4, enemy5, enemy6, enemy7, enemy8, enemy9]);

        this.physics.add.collider(
            this.player,
            [collisionLayer2, collisionLayer3].filter(Boolean) as TilemapLayer[]
        );
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);

        this.physics.add.overlap(
            this.player,
            [collisionLayer2, collisionLayer3].filter(Boolean) as TilemapLayer[],
            this.handleClearOverlap,
            undefined,
            this
        );
    }

    update(): void {
        this.player.update(this.cursors);
    }

    handleClearOverlap(
        object1: Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile,
        object2: Phaser.GameObjects.GameObject | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | Phaser.Tilemaps.Tile
    ) {
        const player = object1 as Player;
        const tile = object2 as Phaser.Tilemaps.Tile;
        if (tile.properties && tile.properties.isClearPoint === true) {
            this.setStageCount(4);
            (player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
            (player.body as Phaser.Physics.Arcade.Body).setEnable(false);
        }
    }

    handlePlayerEnemyCollision(
        object1: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody,
        object2: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
    ) {
        const player = object1 as Player;
        object2 as Enemy;
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