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
        baseAngle: number = 0
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
        this.baseAngle = baseAngle;

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        body.setAllowGravity(false);
        body.setImmovable(true);
        body.setBounce(0); // 충돌시 튕기지 않도록 설정

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
                this.angleRad = 0;
                break;
        }

        this.setActive(true);
        this.setVisible(true);
    }

    update() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        // 물리 이동 타입이면 매 프레임 속도 강제 재설정
        if (this.patrolType !== "circular-loop" && this.patrolType !== "circular-pingpong") {
            let targetVx = 0;
            let targetVy = 0;

            switch (this.currentDirection) {
                case "right":
                    targetVx = this.speed;
                    break;
                case "left":
                    targetVx = -this.speed;
                    break;
                case "down":
                    targetVy = this.speed;
                    break;
                case "up":
                    targetVy = -this.speed;
                    break;
                case "down-right":
                    targetVx = this.speed;
                    targetVy = this.speed;
                    break;
                case "up-left":
                    targetVx = -this.speed;
                    targetVy = -this.speed;
                    break;
            }
            // 항상 속도 재설정해서 충돌시 변경 방지
            if (body.velocity.x !== targetVx || body.velocity.y !== targetVy) {
                body.setVelocity(targetVx, targetVy);
            }
        }

        switch (this.patrolType) {
            case "horizontal":
                if (
                    this.currentDirection === "right" &&
                    this.x >= this.startX + this.patrolDistance
                ) {
                    this.currentDirection = "left";
                    this.setFlipX(true);
                } else if (
                    this.currentDirection === "left" &&
                    this.x <= this.startX - this.patrolDistance
                ) {
                    this.currentDirection = "right";
                    this.setFlipX(false);
                }
                break;

            case "vertical":
                if (
                    this.currentDirection === "down" &&
                    this.y >= this.startY + this.patrolDistance
                ) {
                    this.currentDirection = "up";
                } else if (
                    this.currentDirection === "up" &&
                    this.y <= this.startY - this.patrolDistance
                ) {
                    this.currentDirection = "down";
                }
                break;

            case "diagonal-down":
                if (
                    this.currentDirection === "down-right" &&
                    (this.x >= this.startX + this.patrolDistance ||
                        this.y >= this.startY + this.patrolDistance)
                ) {
                    this.currentDirection = "up-left";
                } else if (
                    this.currentDirection === "up-left" &&
                    (this.x <= this.startX - this.patrolDistance ||
                        this.y <= this.startY - this.patrolDistance)
                ) {
                    this.currentDirection = "down-right";
                }
                break;

            case "diagonal-up":
                if (
                    this.currentDirection === "up-left" &&
                    (this.x <= this.startX - this.patrolDistance ||
                        this.y <= this.startY - this.patrolDistance)
                ) {
                    this.currentDirection = "down-right";
                } else if (
                    this.currentDirection === "down-right" &&
                    (this.x >= this.startX + this.patrolDistance ||
                        this.y >= this.startY + this.patrolDistance)
                ) {
                    this.currentDirection = "up-left";
                }
                break;

            case "circular-loop":
                this.angleRad += this.angularSpeed;
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
