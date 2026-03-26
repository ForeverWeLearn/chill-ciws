import { COLORS } from '@/constants';
import * as PIXI from 'pixi.js';
import { Particle } from './Particles';

export class ExplosionManager {
  private effects: Particle[] = [];
  private container: PIXI.Container;

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  public explode(x: number, y: number, count: number = 20, color: number = 0xffffff) {
    if (!this.container || this.container.destroyed) return;
    for (let i = 0; i < count; i++) {
      const p = new Particle(x, y, color);
      this.effects.push(p);
      this.container.addChild(p);
    }
  }

  public bigExplode(x: number, y: number) {
    if (!this.container || this.container.destroyed) return;
    // Layered explosion
    this.explode(x, y, 50, COLORS.EXPLOSION_FIRE); // Fire
    this.explode(x, y, 30, COLORS.EXPLOSION_SPARK); // Sparks
    this.explode(x, y, 20, COLORS.EXPLOSION_CORE); // Core
  }

  public update(delta: number) {
    if (!this.effects) return;
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const p = this.effects[i];
      if (!p || p.destroyed) {
        this.effects.splice(i, 1);
        continue;
      }
      p.update(delta);
      if (p.life <= 0) {
        if (this.container && !this.container.destroyed) {
          this.container.removeChild(p);
        }
        this.effects.splice(i, 1);
        p.destroy();
      }
    }
  }
}
