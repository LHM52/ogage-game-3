import Phaser from "phaser";

// 적의 순찰 방향을 정의하는 타입
type PatrolDirection =
    | "horizontal" // 수평 이동 (좌우 왕복)
    | "vertical"   // 수직 이동 (상하 왕복)
    | "diagonal-down" // 대각선 아래로 이동 (좌상단에서 우하단으로 왕복)
    | "diagonal-up"   // 대각선 위로 이동 (우하단에서 좌상단으로 왕복)
    | "circular-loop" // 원형 경로를 반복 (시작점에서 한 방향으로 계속 회전)
    | "circular-pingpong"; // 원형 경로를 왕복 (시작점에서 반원, 다시 반대 방향으로 회전)

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    speed: number;            // 적의 이동 속도
    patrolDistance: number;   // 순찰 거리 (시작점으로부터 최대 이동 거리 또는 원형 반지름)
    startX: number;           // 적의 시작 X 좌표
    startY: number;           // 적의 시작 Y 좌표
    angleRad: number;         // 원형 이동 시 현재 각도 (라디안)
    angleDirection: 1 | -1;   // 원형 핑퐁 이동 시 각도 변화 방향 (1: 정방향, -1: 역방향)
    angularSpeed: number;     // 원형 이동 시 각도 변화 속도
    currentDirection!: "right" | "left" | "up" | "down" | "down-right" | "up-left"; // 현재 이동 방향 문자열
    patrolType: PatrolDirection; // 순찰 유형

    baseAngle: number; // 원형 이동 시 시작 각도 오프셋 (원의 시작점을 조절)

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        patrolType: PatrolDirection = "horizontal",
        speed: number = 150,
        patrolDistance: number = 100,
        startDirectionSign: 1 | -1 = 1, // 수평/수직 이동의 초기 방향 (-1: 왼쪽/위, 1: 오른쪽/아래)
        angularSpeed: number = 0.02,    // 원형 이동 시 기본 각속도
        baseAngle: number = 0           // 원형 이동 시 시작 각도 (라디안)
    ) {
        super(scene, x, y, texture); // Phaser.Physics.Arcade.Sprite의 생성자 호출
        scene.add.existing(this);    // 현재 씬에 적 오브젝트 추가
        scene.physics.add.existing(this); // 적 오브젝트에 Phaser 물리 엔진 활성화

        this.speed = speed;
        this.patrolDistance = patrolDistance;
        this.startX = x;
        this.startY = y;
        this.patrolType = patrolType;
        this.angleRad = 0; // 원형 이동을 위한 초기 각도
        this.angleDirection = 1; // 원형 핑퐁 이동의 초기 방향
        this.angularSpeed = angularSpeed;
        this.baseAngle = baseAngle;

        const body = this.body as Phaser.Physics.Arcade.Body; // 물리 바디 객체 참조
        body.setCollideWorldBounds(true); // 월드 경계(게임 화면 경계)와 충돌 가능하도록 설정
        body.setAllowGravity(false);      // 중력의 영향을 받지 않도록 설정 (적은 공중에 뜰 수 있음)
        body.setImmovable(true);          // 다른 물리 객체(플레이어 등)에 의해 밀려나지 않도록 설정
        body.setBounce(0);                // 충돌 시 튕기지 않도록 설정 (반발력 없음)
        body.setDrag(0, 0);               // 공기 저항(drag)을 X, Y축 모두 0으로 설정 (움직임 방해 없음)
        body.setFriction(0, 0);           // 표면 마찰(friction)을 X, Y축 모두 0으로 설정 (미끄러지듯 움직임)

        // 순찰 유형에 따라 초기 이동 방향과 속도 설정
        switch (patrolType) {
            case "horizontal":
                this.currentDirection = startDirectionSign === 1 ? "right" : "left";
                body.setVelocityX(this.speed * startDirectionSign);
                this.setFlipX(startDirectionSign === -1); // 초기 방향에 따라 이미지 좌우 반전
                break;
            case "vertical":
                this.currentDirection = startDirectionSign === 1 ? "down" : "up";
                body.setVelocityY(this.speed * startDirectionSign);
                break;
            case "diagonal-down": // 우하단 방향 이동
                this.currentDirection = "down-right";
                body.setVelocity(this.speed, this.speed);
                break;
            case "diagonal-up":   // 좌상단 방향 이동
                this.currentDirection = "up-left";
                body.setVelocity(-this.speed, -this.speed);
                break;
            case "circular-loop":
            case "circular-pingpong":
                body.moves = false; // 원형 이동은 물리 속도를 직접 사용하지 않으므로 물리 이동 비활성화
                this.angleRad = 0; // 초기 각도 설정
                break;
        }

        this.setActive(true);  // 게임 오브젝트를 활성 상태로 설정 (update() 메서드 호출 등)
        this.setVisible(true); // 게임 오브젝트를 보이도록 설정
    }

    update() {
        const body = this.body as Phaser.Physics.Arcade.Body;

        // 물리 기반 이동 타입일 경우 매 프레임 속도를 강제로 재설정
        // 이렇게 하면 충돌이나 다른 외부 요인으로 속도가 변경되더라도 즉시 의도한 속도로 복구됩니다.
        if (this.patrolType !== "circular-loop" && this.patrolType !== "circular-pingpong") {
            let targetVx = 0; // 목표 X 속도
            let targetVy = 0; // 목표 Y 속도

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
            // 매 프레임 목표 속도를 강제로 설정하여 어떤 상황에서도 속도가 유지되도록 합니다.
            body.setVelocity(targetVx, targetVy);
        }

        // 각 순찰 유형에 따른 이동 및 방향 전환 로직
        switch (this.patrolType) {
            case "horizontal":
                // 오른쪽으로 이동 중이고, 시작점 + 순찰 거리를 넘어섰다면
                if (
                    this.currentDirection === "right" &&
                    this.x >= this.startX + this.patrolDistance
                ) {
                    this.currentDirection = "left"; // 방향 전환
                    this.setFlipX(true); // 이미지 좌우 반전
                }
                // 왼쪽으로 이동 중이고, 시작점 - 순찰 거리를 넘어섰다면
                else if (
                    this.currentDirection === "left" &&
                    this.x <= this.startX - this.patrolDistance
                ) {
                    this.currentDirection = "right"; // 방향 전환
                    this.setFlipX(false); // 이미지 좌우 반전
                }
                break;

            case "vertical":
                const tolerance = 5; // 수직 순찰 시 소수점 정밀도 문제를 위한 오차 범위 (픽셀), 2에서 5로 늘려봄
                // 아래로 이동 중이고, 시작점 + 순찰 거리를 넘어섰다면 (오차 범위 고려)
                if (
                    this.currentDirection === "down" &&
                    this.y >= this.startY + this.patrolDistance - tolerance
                ) {
                    this.currentDirection = "up"; // 방향 전환
                    this.y = this.startY + this.patrolDistance; // **목표 Y 좌표로 강제 보정**
                }
                // 위로 이동 중이고, 시작점 - 순찰 거리를 넘어섰다면 (오차 범위 고려)
                else if (
                    this.currentDirection === "up" &&
                    this.y <= this.startY - this.patrolDistance + tolerance
                ) {
                    this.currentDirection = "down"; // 방향 전환
                    this.y = this.startY - this.patrolDistance; // **목표 Y 좌표로 강제 보정**
                }
                break;

            case "diagonal-down":
                // 우하단 이동 중이고, x 또는 y 좌표가 순찰 거리를 넘어섰다면 (대각선이므로 OR 조건)
                if (
                    this.currentDirection === "down-right" &&
                    (this.x >= this.startX + this.patrolDistance ||
                        this.y >= this.startY + this.patrolDistance)
                ) {
                    this.currentDirection = "up-left"; // 방향 전환
                }
                // 좌상단 이동 중이고, x 또는 y 좌표가 순찰 거리를 넘어섰다면
                else if (
                    this.currentDirection === "up-left" &&
                    (this.x <= this.startX - this.patrolDistance ||
                        this.y <= this.startY - this.patrolDistance)
                ) {
                    this.currentDirection = "down-right"; // 방향 전환
                }
                break;

            case "diagonal-up":
                // 좌상단 이동 중이고, x 또는 y 좌표가 순찰 거리를 넘어섰다면
                if (
                    this.currentDirection === "up-left" &&
                    (this.x <= this.startX - this.patrolDistance ||
                        this.y <= this.startY - this.patrolDistance)
                ) {
                    this.currentDirection = "down-right"; // 방향 전환
                }
                // 우하단 이동 중이고, x 또는 y 좌표가 순찰 거리를 넘어섰다면
                else if (
                    this.currentDirection === "down-right" &&
                    (this.x >= this.startX + this.patrolDistance ||
                        this.y >= this.startY + this.patrolDistance)
                ) {
                    this.currentDirection = "up-left"; // 방향 전환
                }
                break;

            case "circular-loop":
                this.angleRad += this.angularSpeed; // 각도 계속 증가
                // 원형 경로에 따라 적의 위치를 업데이트
                this.setPosition(
                    this.startX + Math.cos(this.angleRad + this.baseAngle) * this.patrolDistance,
                    this.startY + Math.sin(this.angleRad + this.baseAngle) * this.patrolDistance
                );
                break;

            case "circular-pingpong":
                this.angleRad += this.angularSpeed * this.angleDirection; // 각도 증가 (방향에 따라)
                // 각도가 PI (반원)에 도달하면 방향 반전
                if (this.angleRad >= Math.PI) {
                    this.angleRad = Math.PI; // 각도를 PI로 고정
                    this.angleDirection = -1; // 방향을 역방향으로 변경
                }
                // 각도가 0에 도달하면 방향 반전
                else if (this.angleRad <= 0) {
                    this.angleRad = 0; // 각도를 0으로 고정
                    this.angleDirection = 1; // 방향을 정방향으로 변경
                }
                // 원형 경로에 따라 적의 위치를 업데이트
                this.setPosition(
                    this.startX + Math.cos(this.angleRad + this.baseAngle) * this.patrolDistance,
                    this.startY + Math.sin(this.angleRad + this.baseAngle) * this.patrolDistance
                );
                break;
        }
    }
}