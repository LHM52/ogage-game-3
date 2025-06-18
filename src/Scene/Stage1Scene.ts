import Player from "../GameLogics/player";
import Enemy from "../GameLogics/enemy"; // Enemy import 경로가 올바른지 다시 확인하세요.
import Phaser from "phaser";
import { useGameStore } from '../store/gameStore';

type TilemapLayer = Phaser.Tilemaps.TilemapLayer;

export class Stage1Scene extends Phaser.Scene {
    player!: Player;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    enemies!: Phaser.Physics.Arcade.Group; // 물리 그룹으로 선언

    private setStageCount: (count: number) => void;
    private getDeathCount: () => number;
    private setDeathCount: (count: number) => void;

    constructor() {
        super({ key: 'Stage1Scene' });
        this.setStageCount = useGameStore.getState().setStageCount;
        this.setDeathCount = useGameStore.getState().setDeathCount;
        this.getDeathCount = () => useGameStore.getState().deathCount;

        console.log("Stage1Scene: Constructor Called.");
    }

    preload() {
        console.log("Stage1Scene: Preload (assets loaded by PreloaderScene).");
    }

    create() {
        console.log("Stage1Scene: Create Started.");
        console.log("Stage1Scene: Checking if tilemap 'stage1' is loaded:", this.sys.game.cache.tilemap.has('stage1'));
        console.log("Stage1Scene: Checking if texture 'tileset' is loaded:", this.sys.game.textures.exists('tileset'));

        const map = this.make.tilemap({ key: 'stage1' });
        const tileset1 = map.addTilesetImage('tileset', 'tileset');
        const tileset2 = map.addTilesetImage('tilestoke', 'tilestoke');

        if (!tileset1 || !tileset2) {
            throw new Error('Tileset not found');
        }

        const mapOffsetX = 500;
        const mapOffsetY = 0;

        map.createLayer('Layer1', [tileset1, tileset2], mapOffsetX, mapOffsetY);
        const collisionLayer2 = map.createLayer('Layer2', [tileset1, tileset2], mapOffsetX, mapOffsetY);
        const collisionLayer3 = map.createLayer('Layer3', [tileset1, tileset2], mapOffsetX, mapOffsetY);

        if (collisionLayer2) collisionLayer2.setCollisionByProperty({ collides: true });
        if (collisionLayer3) collisionLayer3.setCollisionByProperty({ collides: true });
        else {
            console.warn("Stage1Scene: Collision layer 3 is null, cannot set collision properties.");
        }

        this.player = new Player(this, 625, 150, 'player');

        // Physics Group으로 변경
        this.enemies = this.physics.add.group({ runChildUpdate: true });

        const enemy1 = new Enemy(this, 940, 287, 'enemy_image', 'horizontal', 400, 350, 1);
        const enemy2 = new Enemy(this, 940, 350, 'enemy_image', 'horizontal', 400, 350, -1);
        const enemy3 = new Enemy(this, 940, 417, 'enemy_image', 'horizontal', 400, 350, 1);
        const enemy4 = new Enemy(this, 940, 480, 'enemy_image', 'horizontal', 400, 350, -1);

        this.enemies.addMultiple([enemy1, enemy2, enemy3, enemy4]);

        // **추가: 모든 적의 물리 바디가 활성화되어 있는지 확인 및 디버깅 로그**
        this.enemies.children.entries.forEach((enemyChild) => {
            const enemy = enemyChild as Enemy;
            const body = enemy.body as Phaser.Physics.Arcade.Body;
            if (body) {
                // 혹시라도 비활성화되어 있다면 강제로 활성화
                if (!body.enable) {
                    body.setEnable(true);
                    console.warn(`Enemy ${enemy.x},${enemy.y}: Body was disabled, re-enabling.`);
                }
                // 초기 속도 확인 (디버깅용)
                console.log(`Enemy ${enemy.x},${enemy.y} (Type: ${enemy.patrolType}) initial velocity: X=${body.velocity.x}, Y=${body.velocity.y}`);
            }
        });


        // 플레이어와 충돌 레이어 필터링
        const collidableLayers = [collisionLayer2, collisionLayer3].filter(Boolean) as TilemapLayer[];

        this.physics.add.collider(
            this.player,
            collidableLayers
        );
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, undefined, this);

        this.physics.add.overlap(
            this.player,
            collidableLayers, // 수정: 필터링된 레이어 사용
            this.handleClearOverlap,
            undefined,
            this
        );

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
            console.log(`Stage1Scene: 클리어 지점 도달! (Zustand로 다음 스테이지 업데이트)`);
            this.setStageCount(2); // ⭐ Stage1에서 Stage2로 이동
            (player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
            (player.body as Phaser.Physics.Arcade.Body).setEnable(false);
        }
    }

    handlePlayerEnemyCollision(
        object1: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody,
        object2: Phaser.GameObjects.GameObject | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
    ) {
        const player = object1 as Player;
        object2 as Enemy; // 적 객체는 여기서 사용되지 않지만, 타입 단언은 유지

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