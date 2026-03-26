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

      sound.add("gunfire", "/resources/mouse_click.wav");
      sound.add("explosion_slow", "/resources/piano_0.wav");
      sound.add("explosion_missile", "/resources/piano_1.wav");
      sound.add("explosion_superfast", "/resources/piano_2.wav");
      sound.add("explosion_ultrafast", "/resources/piano_3.wav");

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize Pixi Sound", error);
    }
  }

  public playGunfire() {
    if (!this.initialized) return;
    sound.play("gunfire", { volume: 0.2 });
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
}
