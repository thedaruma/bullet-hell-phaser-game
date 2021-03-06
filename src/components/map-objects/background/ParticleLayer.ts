import { styles } from "../../../lib/styles";

export default class Particle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "star", Math.floor(Math.random() * 4));
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.setTint(styles.colors.light.hex);
    this.setAlpha(Math.min(Math.random(), 0.3));
  }
  init() {
    this.setVelocity(0, Math.max(Math.random() * 2000, 1000));
  }
}
