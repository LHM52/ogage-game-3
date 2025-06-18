// src/objects/Player.ts

import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    isDead = false;
    spawnPoint: { x: number, y: number };
    speed: number;
    private lastFacingVerticalDirection: 'down' | 'up' = 'down';
    private lastFacingHorizontalDirection: 'left' | 'right' = 'right';

    // 마지막으로 '움직였던' 축을 기록 (idle 상태에서 어떤 idle 모션을 유지할지 결정)
    // 'vertical'로 초기화하여 처음 정지 시 'idle_down' (앞)을 보도록 합니다.
    private lastMovedAxis: 'horizontal' | 'vertical' = 'vertical';

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = 200;
        this.spawnPoint = new Phaser.Math.Vector2(x, y);

        this.setCollideWorldBounds(true);
        this.setBounce(0);

        this.anims.create({ key: 'idle_down', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 0 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'idle_left', frames: this.anims.generateFrameNumbers('player', { start: 5, end: 5 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'idle_right', frames: this.anims.generateFrameNumbers('player', { start: 10, end: 10 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'idle_up', frames: this.anims.generateFrameNumbers('player', { start: 15, end: 15 }), frameRate: 10, repeat: -1 });

        this.anims.create({ key: 'walk_down', frames: this.anims.generateFrameNumbers('player', { start: 1, end: 4 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_left', frames: this.anims.generateFrameNumbers('player', { start: 6, end: 9 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('player', { start: 11, end: 14 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'walk_up', frames: this.anims.generateFrameNumbers('player', { start: 16, end: 19 }), frameRate: 10, repeat: -1 });
        // --- 애니메이션 정의 끝 ---

        this.play('idle_down'); // 게임 시작 시 기본 애니메이션
        this.setFlipX(false); // 기본 방향은 오른쪽
    }

    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
        this.setVelocity(0); // 매 프레임마다 속도 초기화

        let velocityX = 0;
        let velocityY = 0;
        let moving = false;
        let animationKey = '';

        if (this.isDead) {
            // 죽은 상태면 이동 무시
            this.setVelocity(0, 0);
            return;
        }

        // setFlipX는 매 프레임 초기화 후 필요한 경우에만 true로 설정합니다.
        // 대부분의 경우 애니메이션 자체의 방향을 따르므로 false로 유지됩니다.
        this.setFlipX(false);

        // --- 플레이어 이동 방향 및 마지막 방향 업데이트 ---
        if (cursors.left.isDown) {
            velocityX = -this.speed;
            this.lastFacingHorizontalDirection = 'left';
            this.lastMovedAxis = 'horizontal'; // 마지막 움직임은 수평이었다고 기록
            moving = true;
        } else if (cursors.right.isDown) {
            velocityX = this.speed;
            this.lastFacingHorizontalDirection = 'right';
            this.lastMovedAxis = 'horizontal'; // 마지막 움직임은 수평이었다고 기록
            moving = true;
        }

        if (cursors.up.isDown) {
            velocityY = -this.speed;
            this.lastFacingVerticalDirection = 'up';
            this.lastMovedAxis = 'vertical'; // 마지막 움직임은 수직이었다고 기록
            moving = true;
        } else if (cursors.down.isDown) {
            velocityY = this.speed;
            this.lastFacingVerticalDirection = 'down';
            this.lastMovedAxis = 'vertical'; // 마지막 움직임은 수직이었다고 기록
            moving = true;
        }

        // 대각선 이동 시 속도 보정
        if (moving && velocityX !== 0 && velocityY !== 0) {
            const diagonalSpeed = this.speed / Math.SQRT2;
            this.setVelocity(velocityX > 0 ? diagonalSpeed : -diagonalSpeed, velocityY > 0 ? diagonalSpeed : -diagonalSpeed);
        } else {
            this.setVelocity(velocityX, velocityY);
        }

        // --- 애니메이션 선택 및 setFlipX 적용 ---
        if (moving) {
            if (velocityX !== 0) { // 수평 이동이 있을 경우 (우선 순위)
                animationKey = `walk_${ this.lastFacingHorizontalDirection }`; // 'walk_left' 또는 'walk_right' 직접 사용
                // 이 애니메이션들은 이미 방향을 포함하므로 flipX는 false 유지
            } else { // 수평 이동은 없고 수직 이동만 있다면 (velocityY !== 0)
                animationKey = `walk_${ this.lastFacingVerticalDirection }`; // 'walk_up' 또는 'walk_down' 사용
                // 수직 이동 중이더라도, 캐릭터의 "얼굴 방향"은 마지막 수평 방향을 따르도록 setFlipX 적용
                // 예를 들어, walk_up 애니메이션이 재생되지만, 이전에 왼쪽으로 움직였다면 setFlipX(true)로 뒤집어 왼쪽을 보게 함
                this.setFlipX(this.lastFacingHorizontalDirection === 'left');
            }
        } else { // 움직이지 않는다면 (정지 상태)
            // 멈췄을 때는 '마지막으로 움직였던 축'을 기준으로 정지 애니메이션 결정
            if (this.lastMovedAxis === 'horizontal') {
                // 직전 움직임이 수평이었다면 해당 수평 방향의 정지 애니메이션 사용
                animationKey = `idle_${ this.lastFacingHorizontalDirection }`; // 'idle_left' 또는 'idle_right' 직접 사용
                // 이 애니메이션들은 이미 방향을 포함하므로 flipX는 false 유지
            } else { // this.lastMovedAxis === 'vertical' 이거나, 게임 초기 상태
                // 직전 움직임이 수직이었다면 해당 수직 방향의 정지 애니메이션 사용
                animationKey = `idle_${ this.lastFacingVerticalDirection }`; // 'idle_up' 또는 'idle_down' 사용
                // 위아래 정지 상태에서도 "얼굴 방향"은 마지막 수평 방향을 따르도록 setFlipX 적용
                this.setFlipX(this.lastFacingHorizontalDirection === 'left');
            }
        }

        // 현재 재생 중인 애니메이션과 다르면 새로운 애니메이션 재생
        if (this.anims.currentAnim?.key !== animationKey) {
            this.play(animationKey, true);
        }


    }


    die() {
        this.isDead = true;
    }

    setSpawnPoint(x: number, y: number): void {
        this.spawnPoint = { x: x, y: y };
    }

    respawn() {
        this.isDead = false;
        this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.setActive(true).setVisible(true);
        this.play('idle_down'); // 리스폰 시 기본 정지 애니메이션 (아래쪽)
        this.setFlipX(false); // 리스폰 시 방향도 초기화 (오른쪽을 보도록)
        this.lastFacingVerticalDirection = 'down';
        this.lastFacingHorizontalDirection = 'right';
        this.lastMovedAxis = 'vertical'; // 리스폰 시 마지막 움직인 축도 수직으로 초기화
    }
}