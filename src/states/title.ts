import * as Assets from '../assets';

export default class Title extends Phaser.State {
  private floorTilesSprite: Phaser.Sprite = null;
  private spaces = [];

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

    

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (!this.spaces[x]) {
          this.spaces[x] = [];
        }
        this.spaces[x][y] = {
          sprite: this.game.add.sprite(x * 64, y * 64, Assets.Atlases.AtlasesFloorTiles.getName(), 'unvisited'),
          version: Math.floor(Math.random() * 4),
          visited: false,
        }
      }
    }

    console.log(this.spaces);

    this.game.camera.flash(0x000000, 1000);
  }
}
