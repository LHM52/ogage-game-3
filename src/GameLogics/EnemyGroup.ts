// EnemyGroup.ts

import Enemy from "./enemy";

export class EnemyGroup {
    enemies: Enemy[];
    centerX: number;
    centerY: number;
    patrolDistance: number;
    baseAngle: number = 0;
    angularSpeed: number;

    constructor(enemies: Enemy[], centerX: number, centerY: number, patrolDistance: number, angularSpeed: number) {
        this.enemies = enemies;
        this.centerX = centerX;
        this.centerY = centerY;
        this.patrolDistance = patrolDistance;
        this.angularSpeed = angularSpeed;

        const count = enemies.length;
        enemies.forEach((enemy, i) => {
            enemy.angleRad = (Math.PI * 2 * i) / count;
            enemy.patrolType = 'circular-loop';
            if (enemy.body && enemy.body instanceof Phaser.Physics.Arcade.Body) {
                enemy.body.moves = true;
            }
        });
    }

    update() {
        this.baseAngle += this.angularSpeed;
        const count = this.enemies.length;

        for (let i = 0; i < count; i++) {
            const enemy = this.enemies[i];
            const angle = this.baseAngle + (Math.PI * 2 * i) / count;

            const newX = this.centerX + Math.cos(angle) * this.patrolDistance;
            const newY = this.centerY + Math.sin(angle) * this.patrolDistance;

            // 위치 직접 세팅 - sprite 위치와 body 위치 모두 맞춰줌
            enemy.setPosition(newX, newY);

            // body 위치도 강제로 맞춤 (Phaser 물리 위치 동기화 보장)
            if (enemy.body && enemy.body instanceof Phaser.Physics.Arcade.Body) {
                enemy.body.position.x = newX - enemy.body.halfWidth;
                enemy.body.position.y = newY - enemy.body.halfHeight;
                enemy.body.prev.x = enemy.body.position.x;
                enemy.body.prev.y = enemy.body.position.y;
                enemy.body.velocity.x = 0;
                enemy.body.velocity.y = 0;
            }
        }
    }
}
