import * as PIXI from 'pixi.js';
import { SmokeParticle, SparkleTrail, TrailParticle } from './Particles';
import { MuzzleFlash } from './MuzzleFlash';

export class TrailManager {
  private particles: TrailParticle[] = [];
  private flashes: MuzzleFlash[] = [];
  private smoke: SmokeParticle[] = [];
  private sparkles: SparkleTrail[] = [];
  private container: PIXI.Container;

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  public addTrail(x: number, y: number, color: number, size: number = 2, life: number = 20) {
    if (!this.container || this.container.destroyed) return;
    const p = new TrailParticle(x, y, color, size, life);
    this.particles.push(p);
    this.container.addChild(p);
  }

  public addSparkleTrail(x: number, y: number, color: number) {
    if (!this.container || this.container.destroyed) return;
    const s = new SparkleTrail(x, y, color);
    this.sparkles.push(s);
    this.container.addChild(s);
  }

  public addMuzzleFlash(x: number, y: number, angle: number) {
    if (!this.container || this.container.destroyed) return;
    const f = new MuzzleFlash(x, y, angle);
    this.flashes.push(f);
    this.container.addChild(f);

    // Occasionally add smoke
    if (Math.random() > 0.6) {
      const s = new SmokeParticle(x, y, angle);
      this.smoke.push(s);
      this.container.addChild(s);
    }
  }

  public update(delta: number) {
    // Update trails
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(delta);
      if (p.life <= 0) {
        if (this.container && !this.container.destroyed) {
          this.container.removeChild(p);
        }
        this.particles.splice(i, 1);
        p.destroy();
      }
    }

    // Update flashes
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const f = this.flashes[i];
      f.update(delta);
      if (f.life <= 0) {
        if (this.container && !this.container.destroyed) {
          this.container.removeChild(f);
        }
        this.flashes.splice(i, 1);
        f.destroy();
      }
    }

    // Update smoke
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const s = this.smoke[i];
      s.update(delta);
      if (s.life <= 0) {
        if (this.container && !this.container.destroyed) {
          this.container.removeChild(s);
        }
        this.smoke.splice(i, 1);
        s.destroy();
      }
    }

    // Update sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.update(delta);
      if (s.life <= 0) {
        if (this.container && !this.container.destroyed) {
          this.container.removeChild(s);
        }
        this.sparkles.splice(i, 1);
        s.destroy();
      }
    }
  }
}
