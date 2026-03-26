import { COLORS, GAME_CONSTANTS } from "@/constants";
import * as PIXI from "pixi.js";
import { AudioManager } from "./AudioManager";
import { EnemyType } from "@/types";
import { ExplosionManager, TrailManager } from "./effects";
import { CIWS, Enemy, Projectile } from "./entities";

export class GameEngine {
  private app: PIXI.Application;
  private ciws!: CIWS;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private explosionManager!: ExplosionManager;
  private trailManager!: TrailManager;
  private audioManager: AudioManager;
  private resizeHandler!: () => void;
  private initialized: boolean = false;

  public score: number = 0;
  public destroyedCount: number = 0;
  public missedCount: number = 0;
  private spawnTimer: number = 0;
  private spawnRate: number = GAME_CONSTANTS.SPAWN_RATE_DEFAULT;
  private projectileSpeed: number = GAME_CONSTANTS.PROJECTILE_SPEED;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new PIXI.Application();
    this.audioManager = new AudioManager();

    this.init(canvas);
  }

  private async init(canvas: HTMLCanvasElement) {
    try {
      await this.app.init({
        view: canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: GAME_CONSTANTS.BACKGROUND_COLOR,
        antialias: true,
      });

      this.explosionManager = new ExplosionManager(this.app.stage);
      this.trailManager = new TrailManager(this.app.stage);

      this.ciws = new CIWS(
        window.innerWidth / 2,
        window.innerHeight - GAME_CONSTANTS.CIWS_Y_OFFSET,
      );
      this.app.stage.addChild(this.ciws.container);

      this.app.ticker.add((ticker) => {
        this.update(ticker.deltaTime);
      });

      this.resizeHandler = () => {
        if (this.app.renderer) {
          this.app.renderer.resize(window.innerWidth, window.innerHeight);
        }
        if (this.ciws && !this.ciws.destroyed) {
          this.ciws.container.x = window.innerWidth / 2;
          this.ciws.container.y =
            window.innerHeight - GAME_CONSTANTS.CIWS_Y_OFFSET;
        }
      };
      window.addEventListener("resize", this.resizeHandler);
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize PixiJS", error);
    }
  }

  private update(delta: number) {
    if (!this.app.stage || this.app.stage.destroyed || !this.ciws) return;

    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnEnemy();
      this.spawnTimer = this.spawnRate;
      // Gradually increase difficulty
      this.spawnRate = Math.max(20, this.spawnRate * 0.995);
    }

    this.ciws.update(delta);

    // Find nearest enemy to aim
    let nearestEnemy: Enemy | null = null;
    let minDist = Infinity;

    for (const enemy of this.enemies) {
      if (enemy.destroyed || this.ciws.destroyed) continue;
      const dist = Math.hypot(
        enemy.container.x - this.ciws.container.x,
        enemy.container.y - this.ciws.container.y,
      );
      if (dist < minDist) {
        minDist = dist;
        nearestEnemy = enemy;
      }
    }

    if (nearestEnemy && !nearestEnemy.destroyed) {
      // Firing Control System (FCS) - Target Interception Prediction
      const tx = nearestEnemy.container.x;
      const ty = nearestEnemy.container.y;
      const vtx = nearestEnemy.velocity.x;
      const vty = nearestEnemy.velocity.y;

      const px = this.ciws.container.x;
      const py = this.ciws.container.y - 10;

      const dx = tx - px;
      const dy = ty - py;

      // Solve quadratic equation: at^2 + bt + c = 0 for time to impact
      const a =
        vtx * vtx + vty * vty - this.projectileSpeed * this.projectileSpeed;
      const b = 2 * (dx * vtx + dy * vty);
      const c = dx * dx + dy * dy;

      const discriminant = b * b - 4 * a * c;

      let t = 0;
      if (discriminant >= 0) {
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

        if (t1 > 0 && t2 > 0) t = Math.min(t1, t2);
        else if (t1 > 0) t = t1;
        else if (t2 > 0) t = t2;
      } else {
        t = 0;
      }

      const predictedX = tx + vtx * t;
      const predictedY = ty + vty * t;

      this.ciws.aimAt(predictedX, predictedY);

      if (this.ciws.canFire()) {
        this.fire();
      }
    } else {
      const idleAngle = -Math.PI / 2 + Math.sin(Date.now() / 1000) * 0.5;
      this.ciws.aimAt(
        this.ciws.container.x + Math.cos(idleAngle) * 100,
        this.ciws.container.y - 10 + Math.sin(idleAngle) * 100,
      );
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update(delta);

      // Collision check
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (e.destroyed || p.destroyed) continue;
        const dist = Math.hypot(
          p.container.x - e.container.x,
          p.container.y - e.container.y,
        );
        if (dist < e.radius + p.radius) {
          e.health--;
          p.dead = true;
          if (e.health <= 0) {
            this.destroyEnemy(e, j);
          }
          break;
        }
      }

      if (p.dead) {
        this.app.stage.removeChild(p.container);
        this.projectiles.splice(i, 1);
        p.destroy();
      }
    }

    // Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(delta);

      // Add Trails
      if (Math.random() > 0.3) {
        const tail = e.getTailPosition();

        // Sparkle trail for all missile types
        this.trailManager.addSparkleTrail(tail.x, tail.y, e.color);

        switch (e.type) {
          case EnemyType.MISSILE:
            this.trailManager.addTrail(tail.x, tail.y, COLORS.WHITE, 2, 15);
            this.trailManager.addTrail(tail.x, tail.y, COLORS.ORANGE, 1, 10);
            break;
          case EnemyType.SUPERFAST:
            this.trailManager.addTrail(tail.x, tail.y, COLORS.MAUVE, 2, 10);
            this.trailManager.addTrail(tail.x, tail.y, COLORS.WHITE, 1, 5);
            break;
          case EnemyType.SLOW:
            this.trailManager.addTrail(tail.x, tail.y, COLORS.ORANGE, 3, 20);
            this.trailManager.addTrail(tail.x, tail.y, COLORS.RED, 2, 12);
            break;
        }
      }

      // Impact check
      const distToCIWS = Math.hypot(
        e.container.x - this.ciws.container.x,
        e.container.y - this.ciws.container.y,
      );
      if (distToCIWS < 40) {
        this.explosionManager.bigExplode(e.container.x, e.container.y);

        // Play variant-specific explosion sound
        if (e.type === EnemyType.ULTRAFAST)
          this.audioManager.playExplosionUltrafast();
        else if (e.type === EnemyType.SUPERFAST)
          this.audioManager.playExplosionSuperfast();
        else if (e.type === EnemyType.SLOW)
          this.audioManager.playExplosionSlow();
        else this.audioManager.playExplosionMissile();

        e.dead = true;
        // Could add damage to CIWS here
      }

      if (e.dead) {
        // If it was not destroyed by CIWS, it's a miss (either impact or off-screen)
        if (!e.destroyed) {
          this.missedCount++;
        }
        this.app.stage.removeChild(e.container);
        this.enemies.splice(i, 1);
        e.destroy();
      }
    }

    this.explosionManager.update(delta);
    this.trailManager.update(delta);
  }

  private fire() {
    const spread = GAME_CONSTANTS.BULLET_SPREAD;
    const randomOffset = (Math.random() - 0.5) * spread;
    const muzzle = this.ciws.getMuzzlePosition();
    const p = new Projectile(
      muzzle.x,
      muzzle.y,
      this.ciws.angle + randomOffset,
      this.projectileSpeed,
    );
    this.projectiles.push(p);
    this.app.stage.addChild(p.container);
    this.audioManager.playGunfire();

    // Add Muzzle Flash
    this.trailManager.addMuzzleFlash(muzzle.x, muzzle.y, this.ciws.angle);
  }

  private spawnEnemy() {
    const x = Math.random() * window.innerWidth;
    const y = -50;
    const rand = Math.random();
    let type = EnemyType.MISSILE;
    if (rand < 0.1) type = EnemyType.ULTRAFAST;
    else if (rand < 0.2) type = EnemyType.SUPERFAST;
    else if (rand < 0.4) type = EnemyType.SLOW;

    const enemy = new Enemy(
      x,
      y,
      window.innerWidth / 2,
      window.innerHeight,
      type,
    );
    this.enemies.push(enemy);
    this.app.stage.addChild(enemy.container);
  }

  private destroyEnemy(enemy: Enemy, index: number) {
    this.explosionManager.explode(
      enemy.container.x,
      enemy.container.y,
      20,
      enemy.color,
    );

    // Play variant-specific explosion sound
    if (enemy.type === EnemyType.ULTRAFAST)
      this.audioManager.playExplosionUltrafast();
    else if (enemy.type === EnemyType.SUPERFAST)
      this.audioManager.playExplosionSuperfast();
    else if (enemy.type === EnemyType.SLOW)
      this.audioManager.playExplosionSlow();
    else this.audioManager.playExplosionMissile();

    this.app.stage.removeChild(enemy.container);
    this.enemies.splice(index, 1);
    enemy.destroy();
    this.destroyedCount++;
    this.score += 100;
  }

  public destroy() {
    this.initialized = false;
    if (this.app.ticker) {
      this.app.ticker.stop();
    }
    window.removeEventListener("resize", this.resizeHandler);
    if (this.app.stage && !this.app.stage.destroyed) {
      this.app.stage.destroy({ children: true });
    }
    try {
      this.app.destroy({
        removeView: true,
      });
    } catch (e) {
      console.warn("Error during Pixi app destruction", e);
    }
  }
}
