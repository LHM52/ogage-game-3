import Phaser from "phaser";

type PatrolDirection =
    | "horizontal"
    | "vertical"
    | "diagonal-down"
    | "diagonal-up"
    | "circular-loop"
    | "circular-pingpong";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    speed: number;
    patrolDistance: number;
    startX: number;
    startY: number;
    angleRad: number;
    angleDirection: 1 | -1;
    angularSpeed: number;
    currentDirection!: "right" | "left" | "up" | "down" | "down-right" | "up-left";
    patrolType: PatrolDirection;

    // 추가: 풍차 돌 때 초기 각도 오프셋
    baseAngle: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        patrolType: PatrolDirection = "horizontal",
        speed: number = 150,
        patrolDistance: number = 100,
        startDirectionSign: 1 | -1 = 1,
        angularSpeed: number = 0.02,
        baseAngle: number = 0 // 추가: 초기 각도 오프셋
    ) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = speed;
        this.patrolDistance = patrolDistance;
        this.startX = x;
        this.startY = y;
        this.patrolType = patrolType;
        this.angleRad = 0;
        this.angleDirection = 1;
        this.angularSpeed = angularSpeed;
        this.baseAngle = baseAngle; // 초기 각도 저장

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setAllowGravity(false);
        body.setImmovable(true);

        switch (patrolType) {
            case "horizontal":
                this.currentDirection = startDirectionSign === 1 ? "right" : "left";
                body.setVelocityX(this.speed * startDirectionSign);
                this.setFlipX(startDirectionSign === -1);
                break;
            case "vertical":
                this.currentDirection = startDirectionSign === 1 ? "down" : "up";
                body.setVelocityY(this.speed * startDirectionSign);
                break;
            case "diagonal-down":
                this.currentDirection = "down-right";
                body.setVelocity(this.speed, this.speed);
                break;
            case "diagonal-up":
                this.currentDirection = "up-left";
                body.setVelocity(-this.speed, -this.speed);
                break;
            case "circular-loop":
            case "circular-pingpong":
                body.moves = false;
                this.angleRad = 0; // 초기 각도 0으로 시작
                break;
        }

        this.setActive(true);
        this.setVisible(true);
    }

    update() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        switch (this.patrolType) {
            case "horizontal":
                if (
                    this.currentDirection === "right" &&
                    this.x >= this.startX + this.patrolDistance
                ) {
                    this.currentDirection = "left";
                    body.setVelocityX(-this.speed);
                    this.setFlipX(true);
                } else if (
                    this.currentDirection === "left" &&
                    this.x <= this.startX - this.patrolDistance
                ) {
                    this.currentDirection = "right";
                    body.setVelocityX(this.speed);
                    this.setFlipX(false);
                }
                break;

            case "vertical":
                if (
                    this.currentDirection === "down" &&
                    this.y >= this.startY + this.patrolDistance
                ) {
                    this.currentDirection = "up";
                    body.setVelocityY(-this.speed);
                } else if (
                    this.currentDirection === "up" &&
                    this.y <= this.startY - this.patrolDistance
                ) {
                    this.currentDirection = "down";
                    body.setVelocityY(this.speed);
                }
                break;

            case "diagonal-down":
                if (
                    this.currentDirection === "down-right" &&
                    (this.x >= this.startX + this.patrolDistance ||
                        this.y >= this.startY + this.patrolDistance)
                ) {
                    this.currentDirection = "up-left";
                    body.setVelocity(-this.speed, -this.speed);
                } else if (
                    this.currentDirection === "up-left" &&
                    (this.x <= this.startX - this.patrolDistance ||
                        this.y <= this.startY - this.patrolDistance)
                ) {
                    this.currentDirection = "down-right";
                    body.setVelocity(this.speed, this.speed);
                }
                break;

            case "diagonal-up":
                if (
                    this.currentDirection === "up-left" &&
                    (this.x <= this.startX - this.patrolDistance ||
                        this.y <= this.startY - this.patrolDistance)
                ) {
                    this.currentDirection = "down-right";
                    body.setVelocity(this.speed, this.speed);
                } else if (
                    this.currentDirection === "down-right" &&
                    (this.x >= this.startX + this.patrolDistance ||
                        this.y >= this.startY + this.patrolDistance)
                ) {
                    this.currentDirection = "up-left";
                    body.setVelocity(-this.speed, -this.speed);
                }
                break;

            case "circular-loop":
                this.angleRad += this.angularSpeed;
                // baseAngle 만큼 초기 각도 오프셋을 더해서 풍차 모양으로 각자 다르게 위치함
                this.setPosition(
                    this.startX + Math.cos(this.angleRad + this.baseAngle) * this.patrolDistance,
                    this.startY + Math.sin(this.angleRad + this.baseAngle) * this.patrolDistance
                );
                break;

            case "circular-pingpong":
                this.angleRad += this.angularSpeed * this.angleDirection;
                if (this.angleRad >= Math.PI) {
                    this.angleRad = Math.PI;
                    this.angleDirection = -1;
                } else if (this.angleRad <= 0) {
                    this.angleRad = 0;
                    this.angleDirection = 1;
                }

                this.setPosition(
                    this.startX + Math.cos(this.angleRad + this.baseAngle) * this.patrolDistance,
                    this.startY + Math.sin(this.angleRad + this.baseAngle) * this.patrolDistance
                );
                break;
        }
    }
}
