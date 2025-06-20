import Player from "../GameLogics/player";
import Enemy from "../GameLogics/Enemy";
import Phaser from "phaser";
import { useGameStore } from '../store/gameStore';


export class Stage3Scene extends Phaser.Scene {
    player!: Player;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    enemies!: Phaser.Physics.Arcade.Group;

    private setStageCount: (count: number) => void;
    private getDeathCount: () => number;
    private setDeathCount: (count: number) => void;

    constructor() {
        super({ key: 'Stage3Scene' });
        this.setStageCount = useGameStore.getState().setStageCount;
        this.setDeathCount = useGameStore.getState().setDeathCount;
        this.getDeathCount = () => useGameStore.getState().deathCount;

        console.log("Stage3Scene: Constructor Called.");
    }

    preload() {
        console.log("Stage3Scene: Preload (assets loaded by PreloaderScene).");
    }

    create() {
        console.log("Stage3Scene: Create Started.");
        console.log("Stage3Scene: Checking if tilemap 'stage3' is loaded:", this.sys.game.cache.tilemap.has('stage3'));
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
        else console.warn("Stage3Scene: Collision layer 3 is null, cannot set collision properties.");

        this.player = new Player(this, 620, 195, 'player');
        this.enemies = this.physics.add.group({ runChildUpdate: true });

        const enemiesArray = [
            new Enemy(this, 685, 150, 'enemy_image', 'vertical', 200, 50, 1),
            new Enemy(this, 815, 150, 'enemy_image', 'vertical', 200, 50, 1),
            new Enemy(this, 940, 150, 'enemy_image', 'vertical', 200, 50, 1),
            new Enemy(this, 1070, 375, 'enemy_image', 'vertical', 700, 250, 1),
            new Enemy(this, 1196, 150, 'enemy_image', 'vertical', 200, 50, 1),
            new Enemy(this, 1196, 150, 'enemy_image', 'vertical', 200, 50, 1),
            new Enemy(this, 1190, 380, 'enemy_image', 'circular-loop', 100, 150, 1, 0.02),
            new Enemy(this, 1190, 380, 'enemy_image', 'circular-loop', 100, 150, 1, -0.02),
            new Enemy(this, 750, 500, 'enemy_image', 'circular-loop', 100, 120, 1, 0.03)
        ];
        this.enemies.addMultiple(enemiesArray);

        const layers = [collisionLayer2, collisionLayer3].filter(Boolean) as Phaser.Tilemaps.TilemapLayer[];

        this.physics.add.collider(this.player, layers);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);

        this.physics.add.overlap(this.player, layers, this.handleClearOverlap, undefined, this);

        this.cursors = this.input.keyboard!.createCursorKeys();
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
            this.sound.play('clear_sound', { volume: 0.2, loop: false });

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
        player.die();
        const body = player.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
        body.setEnable(false);

        const currentDeathCount = this.getDeathCount();
        this.setDeathCount(currentDeathCount + 1);

        this.sound.play('death_sound', { volume: 0.2, loop: false });

        this.tweens.add({
            targets: player,
            alpha: 0,
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                player.setActive(false).setVisible(false);
                this.time.delayedCall(100, () => {
                    player.alpha = 1;
                    player.respawn();
                    body.setEnable(true);
                }, [], this);
            }
        });
    }
}
