import * as Assets from '../assets';

export default {

  spawn(width, height, groups, creatures) {
    // Should _maybe_ take into consideration the user's current position and not spawn directly on top of them...
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);

    let creature = {
      location: [y, x],
      sprite: groups.creatureLayer.create((x * 64) + 32, (y * 64) + 32, Assets.Spritesheets.SpritesheetsCreature64647.getName()),
    };

    creature.sprite.anchor.setTo(0.45, 0.51);
    creature.sprite.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7], 8, true);
    creature.sprite.tint = Math.random() * 0xffffff;
    creature.sprite.play('walk');
    creature.sprite.alpha = 0;

    creatures.push(creature);
  },

  // Simple, dumb stalking because pathfinding is proving to be too resource heavy AND not working right.
  determineNextCell(creature, playerYX, spaces, height, width) {
    const y = creature.location[0];
    const x = creature.location[1];

    let options = [];
    if (spaces[y][x].doors[0]) {
      options.push([y - 1, x]);
    } 
    if (spaces[y][x].doors[1]) {
      options.push([y, x + 1]);
    } 
    if (spaces[y][x].doors[2]) {
      options.push([y + 1, x]);
    }
    if (spaces[y][x].doors[3]) {
      options.push([y, x - 1]);
    }

    if (options.length > 1 && creature.lastLocation) {
      for (let i = 0; i < options.length; i++) {
        if (options[i][0] === creature.lastLocation[0] && options[i][1] === creature.lastLocation[1]) {
          options.splice(i, 1);
          break;
        }
      }
    }

    if (options[Math.floor(Math.random() * options.length)]) {
      return options[Math.floor(Math.random() * options.length)];
    }
  },

  move(creature, yx, game) {
    creature.moving = true;
    // Up
    if (yx[0] < creature.location[0]) {
      game.add.tween(creature.sprite).to({ angle: 0 }, 20, Phaser.Easing.Linear.None, true);
      creature.sprite.play('walk');
      creature.lastLocation = [...creature.location];
      creature.location[0]--;
      game.add.tween(creature.sprite).to({
        x: (creature.location[1] * 64) + 32,
        y: (creature.location[0] * 64) + 32,
      },
      350,
      Phaser.Easing.Linear.None,
      true);
      setTimeout(() => {
        creature.sprite.animations.stop(creature.sprite.animations.currentCell, false);
        creature.moving = false;
      }, 350 + Math.floor(Math.random() * 100));
    }
    // Right
    if (yx[1] > creature.location[1]) {
      game.add.tween(creature.sprite).to({ angle: 90 }, 20, Phaser.Easing.Linear.None, true);
      creature.sprite.play('walk');
      creature.lastLocation = [...creature.location];
      creature.location[1]++;
      game.add.tween(creature.sprite).to({
        x: (creature.location[1] * 64) + 32,
        y: (creature.location[0] * 64) + 32,
      },
      350,
      Phaser.Easing.Linear.None,
      true);
      setTimeout(() => {
        creature.sprite.animations.stop(creature.sprite.animations.currentCell, false);
        creature.moving = false;
      }, 350 + Math.floor(Math.random() * 100));
    }
    // Down
    if (yx[0] > creature.location[0]) {
      game.add.tween(creature.sprite).to({ angle: 180 }, 20, Phaser.Easing.Linear.None, true);
      creature.sprite.play('walk');
      creature.lastLocation = [...creature.location];
      creature.location[0]++;
      game.add.tween(creature.sprite).to({
        x: (creature.location[1] * 64) + 32,
        y: (creature.location[0] * 64) + 32,
      },
      350,
      Phaser.Easing.Linear.None,
      true);
      setTimeout(() => {
        creature.sprite.animations.stop(creature.sprite.animations.currentCell, false);
        creature.moving = false;
      }, 350 + Math.floor(Math.random() * 100));
    }
    // Left
    if (yx[1] < creature.location[1]) {
      game.add.tween(creature.sprite).to({ angle: -90 }, 20, Phaser.Easing.Linear.None, true);
      creature.sprite.play('walk');
      creature.lastLocation = [...creature.location];
      creature.location[1]--;
      game.add.tween(creature.sprite).to({
        x: (creature.location[1] * 64) + 32,
        y: (creature.location[0] * 64) + 32,
      },
      350,
      Phaser.Easing.Linear.None,
      true);
      setTimeout(() => {
        creature.sprite.animations.stop(creature.sprite.animations.currentCell, false);
        creature.moving = false;
      }, 350 + Math.floor(Math.random() * 100));
    }
  }
};