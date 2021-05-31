import { jiggle } from "../../lib/animation/Animations";
import { styles } from "../../lib/shared";

export default class Egg extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "egg", 0);
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.anims.create({
      repeat: -1,
      key: "egg-idle",
      frames: this.anims.generateFrameNumbers("egg", {
        frames: [0, 1],
      }),
      frameRate: 3,
    });
    this.anims.create({
      repeat: -1,
      key: "egg-sleep",
      frames: this.anims.generateFrameNumbers("egg", {
        frames: [3, 4, 5, 4],
      }),
      frameRate: 3,
    });
    this.sleep();
    this.body.setCircle(255);
    this.setBounce(1, 1);
    this.setTint(styles.colors.white.hex);
  }

  jiggle() {
    jiggle(this, this.scene, () => {}).play();
  }

  idle() {
    this.anims.play("egg-idle");
  }

  sleep() {
    this.anims.play("egg-sleep");
  }
  wake() {
    this.anims.stop();
    this.setFrame(6);
  }
}
