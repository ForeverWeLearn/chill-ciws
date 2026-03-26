import {
  COLORS,
  ENEMY_STATS,
  GAME_CONSTANTS,
  PROJECTILE_STATS,
} from "@/constants";
import * as PIXI from "pixi.js";

export abstract class Entity {
  public container: PIXI.Container;
  public dead: boolean = false;
  public radius: number = 10;

  constructor() {
    this.container = new PIXI.Container();
  }

  abstract update(delta: number): void;

  public destroy() {
    if (this.container && !this.container.destroyed) {
      this.container.destroy({ children: true });
    }
  }

  public get destroyed(): boolean {
    return !this.container || this.container.destroyed;
  }
}

export class Projectile extends Entity {
  private velocity: { x: number; y: number };
  private graphics: PIXI.Graphics;

  constructor(x: number, y: number, angle: number, speed: number) {
    super();
    this.container.x = x;
    this.container.y = y;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };
    this.radius = PROJECTILE_STATS.RADIUS;

    this.graphics = new PIXI.Graphics();
    this.graphics.setStrokeStyle({ width: 2, color: PROJECTILE_STATS.COLOR });
    this.graphics.moveTo(0, 0);
    this.graphics.lineTo(-10, 0);
    this.graphics.stroke();
    this.container.addChild(this.graphics);
    this.container.rotation = angle;
  }

  update(delta: number) {
    if (!this.container || this.container.destroyed) return;
    this.container.x += this.velocity.x * delta;
    this.container.y += this.velocity.y * delta;

    if (
      this.container.x < -100 ||
      this.container.x > window.innerWidth + 100 ||
      this.container.y < -100 ||
      this.container.y > window.innerHeight + 100
    ) {
      this.dead = true;
    }
  }
}

export enum EnemyType {
  MISSILE,
  ULTRAFAST,
  SUPERFAST,
  SLOW,
}

export class Enemy extends Entity {
  public type: EnemyType;
  public velocity: { x: number; y: number };
  private graphics: PIXI.Graphics;
  public health: number;
  public color: number;

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    type: EnemyType,
  ) {
    super();
    this.type = type;
    this.container.x = x;
    this.container.y = y;

    let speed = 1;
    let accuracy = 0;

    this.graphics = new PIXI.Graphics();

    switch (type) {
      case EnemyType.MISSILE:
        speed = ENEMY_STATS.MISSILE.SPEED;
        accuracy = ENEMY_STATS.MISSILE.ACCURACY;
        this.health = ENEMY_STATS.MISSILE.HEALTH;
        this.radius = ENEMY_STATS.MISSILE.RADIUS;
        this.color = ENEMY_STATS.MISSILE.COLOR;
        this.graphics.setStrokeStyle({ width: 2, color: this.color });
        this.graphics.rect(-10, -2, 20, 4);
        this.graphics.stroke();
        this.graphics.moveTo(10, -2);
        this.graphics.lineTo(15, 0);
        this.graphics.lineTo(10, 2);
        this.graphics.stroke();
        break;
      case EnemyType.ULTRAFAST:
        speed = ENEMY_STATS.ULTRAFAST.SPEED;
        accuracy = ENEMY_STATS.ULTRAFAST.ACCURACY;
        this.health = ENEMY_STATS.ULTRAFAST.HEALTH;
        this.radius = ENEMY_STATS.ULTRAFAST.RADIUS;
        this.color = ENEMY_STATS.ULTRAFAST.COLOR;
        this.graphics.setStrokeStyle({ width: 2, color: this.color });
        this.graphics.rect(-8, -1.5, 16, 3);
        this.graphics.stroke();
        this.graphics.moveTo(8, -1.5);
        this.graphics.lineTo(12, 0);
        this.graphics.lineTo(8, 1.5);
        this.graphics.stroke();
        break;
      case EnemyType.SUPERFAST:
        speed = ENEMY_STATS.SUPERFAST.SPEED;
        accuracy = ENEMY_STATS.SUPERFAST.ACCURACY;
        this.health = ENEMY_STATS.SUPERFAST.HEALTH;
        this.radius = ENEMY_STATS.SUPERFAST.RADIUS;
        this.color = ENEMY_STATS.SUPERFAST.COLOR;
        this.graphics.setStrokeStyle({ width: 2, color: this.color });
        this.graphics.rect(-8, -1.5, 16, 3);
        this.graphics.stroke();
        this.graphics.moveTo(8, -1.5);
        this.graphics.lineTo(12, 0);
        this.graphics.lineTo(8, 1.5);
        this.graphics.stroke();
        break;
      case EnemyType.SLOW:
        speed = ENEMY_STATS.SLOW.SPEED;
        accuracy = ENEMY_STATS.SLOW.ACCURACY;
        this.health = ENEMY_STATS.SLOW.HEALTH;
        this.radius = ENEMY_STATS.SLOW.RADIUS;
        this.color = ENEMY_STATS.SLOW.COLOR;
        this.graphics.setStrokeStyle({ width: 3, color: this.color });
        this.graphics.rect(-12, -4, 24, 8);
        this.graphics.stroke();
        this.graphics.moveTo(12, -4);
        this.graphics.lineTo(18, 0);
        this.graphics.lineTo(12, 4);
        this.graphics.stroke();
        break;
    }

    // Apply accuracy spread
    const spread = (1 - accuracy) * window.innerWidth;
    const actualTargetX = targetX + (Math.random() - 0.5) * spread;
    const angle = Math.atan2(targetY - y, actualTargetX - x);

    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    this.container.addChild(this.graphics);
    this.container.rotation = angle;
  }

  public getTailPosition(): { x: number; y: number } {
    if (!this.container || this.container.destroyed) return { x: 0, y: 0 };
    const offset =
      this.type === EnemyType.MISSILE
        ? -10
        : this.type === EnemyType.SUPERFAST
          ? -8
          : -12;
    return {
      x: this.container.x + Math.cos(this.container.rotation) * offset,
      y: this.container.y + Math.sin(this.container.rotation) * offset,
    };
  }

  update(delta: number) {
    if (!this.container || this.container.destroyed) return;
    this.container.x += this.velocity.x * delta;
    this.container.y += this.velocity.y * delta;

    if (
      this.container.y > window.innerHeight + this.radius * 2 ||
      this.container.x < -100 ||
      this.container.x > window.innerWidth + 100
    ) {
      this.dead = true;
    }
  }
}

