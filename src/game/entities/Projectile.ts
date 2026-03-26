import { PROJECTILE_STATS } from "@/constants";
import * as PIXI from "pixi.js";
import { Entity } from "./Entity";

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
