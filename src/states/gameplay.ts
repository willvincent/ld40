import * as Assets from '../assets';

import Creature from '../utils/creature';
import Hud from '../utils/hud';
import Maze from '../utils/maze';


export default class Gameplay extends Phaser.State {
  private player;
  private spaces = [];
  private creatures = [];
  private playerSpeed = 185;
  private mazeHeight = 30;
  private mazeWidth = 50;
  private maxMuck = 3; // Could change with a difficulty setting...
  private muckPercentage = .3; // Could change with a difficulty setting...
  private playerStartX = Math.floor(Math.random() * ((this.mazeWidth / 2) - 1));
  private playerStartY = Math.floor(Math.random() * ((this.mazeHeight / 2) - 1));
  private flareActive = false;
  private hudBars = {};
  private groups;
  private googleFontText: Phaser.Text = null;

  public create(): void {
    console.log(Assets.GoogleWebFonts);
    this.game.world.setBounds(0, 0, (64 * this.mazeWidth), (64 * this.mazeHeight));

    // Define sprite layer groups:
    this.groups = {
      flareLayer: this.game.add.group(),
      baseLayer: this.game.add.group(),
      muckLayer: this.game.add.group(),
      itemsLayer: this.game.add.group(),
      playerLayer: this.game.add.group(),
      creatureLayer: this.game.add.group(),
      hudLayer: this.game.add.group(),
    };

    this.spaces = Maze.generateMaze(this.mazeWidth, this.mazeHeight);

    Maze.initFlareLayer(this.mazeWidth, this.mazeHeight, this.spaces, this.groups);

    Maze.slingMuck(
      this.spaces,
      this.maxMuck,
      this.muckPercentage,
      this.playerStartX,
      this.playerStartY,
      this.mazeHeight,
      this.mazeWidth,
      this.groups
    );

    Maze.populateGoodies(
      this.spaces,
      this.playerStartX,
      this.playerStartY,
      this.mazeHeight,
      this.mazeWidth,
      this.groups
    );

    this.player = {
      sprite: this.groups.playerLayer.create((this.playerStartX * 64) + 32, (this.playerStartY * 64) + 32, Assets.Spritesheets.SpritesheetsMainCharacter64647.getName(), 2),
      location: [this.playerStartY, this.playerStartX],
      health: 100,
      flares: 0,
      muck: 0,
    };

    Hud.setupBars(this.player, this.hudBars, this.groups, this.game, this.playerStartY);

    this.googleFontText = this.game.add.text(this.game.width / 2, this.game.height / 2, 'Good Luck...', {
      font: '50px ' + Assets.GoogleWebFonts.PressStart2P,
      fill: '#CCAA00',
      align: 'center',
    });
    this.googleFontText.anchor.setTo(0.5, 0.5);
    this.googleFontText.alpha = 0;
    this.googleFontText.fixedToCamera = true;
    this.game.add.tween(this.googleFontText).to({ alpha: 1 }, 1000, Phaser.Easing.Exponential.In, true);
    setTimeout(() => this.game.add.tween(this.googleFontText).to({ alpha: 0 }, 1000, Phaser.Easing.Exponential.Out, true), 1750);
    setTimeout(() => this.googleFontText.kill(), 3000);


    this.player.sprite.anchor.set(0.5, 0.5);
    this.player.sprite.z = 1000;
    this.player.sprite.animations.add('walk', [0, 1, 2, 3, 4, 4, 3, 2, 1, 0], 20, true);
    this.game.camera.follow(this.player.sprite);

    setInterval(() => {
      if (this.player.muck) {
        this.player.muck--;
      }
      if (this.player.health < 100) {
        this.player.health++;
      }
    }, 3000);

    setInterval(() => {
      if (this.player.health < 100) {
        this.player.health++;
      }
    }, 2350);

    Maze.visitCell(this.player, this.spaces, this.groups);

    // Movement handling
    const upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
    const downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    const leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    const rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    const spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    spaceKey.onDown.add(() => {
      if (this.player.flares && !this.flareActive) {
        console.log('Throwing a Flare!');
        this.player.flares--;
        this.flareActive = true;
        Maze.throwFlare(this.game);
        setTimeout(() => this.flareActive = false, 12000);
      }
    });

    upKey.onDown.add(() => this.move('up'));
    downKey.onDown.add(() => this.move('down'));
    leftKey.onDown.add(() => this.move('left'));
    rightKey.onDown.add(() => this.move('right'));
  }

