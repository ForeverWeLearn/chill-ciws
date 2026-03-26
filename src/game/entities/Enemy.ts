import { ENEMY_STATS } from "@/constants";
import { EnemyType } from "@/types";
import * as PIXI from "pixi.js";
import { Entity } from "./Entity";

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
