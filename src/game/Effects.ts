import { COLORS } from '@/constants';
import * as PIXI from 'pixi.js';

export class Particle extends PIXI.Graphics {
  public velocity: { x: number, y: number };
  public life: number;
  public maxLife: number;

  constructor(x: number, y: number, color: number = COLORS.WHITE, speedMult: number = 1) {
    super();
    this.x = x;
    this.y = y;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 4 + 1) * speedMult;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
    
    this.life = this.maxLife = Math.random() * 30 + 20;
    
    this.setStrokeStyle({ width: 1, color: color });
    this.rect(-1, -1, 2, 2);
    this.stroke();
  }

  update(delta: number) {
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    this.life -= delta;
    this.alpha = this.life / this.maxLife;
  }
}

export class TrailParticle extends PIXI.Graphics {
  public life: number;
  public maxLife: number;

  constructor(x: number, y: number, color: number, size: number, life: number) {
    super();
    this.x = x;
    this.y = y;
    this.life = this.maxLife = life;
    
    this.circle(0, 0, size);
    this.fill(color);
  }

  update(delta: number) {
    this.life -= delta;
    this.alpha = this.life / this.maxLife;
    this.scale.set(this.life / this.maxLife);
  }
}

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

export class SmokeParticle extends PIXI.Graphics {
  public life: number;
  public maxLife: number;
  public velocity: { x: number, y: number };

  constructor(x: number, y: number, angle: number) {
    super();
    this.x = x;
    this.y = y;
    this.life = this.maxLife = 20 + Math.random() * 20;
    
    const speed = 0.5 + Math.random() * 1.5;
    const spread = (Math.random() - 0.5) * 1.0;
    this.velocity = {
      x: Math.cos(angle + spread) * speed,
      y: Math.sin(angle + spread) * speed
    };

    this.circle(0, 0, 4 + Math.random() * 6);
    this.fill({ color: COLORS.SMOKE, alpha: 0.3 });
  }

  update(delta: number) {
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    this.life -= delta;
    this.alpha = (this.life / this.maxLife) * 0.3;
    this.scale.set(1 + (1 - this.life / this.maxLife) * 2);
  }
}

export class SparkleTrail extends PIXI.Graphics {
  public life: number;
  public maxLife: number;
  public velocity: { x: number, y: number };
  public rotationSpeed: number;

  constructor(x: number, y: number, color: number) {
    super();
    this.x = x;
    this.y = y;
    this.life = this.maxLife = 60 + Math.random() * 60; // 1-2 seconds
    
    // Slight drift
    this.velocity = {
      x: (Math.random() - 0.5) * 0.3,
      y: (Math.random() - 0.5) * 0.3
    };
    this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    this.rotation = Math.random() * Math.PI * 2;

    // Sparkle shape (small diamond/star)
    const size = 2 + Math.random() * 3;
    this.moveTo(0, -size);
    this.lineTo(size * 0.5, 0);
    this.lineTo(0, size);
    this.lineTo(-size * 0.5, 0);
    this.closePath();
    
    this.fill({ color: color, alpha: 0.8 });
    this.blendMode = 'add';
  }

  update(delta: number) {
    this.x += this.velocity.x * delta;
    this.y += this.velocity.y * delta;
    this.rotation += this.rotationSpeed * delta;
    this.life -= delta;
    
    const progress = 1 - (this.life / this.maxLife);
    // Flickering effect
    const flicker = 0.5 + Math.sin(this.life * 0.5) * 0.5;
    this.alpha = (1 - progress) * flicker;
    this.scale.set((1 - progress) * 1.5);
  }
}

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
