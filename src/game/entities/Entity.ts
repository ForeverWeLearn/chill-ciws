import * as PIXI from "pixi.js";

export abstract class Entity {
  public container: PIXI.Container;
  public dead: boolean = false;
  public radius: number = 10;

  constructor() {
    this.container = new PIXI.Container();
  }

  abstract update(delta: number): void;

  public destroy() {
    if (this.container && !this.container.destroyed) {
      this.container.destroy({ children: true });
    }
  }

  public get destroyed(): boolean {
    return !this.container || this.container.destroyed;
  }
}
