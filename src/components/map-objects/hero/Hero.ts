import { getKnockbackVector, styles } from "../../../lib/shared";

const TACKLE_VELOCITY = 4000;
const MOVEMENT_VELOCITY = 1000;
const TACKLE_MAX_VELOCITY = 800;
const MAX_VELOCITY = 400;

export default class Hero extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  public invuln: boolean = false;
  public charging: boolean = false;
  constructor(scene, x, y) {
    super(scene, x, y, "hero", 0);
    this.scene.add.existing(this);
    this.setInputs();
    this.anims.create({
      repeat: -1,
      key: "hero-idle",
      frames: this.anims.generateFrameNumbers("hero", {
        frames: [0, 1, 2, 3, 4, 3, 2, 1],
      }),
      frameRate: 18,
    });
    this.anims.play("hero-idle");
    this.setTint(styles.colors.lightGreen);
  }

  init() {
    const b: any = this.body;
    b?.setDrag(500, 500);
    b?.setMaxVelocity(MAX_VELOCITY, MAX_VELOCITY);
    this.body.setSize(50, 50);
  }

  private stopMovement() {
    if (this.noCursorsDown()) {
      this.setAccelerationY(0);
      this.setAccelerationX(0);
    }
  }
  private noCursorsDown() {
    return (
      !this.cursors.down.isDown &&
      !this.cursors.up.isDown &&
      !this.cursors.left.isDown &&
      !this.cursors.right.isDown
    );
  }

  private flashing() {
    return setInterval(() => {
      this.setAlpha(this.alpha === 1 ? 0.5 : 1);
    }, 15);
  }

  private setInvulnerable() {
    this.invuln = true;
    const flashingInterval = this.flashing();

    setTimeout(() => {
      this.invuln = false;
      clearInterval(flashingInterval);
      this.setAlpha(1);
    }, 2000);
  }

  public getHurt() {
    if (!this.invuln) {
      this.setInvulnerable();
      this.knockBack();
    }
  }

  public knockBack(severity = MOVEMENT_VELOCITY) {
    const { x, y } = getKnockbackVector(this.body, severity);
    this.setVelocity(x, y);
  }

  private tackle(x, y) {
    if (this.charging) {
      return;
    }
    const b: any = this.body;
    this.charging = true;
    b?.setMaxVelocity(TACKLE_MAX_VELOCITY, TACKLE_MAX_VELOCITY);
    this.setVelocity(x, y);

    setTimeout(() => {
      this.charging = false;
    }, 400);

    setTimeout(() => {
      b?.setMaxVelocity(MAX_VELOCITY, MAX_VELOCITY);
    }, 2000);
  }

  private setInputs() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.cursors.space.addListener("down", () => {
      if (this.cursors.right.isDown) {
        this.tackle(TACKLE_VELOCITY, 0);
      }
      if (this.cursors.left.isDown) {
        this.tackle(-TACKLE_VELOCITY, 0);
      }
      if (this.cursors.down.isDown) {
        this.tackle(0, TACKLE_VELOCITY);
      }
      if (this.cursors.up.isDown) {
        this.tackle(0, -TACKLE_VELOCITY);
      }
    });

    this.cursors.down.addListener("down", () => {
      this.setAccelerationY(MOVEMENT_VELOCITY);
    });
    this.cursors.down.addListener("up", () => this.stopMovement());

    this.cursors.up.addListener("down", () => {
      this.setAccelerationY(-MOVEMENT_VELOCITY);
    });
    this.cursors.up.addListener("up", () => this.stopMovement());

    this.cursors.left.addListener("down", () => {
      this.setAccelerationX(-MOVEMENT_VELOCITY);
    });
    this.cursors.left.addListener("up", () => this.stopMovement());

    this.cursors.right.addListener("down", () => {
      this.setAccelerationX(MOVEMENT_VELOCITY);
    });
    this.cursors.right.addListener("up", () => this.stopMovement());
  }
}