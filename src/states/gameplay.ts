import * as Assets from '../assets';
import Maze from '../utils/maze';

export default class Gameplay extends Phaser.State {
  private player;
  private spaces = [];
  private playerSpeed = 185;
  private mazeHeight = 25;
  private mazeWidth = 45;
  private maxMuck = 3; // Would change with a difficulty setting...
  private muckPercentage = .3; // Would change with a difficulty setting...
  private playerStartX = Math.floor(Math.random() * ((this.mazeWidth / 2) - 1));
  private playerStartY = Math.floor(Math.random() * ((this.mazeHeight / 2) - 1));
  private flareActive = false;
  private groups;

  public create(): void {
    this.game.world.setBounds(0, 0, (64 * this.mazeWidth), (64 * this.mazeHeight));

    // Define sprite layer groups:
    this.groups = {
      flareLayer: this.game.add.group(),
      baseLayer: this.game.add.group(),
      muckLayer: this.game.add.group(),
      itemsLayer: this.game.add.group(),
      creatureLayer: this.game.add.group(),
      playerLayer: this.game.add.group(),
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
      flares: 3,
      muck: 0,
    };

    this.player.sprite.anchor.set(0.5, 0.5);
    this.player.sprite.z = 1000;
    this.player.sprite.animations.add('walk', [0, 1, 2, 3, 4, 4, 3, 2, 1, 0], 20, true);
    this.game.camera.follow(this.player.sprite);

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
  }
}
