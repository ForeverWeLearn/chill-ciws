import { COLORS } from '@/constants';
import * as PIXI from 'pixi.js';

export class MuzzleFlash extends PIXI.Graphics {
  public life: number;
  public maxLife: number;

  constructor(x: number, y: number, angle: number) {
    super();
    this.x = x;
    this.y = y;
    this.rotation = angle;
    this.life = this.maxLife = 3 + Math.random() * 3;
    
    // Core glow
    this.circle(0, 0, 8 + Math.random() * 4);
    this.fill({ color: COLORS.GUN_MUZZLE_CORE, alpha: 0.8 });
    
    // Outer glow
    this.circle(0, 0, 15 + Math.random() * 10);
    this.fill({ color: COLORS.GUN_MUZZLE_OUTER, alpha: 0.4 });
    
    // Radial streaks
    const streakCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < streakCount; i++) {
      const sAngle = (Math.random() - 0.5) * 0.8;
      const length = 20 + Math.random() * 30;
      const width = 2 + Math.random() * 4;
      
      this.moveTo(0, 0);
      this.lineTo(Math.cos(sAngle) * length, Math.sin(sAngle) * width);
      this.lineTo(Math.cos(sAngle) * length, -Math.sin(sAngle) * width);
      this.closePath();
      this.fill({ color: COLORS.GUN_MUZZLE_STREAK, alpha: 0.6 });
    }
    
    this.blendMode = 'add';
  }

  update(delta: number) {
    this.life -= delta;
    this.alpha = Math.pow(this.life / this.maxLife, 2);
    this.scale.set(1 + (1 - this.life / this.maxLife) * 0.5);
  }
}
