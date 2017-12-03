import * as Assets from '../assets';

const flareLayer = [];

export default {
  generateMaze(width, height) {
    const spaces = [];
    const unparsed = [];
    const totalCells = width * height;
    let parsedCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!spaces[y]) {
          spaces[y] = [];
        }
        if (!unparsed[y]) {
          unparsed[y] = [];
        }
        unparsed[y][x] = true;
        spaces[y][x] = {
          doors: [0, 0, 0, 0],
          version: Math.floor(Math.random() * 4),
          visible: false,
          visited: false,
        };
      }
    }

    let currentCell = [
      Math.floor(Math.random() * height),
      Math.floor(Math.random() * width),
    ];

    let path = [currentCell];
    unparsed[currentCell[0]][currentCell[1]] = false;
    parsedCount = 1;

    while (parsedCount < totalCells) {

      let potential = [
        [currentCell[0] - 1, currentCell[1], 0, 2],
        [currentCell[0], currentCell[1] + 1, 1, 3],
        [currentCell[0] + 1, currentCell[1], 2, 0],
        [currentCell[0], currentCell[1] - 1, 3, 1],
      ];
      let neighbors = [];

      // Determine if each neighboring cell is in game grid, and whether it has already been checked
      for (let i = 0; i < 4; i++) {
        if (potential[i][0] > -1 && potential[i][0] < height && potential[i][1] > -1 && potential[i][1] < width && unparsed[potential[i][0]][potential[i][1]]) { neighbors.push(potential[i]); }
      }

      if (neighbors.length) {
        // Choose one of the neighbors at random
        let next = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Remove the wall between the current cell and the chosen neighboring cell
        spaces[currentCell[0]][currentCell[1]].doors[next[2]] = 1;
        spaces[next[0]][next[1]].doors[next[3]] = 1;

        // Mark the neighbor as visited, and set it as the current cell
        unparsed[next[0]][next[1]] = false;
        parsedCount++;
        currentCell = [next[0], next[1]];
        path.push(currentCell);
      }
      // Otherwise go back up a step and keep going
      else {
        currentCell = path.pop();
      }
    }

    return spaces;
  },

  slingMuck(spaces, maxMuck, muckPercentage, playerStartX, playerStartY, height, width, groups) {
    let totalMuck = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        spaces[y][x].muck = 0;
        // Give the player a _tiny_ break and omit muck from their starting position.
        if (x !== playerStartX && y !== playerStartY) {
          if (Math.random() > .5) {
            if (totalMuck < Math.floor(muckPercentage * (height * width))) {
              totalMuck++;
              spaces[y][x].muck = Math.floor(Math.random() * maxMuck) + 1;
              spaces[y][x].muckSprite = groups.muckLayer.create((x * 64) + 32, (y * 64) + 32, Assets.Spritesheets.SpritesheetsMuck64643.getName(), spaces[y][x].muck - 1);
              spaces[y][x].muckSprite.scale.setTo(.85, .85);
              spaces[y][x].muckSprite.anchor.setTo(0.5, 0.5);
              spaces[y][x].muckSprite.angle = Math.floor(Math.random() * 360);
              spaces[y][x].muckSprite.alpha = 0; // .4 for normal visibility.
            }
          }
        }
      }
    }
  },

  populateGoodies(spaces, playerStartX, playerStartY, mazeHeight, mazeWidth, groups) {
    let numItems = Math.floor(Math.random() * (mazeHeight * mazeWidth * .15));

    console.log(`Populating ${numItems} goodies!`);

    while (numItems > 0) {
      // Pick a random cell
      const x = Math.floor(Math.random() * mazeWidth);
      const y = Math.floor(Math.random() * mazeHeight);

      if (x !== playerStartX && y !== playerStartY) {
        if (!spaces[y][x].item) {
          if (Math.random() > .5) {
            spaces[y][x].item = 'health';
            // Add health item sprite
            spaces[y][x].itemSprite = groups.itemsLayer.create((64 * x) + 32, (64 * y) + 32, Assets.Images.ImagesHealth.getName());
            spaces[y][x].itemSprite.anchor.setTo(.5, .5);
            spaces[y][x].itemSprite.scale.setTo(.7, .7);
            spaces[y][x].itemSprite.alpha = 0;
          } else {
            spaces[y][x].item = 'flare';
            // Add flare item sprite
            spaces[y][x].itemSprite = groups.itemsLayer.create((64 * x) + 32, (64 * y) + 32, Assets.Images.ImagesFlare.getName());
            spaces[y][x].itemSprite.anchor.setTo(.5, .5);
            spaces[y][x].itemSprite.scale.setTo(.7, .7);
            spaces[y][x].itemSprite.alpha = 0;
          }
          numItems--;
        }
      }
    }
  },

  visitCell(player, spaces, groups) {
    const y = player.location[0];
    const x = player.location[1];
    spaces[y][x].visible = true;
    spaces[y][x].visited = true;
    if (!spaces[y][x].sprite) {
      spaces[y][x].sprite = groups.baseLayer.create(x * 64, y * 64, Assets.Atlases.AtlasesFloorTiles.getName(), `f${spaces[y][x].doors.join('')}0${spaces[y][x].version}00`);
      spaces[y][x].sprite.animations.add('flicker', Phaser.Animation.generateFrameNames(`f${spaces[y][x].doors.join('')}0${spaces[y][x].version}`, 1, 3, '', 2), 1.9, true, false);
    }
    spaces[y][x].sprite.play('flicker');

    // TODO: We should play a sound and maybe some sort of text feedback for these.. 
    if (spaces[y][x].item) {
      if (spaces[y][x].item === 'flare') {
        console.log('Sweet! A flare!');
        player.flares++;
      } else {
        console.log('Ahh, health. Nice.');
        player.health += 25;
        if (player.health > 100) {
          player.health = 100;
        }
      }
      delete(spaces[y][x].item);
      spaces[y][x].itemSprite.kill();
    }

    // TODO: We should play a sound and maybe some sort of text feedback for these..
    if (spaces[y][x].muck) {
      player.muck += 3;
      if (player.muck > 100) player.muck = 100;
      console.log('Eww, I stepped in something...');
      spaces[y][x].muck--;
      if (spaces[y][x].muck === 0) {
        spaces[y][x].muckSprite.kill();
      } else {
        spaces[y][x].muckSprite.frame = spaces[y][x].muck - 1;
        spaces[y][x].muckSprite.scale.setTo(.85, .85);
        spaces[y][x].muckSprite.anchor.setTo(0.5, 0.5);
        spaces[y][x].muckSprite.angle = Math.floor(Math.random() * 360);
        spaces[y][x].muckSprite.alpha = .4; // .4 for normal visibility.
      }
    }

    for (let i = 0; i < 4; i++) {
      if (spaces[y][x].doors[i]) {
        if (i === 0) {
          spaces[y - 1][x].visible = true;
          if (!spaces[y - 1][x].sprite) {
            spaces[y - 1][x].sprite = groups.baseLayer.create(x * 64, (y - 1) * 64, Assets.Atlases.AtlasesFloorTiles.getName(), `f${spaces[y - 1][x].doors.join('')}0${spaces[y - 1][x].version}00`);
            spaces[y - 1][x].sprite.animations.add('flicker', Phaser.Animation.generateFrameNames(`f${spaces[y - 1][x].doors.join('')}0${spaces[y - 1][x].version}`, 1, 3, '', 2), 1.9, true, false);
          }
          if (spaces[y - 1][x].muck) {
            spaces[y - 1][x].muckSprite.alpha = .4;
            spaces[y - 1][x].muckSprite.frame = spaces[y - 1][x].muck - 1;
          }
          if (spaces[y - 1][x].item) {
            spaces[y - 1][x].itemSprite.alpha = 1;
          }
        } else if (i === 1) {
          spaces[y][x + 1].visible = true;
          if (!spaces[y][x + 1].sprite) {
            spaces[y][x + 1].sprite = groups.baseLayer.create((x + 1) * 64, y * 64, Assets.Atlases.AtlasesFloorTiles.getName(), `f${spaces[y][x + 1].doors.join('')}0${spaces[y][x + 1].version}00`);
            spaces[y][x + 1].sprite.animations.add('flicker', Phaser.Animation.generateFrameNames(`f${spaces[y][x + 1].doors.join('')}0${spaces[y][x + 1].version}`, 1, 3, '', 2), 1.9, true, false);
          }
          if (spaces[y][x + 1].muck) {
            spaces[y][x + 1].muckSprite.alpha = .4;
            spaces[y][x + 1].muckSprite.frame = spaces[y][x + 1].muck - 1;
          }
          if (spaces[y][x + 1].item) {
            spaces[y][x + 1].itemSprite.alpha = 1;
          }
        } else if (i === 2) {
          spaces[y + 1][x].visible = true;
        if (!spaces[y + 1][x].sprite) {
          spaces[y + 1][x].sprite = groups.baseLayer.create(x * 64, (y + 1) * 64, Assets.Atlases.AtlasesFloorTiles.getName(), `f${spaces[y + 1][x].doors.join('')}0${spaces[y + 1][x].version}00`);
          spaces[y + 1][x].sprite.animations.add('flicker', Phaser.Animation.generateFrameNames(`f${spaces[y + 1][x].doors.join('')}0${spaces[y + 1][x].version}`, 1, 3, '', 2), 1.9, true, false);
        }
        if (spaces[y + 1][x].muck) {
          spaces[y + 1][x].muckSprite.alpha = .4;
          spaces[y + 1][x].muckSprite.frame = spaces[y + 1][x].muck - 1;
        }
        if (spaces[y + 1][x].item) {
          spaces[y + 1][x].itemSprite.alpha = 1;
        }
        } else if (i === 3) {
          spaces[y][x - 1].visible = true;
          if (!spaces[y][x - 1].sprite) {
            spaces[y][x - 1].sprite = groups.baseLayer.create((x - 1) * 64, y * 64, Assets.Atlases.AtlasesFloorTiles.getName(), `f${spaces[y][x - 1].doors.join('')}0${spaces[y][x - 1].version}00`);
            spaces[y][x - 1].sprite.animations.add('flicker', Phaser.Animation.generateFrameNames(`f${spaces[y][x - 1].doors.join('')}0${spaces[y][x - 1].version}`, 1, 3, '', 2), 1.9, true, false);
          }
          if (spaces[y][x - 1].muck) {
            spaces[y][x - 1].muckSprite.alpha = .4;
            spaces[y][x - 1].muckSprite.frame = spaces[y][x - 1].muck - 1;
          }
          if (spaces[y][x - 1].item) {
            spaces[y][x - 1].itemSprite.alpha = 1;
          }
        }
      }
    }
  },

  initFlareLayer(width, height, spaces, groups) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!flareLayer[y]) {
          flareLayer[y] = [];
        }
        flareLayer[y][x] = {
          empty: groups.flareLayer.create(x * 64, y * 64, Assets.Atlases.AtlasesFloorTiles.getName(), 'unvisited'),
          lit: groups.flareLayer.create(x * 64, y * 64, Assets.Atlases.AtlasesFloorTiles.getName(), `f${spaces[y][x].doors.join('')}0${spaces[y][x].version}00`),
        };
        flareLayer[y][x].lit.alpha = 0;
      }
    }
  },

  // TODO: Would be cool if the flare were more localized around the player position, rather than lighting up _everything_ ...
  throwFlare(game) {
    for (let y = 0; y < flareLayer.length; y++) {
      for (let x = 0; x < flareLayer[y].length; x++) {
        game.add.tween(flareLayer[y][x].lit).to({alpha: .9}, 4000, Phaser.Easing.Exponential.Out, true);
        setTimeout(() => game.add.tween(flareLayer[y][x].lit).to({alpha: 0}, 4000, Phaser.Easing.Exponential.In, true), 7500);
      }
    }
  },

};