export class CIWS extends Entity {
  private barrel: PIXI.Graphics;
  private base: PIXI.Graphics;
  public angle: number = -Math.PI / 2;
  private targetAngle: number = -Math.PI / 2;
  private rotationSpeed: number = GAME_CONSTANTS.ROTATION_SPEED;
  private fireTimer: number = 0;
  private fireRate: number = GAME_CONSTANTS.FIRE_RATE;

  constructor(x: number, y: number) {
    super();
    this.container.x = x;
    this.container.y = y;
    this.container.zIndex = 10;

    this.base = new PIXI.Graphics();
    this.base.setStrokeStyle({ width: 2, color: COLORS.CIWS_BASE });
    this.base.rect(-20, 0, 40, 20);
    this.base.stroke();
    this.base.moveTo(-15, 0);
    this.base.lineTo(-10, -10);
    this.base.lineTo(10, -10);
    this.base.lineTo(15, 0);
    this.base.stroke();

    this.barrel = new PIXI.Graphics();
    this.barrel.setStrokeStyle({ width: 2, color: COLORS.CIWS_BARREL });
    this.barrel.rect(0, -4, 30, 8);
    this.barrel.stroke();
    this.barrel.y = -10;

    this.container.addChild(this.base);
    this.container.addChild(this.barrel);
  }

  public getMuzzlePosition(): { x: number; y: number } {
    const barrelLength = 30;
    return {
      x: this.container.x + Math.cos(this.angle) * barrelLength,
      y: this.container.y - 10 + Math.sin(this.angle) * barrelLength,
    };
  }

  public aimAt(targetX: number, targetY: number) {
    if (this.destroyed || !this.barrel || this.barrel.destroyed) return;
    const dx = targetX - this.container.x;
    const dy = targetY - (this.container.y - 10);
    const angle = Math.atan2(dy, dx);

    // Normalize angle relative to -PI/2 (up)
    let normalized = angle + Math.PI / 2;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    while (normalized > Math.PI) normalized -= Math.PI * 2;

    // Limit to 140 degree arc (+/- 80 degrees from up)
    const limit = (70 * Math.PI) / 180;
    normalized = Math.max(-limit, Math.min(limit, normalized));

    this.targetAngle = normalized - Math.PI / 2;
  }

  public canFire(): boolean {
    if (this.fireTimer <= 0) {
      this.fireTimer = this.fireRate;
      return true;
    }
    return false;
  }

  private getShortestAngle(from: number, to: number): number {
    let diff = to - from;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return diff;
  }

  update(delta: number) {
    if (!this.container || this.container.destroyed) return;

    // Smooth rotation
    const diff = this.getShortestAngle(this.angle, this.targetAngle);
    const step = this.rotationSpeed * delta;

    if (Math.abs(diff) < step) {
      this.angle = this.targetAngle;
    } else {
      this.angle += Math.sign(diff) * step;
    }

    this.barrel.rotation = this.angle;

    if (this.fireTimer > 0) {
      this.fireTimer -= delta;
    }
  }
}
