// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sound: any;

export class AudioManager {
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private async init() {
    try {
      const mod = await import("@pixi/sound");
      sound = mod.sound;

      sound.add("gunfire", "/resources/knok.wav");
      sound.add("explosion_slow", "/resources/firework_3.wav");
      sound.add("explosion_missile", "/resources/firework_2.wav");
      sound.add("explosion_superfast", "/resources/firework_1.wav");
      sound.add("explosion_ultrafast", "/resources/firework_0.wav");

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize Pixi Sound", error);
    }
  }

  public playGunfire() {
    if (!this.initialized) return;
    sound.play("gunfire", { volume: 0.15 });
  }

  public playExplosionMissile() {
    if (!this.initialized) return;
    sound.play("explosion_missile", { volume: 0.4 });
  }

  public playExplosionSuperfast() {
    if (!this.initialized) return;
    sound.play("explosion_superfast", { volume: 0.3 });
  }

  public playExplosionSlow() {
    if (!this.initialized) return;
    sound.play("explosion_slow", { volume: 0.6 });
  }

  public playExplosionUltrafast() {
    if (!this.initialized) return;
    sound.play("explosion_superfast", { volume: 0.9 });
  }
}
