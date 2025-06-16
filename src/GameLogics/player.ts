// src/objects/Player.ts

import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    // spawnPoint는 이제 { x: number, y: number } 형태의 객체로 관리됩니다.
    spawnPoint: { x: number, y: number };
    speed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 플레이어 초기 능력치 설정
        this.speed = 150; // 기본 속도

        // 스폰 포인트는 일단 생성 시 초기 플레이어 위치로 설정하거나,
        // 나중에 씬에서 특정 타일 좌표로 업데이트할 수 있습니다.
        this.spawnPoint = { x: x, y: y };

        this.setCollideWorldBounds(true); // 월드 경계 충돌 설정
        this.setBounce(0); // 바운스(반동) 효과가 필요 없으므로 0으로 설정

        // 애니메이션 생성 (필요에 따라 Scene에서 정의하는 것이 더 유연합니다.)
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.play('idle'); // 초기 애니메이션 실행
    }

    // 플레이어 업데이트 로직 (이동 및 애니메이션)
    update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
        this.setVelocity(0); // 매 프레임마다 속도 초기화

        let velocityX = 0;
        let velocityY = 0;
        let moving = false; // 플레이어가 움직이는지 여부

        if (cursors.left.isDown) {
            velocityX = -this.speed;
            this.setFlipX(true); // 왼쪽을 볼 때 스프라이트 반전
            moving = true;
        } else if (cursors.right.isDown) {
            velocityX = this.speed;
            this.setFlipX(false); // 오른쪽을 볼 때 스프라이트 유지
            moving = true;
        }

        if (cursors.up.isDown) {
            velocityY = -this.speed;
            moving = true;
        } else if (cursors.down.isDown) {
            velocityY = this.speed;
            moving = true;
        }

        // 대각선 이동 시 속도 보정 (선택 사항: 필요 없으면 제거 가능)
        // 대각선으로 움직일 때 속도가 너무 빨라지는 것을 방지합니다.
        if (moving && velocityX !== 0 && velocityY !== 0) {
            const diagonalSpeed = this.speed / Math.SQRT2;
            this.setVelocity(velocityX > 0 ? diagonalSpeed : -diagonalSpeed, velocityY > 0 ? diagonalSpeed : -diagonalSpeed);
        } else {
            this.setVelocity(velocityX, velocityY);
        }

        // 애니메이션 업데이트 로직 (현재는 'idle'만 사용)
        if (!moving) { // 플레이어가 멈췄을 때
            if (this.anims.currentAnim?.key !== 'idle') {
                this.play('idle', true);
            }
        }
        // 만약 'walk' 애니메이션이 있다면 아래와 같이 사용 가능
        // else { // 플레이어가 움직일 때
        //    if (this.anims.currentAnim?.key !== 'walk') {
        //        this.play('walk', true);
        //    }
        // }
    }

    // 플레이어의 스폰 포인트 위치를 설정하는 메서드
    setSpawnPoint(x: number, y: number): void {
        this.spawnPoint = { x: x, y: y };
    }

    // 스폰 포인트로 플레이어를 이동시키는 메서드
    respawn(): void {
        this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
        this.setVelocity(0); // 리스폰 시 속도 초기화
        this.setVisible(true); // 다시 보이게 설정 (사망 시 숨겼을 경우)
        this.setActive(true); // 활성화 (사망 시 비활성화했을 경우)
        this.play('idle'); // 리스폰 후 idle 애니메이션 재생
    }
}