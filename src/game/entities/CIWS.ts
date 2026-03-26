import { COLORS, GAME_CONSTANTS } from "@/constants";
import * as PIXI from "pixi.js";
import { Entity } from "./Entity";

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
