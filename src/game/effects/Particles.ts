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
