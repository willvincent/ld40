import * as Assets from '../assets';

export default class Title extends Phaser.State {
  private floorTilesSprite: Phaser.Sprite = null;
  private player;
  private cursors: Phaser.CursorKeys = null;
  private spaces = [];
  private unparsed = [];
  private playerSpeed = 185;
  private parsedCount = 0;
  private mazeHeight = 15;
  private mazeWidth = 25;
  private totalMuck = 0;
  private playerStartX = Math.floor(Math.random() * ((this.mazeWidth / 2) - 1));
  private playerStartY = Math.floor(Math.random() * ((this.mazeHeight / 2) - 1));

  public create(): void {
    this.game.world.setBounds(0, 0, (64 * this.mazeWidth), (64 * this.mazeHeight));
    const upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
    const downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    const leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    const rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    
    upKey.onDown.add(this.move, this);
    downKey.onDown.add(this.move, this);
    leftKey.onDown.add(this.move, this);
    rightKey.onDown.add(this.move, this);

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        let muck = false;
        if (Math.random() > .7) {
          if (this.totalMuck < Math.floor(.3 * (this.mazeHeight * this.mazeWidth))) {
            this.totalMuck++;
            muck = true;
          }
        }
        if (!this.spaces[y]) {
          this.spaces[y] = [];
        }
        if (!this.unparsed[y]) {
          this.unparsed[y] = [];
        }
        this.unparsed[y][x] = true;
        this.spaces[y][x] = {
          sprite: this.game.add.sprite(x * 64, y * 64, Assets.Atlases.AtlasesFloorTiles.getName(), 'unvisited'),
          version: Math.floor(Math.random() * 4),
          visited: false,
          visible: false,
          doors: [0, 0, 0, 0],
          muck,
        };
      }
    }

    let totalCells = this.mazeHeight * this.mazeWidth;
    let currentCell = [
      Math.floor(Math.random() * this.mazeHeight),
      Math.floor(Math.random() * this.mazeWidth),
    ];

    let path = [currentCell];
    this.unparsed[currentCell[0]][currentCell[1]] = false;
    this.parsedCount = 1;

    while (this.parsedCount < totalCells) {
      // Determine neighboring cells
      let potential = [
        [currentCell[0] - 1, currentCell[1], 0, 2],
        [currentCell[0], currentCell[1] + 1, 1, 3],
        [currentCell[0] + 1, currentCell[1], 2, 0],
        [currentCell[0], currentCell[1] - 1, 3, 1],
      ];
      let neighbors = [];

      // Determine if each neighboring cell is in game grid, and whether it has already been checked
      for (let l = 0; l < 4; l++) {
        if (potential[l][0] > -1 && potential[l][0] < this.mazeHeight && potential[l][1] > -1 && potential[l][1] < this.mazeWidth && this.unparsed[potential[l][0]][potential[l][1]]) { neighbors.push(potential[l]); }
      }

      if (neighbors.length) {
        // Choose one of the neighbors at random
        let next = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Remove the wall between the current cell and the chosen neighboring cell
        this.spaces[currentCell[0]][currentCell[1]].doors[next[2]] = 1;
        this.spaces[next[0]][next[1]].doors[next[3]] = 1;
        this.spaces[currentCell[0]][currentCell[1]].sprite.frameName = `f${this.spaces[currentCell[0]][currentCell[1]].doors.join('')}0${this.spaces[currentCell[0]][currentCell[1]].version}00`;
        this.spaces[next[0]][next[1]].sprite.frameName = `f${this.spaces[next[0]][next[1]].doors.join('')}0${this.spaces[next[0]][next[1]].version}00`;

        // Mark the neighbor as visited, and set it as the current cell
        this.unparsed[next[0]][next[1]] = false;
        this.parsedCount++;
        currentCell = [next[0], next[1]];
        path.push(currentCell);
      }
      // Otherwise go back up a step and keep going
      else {
        currentCell = path.pop();
      }
    }

    this.spaces[this.playerStartY][this.playerStartX].visible = true;
    this.spaces[this.playerStartY][this.playerStartX].visited = true;
    for (let i = 0; i < 4; i++) {
      if (this.spaces[this.playerStartY][this.playerStartX].doors[i]) {
        if (i == 0) {
          this.spaces[this.playerStartY - 1][this.playerStartX].visible = true;
          this.spaces[this.playerStartY - 1][this.playerStartX].sprite.frameName = `f${this.spaces[this.playerStartY - 1][this.playerStartX].doors.join('')}0${this.spaces[this.playerStartY - 1][this.playerStartX].version}00`;
        } else if (i == 1) {
          this.spaces[this.playerStartY][this.playerStartX + 1].visible = true;
          this.spaces[this.playerStartY][this.playerStartX + 1].sprite.frameName = `f${this.spaces[this.playerStartY][this.playerStartX + 1].doors.join('')}0${this.spaces[this.playerStartY][this.playerStartX + 1].version}00`;
        } else if (i == 2) {
          this.spaces[this.playerStartY + 1][this.playerStartX].visible = true;
          this.spaces[this.playerStartY + 1][this.playerStartX].sprite.frameName = `f${this.spaces[this.playerStartY + 1][this.playerStartX].doors.join('')}0${this.spaces[this.playerStartY + 1][this.playerStartX].version}00`;
        } else if (i == 3) {
          this.spaces[this.playerStartY][this.playerStartX - 1].visible = true;
          this.spaces[this.playerStartY][this.playerStartX - 1].sprite.frameName = `f${this.spaces[this.playerStartY][this.playerStartX - 1].doors.join('')}0${this.spaces[this.playerStartY][this.playerStartX - 1].version}00`;
        }
      }
    }

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (!this.spaces[y][x].visible) {
          this.spaces[y][x].sprite.frameName = 'unvisited';
        }
        // TODO: Maybe instead of a looping animatino frames should just randomly change between the three every few ms, with random intervals/timeouts? looping doesn't look like the flicker of a torch...
        this.spaces[y][x].sprite.animations.add('flicker', Phaser.Animation.generateFrameNames(`f${this.spaces[y][x].doors.join('')}0${this.spaces[y][x].version}`, 1, 3, '', 2), 1.9, true, false);
      }
    }

    this.spaces[this.playerStartY][this.playerStartX].sprite.play('flicker');

    this.player = {
      sprite: this.game.add.sprite((this.playerStartX * 64) + 32, (this.playerStartY * 64) + 32, Assets.Spritesheets.SpritesheetsMainCharacter64647.getName(), 2),
      location: [this.playerStartY,this.playerStartX],
      health: 100,
      muck: 0,
    };

    this.player.sprite.anchor.set(0.5, 0.5);
    this.player.sprite.animations.add('walk', [0, 1, 2, 3, 4, 4, 3, 2, 1, 0], 20, true);
    // this.game.camera.flash(0x000000, 1000);
    this.game.camera.follow(this.player.sprite);
  }


  private move(key): void {
    // if (!this.player.sprite.animations.currentAnim.isPlaying) {
    
      switch (key.event.key) {
        case 'ArrowUp':
          this.game.add.tween(this.player.sprite).to( { angle: -90 }, 20, Phaser.Easing.Linear.None, true);
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
              this.player.sprite.animations.stop(0, true);
              this.updateVisibles();
            }, this.playerSpeed);
          }
          break;
        case 'ArrowRight':
          this.game.add.tween(this.player.sprite).to( { angle: 0 }, 20, Phaser.Easing.Linear.None, true);
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
              this.player.sprite.animations.stop(0, true);
              this.updateVisibles();
            }, this.playerSpeed);
          }
          break;
        case 'ArrowDown':
          this.game.add.tween(this.player.sprite).to( { angle: 90 }, 20, Phaser.Easing.Linear.None, true);
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
              this.player.sprite.animations.stop(0, true);
              this.updateVisibles();
            }, this.playerSpeed);
          }
          break;
        case 'ArrowLeft':
          this.game.add.tween(this.player.sprite).to( { angle: 180 }, 20, Phaser.Easing.Linear.None, true);
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
              this.player.sprite.animations.stop(0, true);
              this.updateVisibles();
            }, this.playerSpeed);
            
          }
          break;
      // }
    }
  }

  private updateVisibles(): void {
    const xy = this.player.location;
    this.spaces[xy[0]][xy[1]].sprite.play('flicker');
    this.spaces[xy[0]][xy[1]].visited = true;
    for (let i = 0; i < 4; i++) {
      if (this.spaces[xy[0]][xy[1]].doors[i]) {
        if (i == 0) {
          this.spaces[xy[0] - 1][xy[1]].visible = true;
          if (!this.spaces[xy[0] - 1][xy[1]].visited)
            this.spaces[xy[0] - 1][xy[1]].sprite.frameName = `f${this.spaces[xy[0] - 1][xy[1]].doors.join('')}0${this.spaces[xy[0] - 1][xy[1]].version}00`;
        } else if (i == 1) {
          this.spaces[xy[0]][xy[1] + 1].visible = true;
          if (!this.spaces[xy[0]][xy[1] + 1].visited)
            this.spaces[xy[0]][xy[1] + 1].sprite.frameName = `f${this.spaces[xy[0]][xy[1] + 1].doors.join('')}0${this.spaces[xy[0]][xy[1] + 1].version}00`;
        } else if (i == 2) {
          this.spaces[xy[0] + 1][xy[1]].visible = true;
          if (!this.spaces[xy[0] + 1][xy[1]].visited)
            this.spaces[xy[0] + 1][xy[1]].sprite.frameName = `f${this.spaces[xy[0] + 1][xy[1]].doors.join('')}0${this.spaces[xy[0] + 1][xy[1]].version}00`;
        } else if (i == 3) {
          this.spaces[xy[0]][xy[1] - 1].visible = true;
          if (!this.spaces[xy[0]][xy[1] - 1].visited)
            this.spaces[xy[0]][xy[1] - 1].sprite.frameName = `f${this.spaces[xy[0]][xy[1] - 1].doors.join('')}0${this.spaces[xy[0]][xy[1] - 1].version}00`;
        }
      }
    }
  }
}
