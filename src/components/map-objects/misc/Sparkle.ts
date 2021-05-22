import { styles } from "../../../lib/shared";

export default class Sparkle extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, frameRate = 9) {
    super(scene, x, y, "sparkle", 0);
    this.scene.add.existing(this);
    this.anims.create({
      repeat: 0,
      key: "sparkle-animate",
      frames: this.anims.generateFrameNumbers("sparkle", {
        frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      }),
      frameRate,
    });
    this.on("animationcomplete", () => {
      this.destroy();
    });
    this.anims.play({
      key: "sparkle-animate",
    });

    this.setTint(styles.colors.green);
    this.setAlpha(0.5);
  }
}