  public update(): void {
    // interate through all creatures (if any),
    // - Check if contacting player, if so, deal damage
    // - Check player muck level, kill off creatures as necessary
    if (this.creatures) {
      // console.log(this.creatures);
      for (let i = 0; i < this.creatures.length; i++) {
        if (this.creatures[i]) {
          let creature = this.creatures[i];
          // console.log(creature);

          // Creature visibility tweening
          if (this.spaces[creature.location[0]][creature.location[1]].visible) {
            this.game.add.tween(creature.sprite).to({ alpha: 1 }, 350, Phaser.Easing.Exponential.Out, true);
          } else {
            this.game.add.tween(creature.sprite).to({ alpha: 0 }, 350, Phaser.Easing.Exponential.Out, true);
          }
          if (!creature.moving) {

            let yx = Creature.determineNextCell(creature, this.player.location, this.spaces, this.mazeHeight, this.mazeWidth);
            Creature.move(creature, yx, this.game);
            if (creature.location[0] === this.player.location[0] && creature.location[1] === this.player.location[1]) {
              // Damage the user!
              this.player.health -= Math.floor(Math.random() * 15) + 2;

              // Throw some blood around!
              let blood = this.groups.playerLayer.create(
                (yx[1] * 64) + 32,
                (yx[0] * 64) + 32,
                Assets.Spritesheets.SpritesheetsBlood646410.getName(),
                0
              );

              blood.animations.add('spurt', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 60, false, true);
              blood.anchor.setTo(0.5, 0.5);
              blood.alpha = .8;
              blood.angle = Math.random() * 360;
              blood.play('spurt');
              setTimeout(() => {
                blood.kill();
              }, 125);
            }
          }
        }
      }
    }

    Hud.updateBars(this.player, this.hudBars);

    if (this.player.health === 0) {
      this.game.state.start('dead');
    }

    if (this.player.location[0] === 0) {
      for (const key of Object.keys(this.hudBars)) {
        this.game.add.tween(this.hudBars[key]).to({ alpha: .25 }, 250, Phaser.Easing.Linear.None, true);
      }
    } else {
      for (const key of Object.keys(this.hudBars)) {
        this.game.add.tween(this.hudBars[key]).to({ alpha: 1 }, 250, Phaser.Easing.Linear.None, true);
      }
    }

    if (this.creatures.length !== this.player.muck) {
      if (this.creatures.length > this.player.muck) {
        let num = (this.creatures.length - this.player.muck);
        for (let i = 0; i < num; i++) {
          this.game.add.tween(this.creatures[i].sprite).to({ alpha: 0 }, 250, Phaser.Easing.Linear.None, true);
          setTimeout(() => {
            if (this.creatures[i].sprite) {
              this.creatures[i].sprite.kill();
            }
          }, 300);
        }
        setTimeout(() => this.creatures.splice(0, num), 500);
      } else {
        let num = (this.player.muck - this.creatures.length);
        for (let i = 0; i < num; i++) {
          Creature.spawn(this.mazeWidth, this.mazeHeight, this.groups, this.creatures);
        }
      }
    }

    if (DEBUG) {
      this.game.debug.text(`There are ${this.creatures.length} creatures in the maze...`, 10, 660);
      this.game.debug.text(`Player health: ${this.player.health}, flares: ${this.player.flares}, muck: ${this.player.muck}`, 10, 680);
    }
  }

