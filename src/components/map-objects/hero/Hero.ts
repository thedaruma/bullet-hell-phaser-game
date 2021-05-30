import State from "../../../game-state/State";
import { getKnockbackVector, styles } from "../../../lib/shared";
import ShockWave from "../misc/ShockWave";
import SparkleExplosion from "../misc/SparkleExplosion";

const TACKLE_VELOCITY = 4000;
const MOVEMENT_VELOCITY = 1000;
const TACKLE_MAX_VELOCITY = 800;
const MAX_VELOCITY = 400;

enum HeroStates {
  normal,
  super,
  superDuper,
}

export default class Hero extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  public invuln: boolean = false;
  public charging: boolean = false;
  public dead: boolean = false;
  private flashingInterval: NodeJS.Timeout;
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
    this.anims.play({
      key: "hero-idle",
    });
    this.setTint(styles.colors.lightGreen.hex);
  }

  init() {
    const b: any = this.body;
    b?.setDrag(500, 500);
    b?.setMaxVelocity(MAX_VELOCITY, MAX_VELOCITY);
    this.body.setCircle(33, 33, 5);
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

  private setFlashing() {
    this.flashingInterval = setInterval(() => {
      this.setAlpha(this.alpha === 1 ? 0.5 : 1);
    }, 15);
  }

  private setInvulnerable() {
    this.invuln = true;
    this.setFlashing();
    setTimeout(() => {
      this.invuln = false;
      clearInterval(this.flashingInterval);
      this.setAlpha(1);
    }, 2000);
  }

  public getHurt() {
    const state = State.getInstance();
    if (!this.invuln) {
      this.anims.stop();
      this.setFrame(5);
      if (state.getHeroHealth() > 1) {
        this.spasm();
      }
      this.setInvulnerable();
      this.knockBack();
      setTimeout(() => {
        if (!this.dead) {
          this.anims.play("hero-idle");
        }
      }, 500);
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
    this.anims.play({
      key: "hero-idle",
      frameRate: 60,
    });

    this.generateShadow();

    const b: any = this.body;
    this.charging = true;
    b?.setMaxVelocity(TACKLE_MAX_VELOCITY, TACKLE_MAX_VELOCITY);
    this.setVelocity(x, y);

    setTimeout(() => {
      this.charging = false;
      this.anims.play({
        key: "hero-idle",
      });
    }, 400);

    setTimeout(() => {
      b?.setMaxVelocity(MAX_VELOCITY, MAX_VELOCITY);
    }, 2000);
  }

  private spasm() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.setX(this.x + Math.random() * 25 * (i % 2 ? -1 : 1));
        this.setY(this.y + Math.random() * 25 * (i % 2 ? -1 : 1));
      }, i * 25);
    }
  }

  public kill() {
    clearInterval(this.flashingInterval);
    this.dead = true;
    this.anims.stop();
    this.setFrame(5);
    this.setVelocity(0, 0);
    this.setAcceleration(0, 0);
    return new Promise<void>(async (resolve) => {
      const playShockWave = () => {
        return new Promise<void>((resolve) => {
          new ShockWave(this.scene, this.x, this.y, 15, () => {
            resolve();
          });
        });
      };

      await playShockWave();

      this.setAlpha(0);
      await SparkleExplosion(this.scene, this.x, this.y);
      this.destroy();
      resolve();
    });
  }

  private generateShadow() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const shade = new Phaser.GameObjects.Sprite(
          this.scene,
          this.x,
          this.y,
          "hero"
        );
        shade.setTint(styles.colors.lightGreen.hex);
        shade.setAlpha(0.2);
        this.scene.add.existing(shade);
        setTimeout(() => {
          shade.destroy();
        }, 200);
      }, i * 50);
    }
  }

  private setInputs() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.cursors.space.addListener("down", () => {
      if (this.dead) return;
      const tackleVelocity = { x: 0, y: 0 };
      if (this.cursors.right.isDown) {
        tackleVelocity.x = TACKLE_VELOCITY;
      }
      if (this.cursors.left.isDown) {
        tackleVelocity.x = -TACKLE_VELOCITY;
      }
      if (this.cursors.down.isDown) {
        tackleVelocity.y = TACKLE_VELOCITY;
      }
      if (this.cursors.up.isDown) {
        tackleVelocity.y = -TACKLE_VELOCITY;
      }
      this.tackle(tackleVelocity.x, tackleVelocity.y);
    });

    this.cursors.down.addListener("down", () => {
      if (this.dead) return;
      this.setAccelerationY(MOVEMENT_VELOCITY);
    });
    this.cursors.down.addListener("up", () => this.stopMovement());

    this.cursors.up.addListener("down", () => {
      if (this.dead) return;
      this.setAccelerationY(-MOVEMENT_VELOCITY);
    });
    this.cursors.up.addListener("up", () => this.stopMovement());

    this.cursors.left.addListener("down", () => {
      if (this.dead) return;
      this.setAccelerationX(-MOVEMENT_VELOCITY);
    });
    this.cursors.left.addListener("up", () => this.stopMovement());

    this.cursors.right.addListener("down", () => {
      if (this.dead) return;
      this.setAccelerationX(MOVEMENT_VELOCITY);
    });
    this.cursors.right.addListener("up", () => this.stopMovement());
  }
}
