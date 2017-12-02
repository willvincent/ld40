import * as Assets from '../assets';

export default class Title extends Phaser.State {
  private floorTilesSprite: Phaser.Sprite = null;
  private spaces = [];
  private unparsed = [];
  private parsedCount = 0;
  private mazeHeight = 82;
  private mazeWidth = 150;
  private totalMuck = 0;

  public create(): void {
    // // Set up all of the possible visited floor tile animations:
    // for (let i = 0; i < 4; i++) {
    //   this.floorTilesSprite.animations.add(`f00010${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f00100${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f01000${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f10000${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f00110${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f01010${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f10010${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f01100${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f10100${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f11000${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f01110${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f10110${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f11010${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f11100${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    //   this.floorTilesSprite.animations.add(`f11110${i}`, Phaser.Animation.generateFrameNames(`f01010${i}`, 1, 3, '', 2), 2.7, true, false);
    // }

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

    this.spaces[0][0].visible = true;
    this.spaces[0][1].visible = true;
    this.spaces[1][0].visible = true;
    this.spaces[1][1].visible = true;
    this.spaces[2][0].visible = true;
    this.spaces[2][1].visible = true;
    this.spaces[2][2].visible = true;    
    this.spaces[3][0].visible = true;
    this.spaces[3][1].visible = true;
    
    

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        if (!this.spaces[y][x].visible) {
          this.spaces[y][x].sprite.frameName = 'unvisited';
        }
        // TODO: Maybe instead of a looping animatino frames should just randomly change between the three every few ms, with random intervals/timeouts? looping doesn't look like the flicker of a torch...
        this.spaces[y][x].sprite.animations.add('flicker', Phaser.Animation.generateFrameNames(`f${this.spaces[y][x].doors.join('')}0${this.spaces[y][x].version}`, 1, 3, '', 2), (Math.random() * 16) + 12, true, false);
      }
    }

    this.spaces[0][0].sprite.play('flicker');
    this.spaces[1][0].sprite.play('flicker');
    this.spaces[2][0].sprite.play('flicker');
    this.spaces[2][1].sprite.play('flicker');
    
    

    console.log(this.spaces);

    this.game.camera.flash(0x000000, 1000);
  }
}