  private move(direction): void {
    switch (direction) {
      case 'up':
        this.game.add.tween(this.player.sprite).to({ angle: -90 }, 20, Phaser.Easing.Linear.None, true);
        // if Can move up, move 64 px up.
        if (this.player.location[0] > 0 && this.spaces[this.player.location[0]][this.player.location[1]].doors[0]) {
          this.player.sprite.play('walk');
          this.player.location[0]--;
          this.game.add.tween(this.player.sprite).to({
            x: (this.player.location[1] * 64) + 32,
            y: (this.player.location[0] * 64) + 32,
          },
            this.playerSpeed,
            Phaser.Easing.Linear.None,
            true);
          setTimeout(() => {
            this.player.sprite.animations.stop(this.player.sprite.animations.currentCell, false);
            Maze.visitCell(this.player, this.spaces, this.groups);
          }, this.playerSpeed + Math.floor(Math.random() * 100));
        }
        break;
      case 'right':
        this.game.add.tween(this.player.sprite).to({ angle: 0 }, 20, Phaser.Easing.Linear.None, true);
        // if Can move right, move 64 px right.
        if (this.player.location[1] < this.mazeWidth - 1 && this.spaces[this.player.location[0]][this.player.location[1]].doors[1]) {
          this.player.sprite.play('walk');
          this.player.location[1]++;
          this.game.add.tween(this.player.sprite).to({
            x: (this.player.location[1] * 64) + 32,
            y: (this.player.location[0] * 64) + 32,
          },
            this.playerSpeed,
            Phaser.Easing.Linear.None,
            true);
          setTimeout(() => {
            this.player.sprite.animations.stop(this.player.sprite.animations.currentCell, false);
            Maze.visitCell(this.player, this.spaces, this.groups);
          }, this.playerSpeed + Math.floor(Math.random() * 100));
        }
        break;
      case 'down':
        this.game.add.tween(this.player.sprite).to({ angle: 90 }, 20, Phaser.Easing.Linear.None, true);
        // if Can move down, move 64 px down.
        if (this.player.location[0] < this.mazeHeight - 1 && this.spaces[this.player.location[0]][this.player.location[1]].doors[2]) {
          this.player.sprite.play('walk');
          this.player.location[0]++;
          this.game.add.tween(this.player.sprite).to({
            x: (this.player.location[1] * 64) + 32,
            y: (this.player.location[0] * 64) + 32,
          },
            this.playerSpeed,
            Phaser.Easing.Linear.None,
            true);
          setTimeout(() => {
            this.player.sprite.animations.stop(this.player.sprite.animations.currentCell, false);
            Maze.visitCell(this.player, this.spaces, this.groups);
          }, this.playerSpeed + Math.floor(Math.random() * 100));
        }
        break;
      case 'left':
        this.game.add.tween(this.player.sprite).to({ angle: 180 }, 20, Phaser.Easing.Linear.None, true);
        // if Can move left, move 64 px left.
        if (this.player.location[1] > 0 && this.spaces[this.player.location[0]][this.player.location[1]].doors[3]) {
          this.player.sprite.play('walk');
          this.player.location[1]--;
          this.game.add.tween(this.player.sprite).to({
            x: (this.player.location[1] * 64) + 32,
            y: (this.player.location[0] * 64) + 32,
          },
            this.playerSpeed,
            Phaser.Easing.Linear.None,
            true);
          setTimeout(() => {
            this.player.sprite.animations.stop(this.player.sprite.animations.currentCell, false);
            Maze.visitCell(this.player, this.spaces, this.groups);
          }, this.playerSpeed + Math.floor(Math.random() * 100));

        }
        break;
    }
    if (this.player.location[0] === (this.mazeHeight - 1) && this.player.location[1] === (this.mazeWidth - 1)) {
      // Win!
      console.log('Win!');
      this.game.state.start('winner');
    }
  }
}
