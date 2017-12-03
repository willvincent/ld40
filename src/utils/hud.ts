import * as Assets from '../assets';

let healthBG;
let healthBitmap;
let smellyBG;
let smellyBitmap;

export default {
  setupBars(player, bars, groups, game, startY) {
    healthBG = game.add.bitmapData(200, 20);
    healthBG.ctx.beginPath();
    healthBG.ctx.rect(0, 0, healthBG.width, healthBG.height);
    healthBG.ctx.fillStyle = '#000000';
    healthBG.ctx.fill();

    // create a Sprite using the background bitmap data
    bars.healthBG = groups.hudLayer.create(31, 20, healthBG);
    bars.healthBG.fixedToCamera = true;

    // create a red rectangle to use as the health meter itself
    healthBitmap = game.add.bitmapData(196, 16);
    healthBitmap.ctx.beginPath();
    healthBitmap.ctx.rect(0, 0, healthBitmap.width, healthBitmap.height);
    healthBitmap.ctx.fillStyle = '#AA0000';
    healthBitmap.ctx.fill();

    // create the health Sprite using the red rectangle bitmap data
    bars.healthBar = groups.hudLayer.create(33, 22, healthBitmap);
    bars.healthBar.fixedToCamera = true;

    bars.healthIcon = groups.hudLayer.create(6, 6, Assets.Images.ImagesHeart.getName());
    bars.healthIcon.fixedToCamera = true;


    smellyBG = game.add.bitmapData(200, 20);
    smellyBG.ctx.beginPath();
    smellyBG.ctx.rect(0, 0, smellyBG.width, smellyBG.height);
    smellyBG.ctx.fillStyle = '#000000';
    smellyBG.ctx.fill();

    // create a Sprite using the background bitmap data
    bars.smellyBG = groups.hudLayer.create(game.width - (200 + 31), 20, smellyBG);
    bars.smellyBG.fixedToCamera = true;

    // create a red rectangle to use as the health meter itself
    smellyBitmap = game.add.bitmapData(196, 16);
    smellyBitmap.ctx.beginPath();
    smellyBitmap.ctx.rect(0, 0, smellyBitmap.width, smellyBitmap.height);
    smellyBitmap.ctx.fillStyle = '#00AA00';
    // smellyBitmap.ctx.fill();

    // create the health Sprite using the red rectangle bitmap data
    bars.smellyBar = groups.hudLayer.create(game.width - (200 + 33), 22, smellyBitmap);
    bars.smellyBar.fixedToCamera = true;

    bars.smellyIcon = groups.hudLayer.create(game.width - 64, 6, Assets.Images.ImagesSmelly.getName());
    bars.smellyIcon.fixedToCamera = true;


    bars.flares = groups.hudLayer.create((game.width - 128) / 2, 0, Assets.Spritesheets.SpritesheetsFlareBar128646.getName(), 0);
    bars.flares.fixedToCamera = true;

    if (startY === 0) {
      for (const key of Object.keys(bars)) {
        bars[key].alpha = .25;
      }
    }
  },

  updateBars(player, bars) {
    let a = (100 - player.health) / 100;
    let health = 196 - (196 * a);

    bars.healthBar.key.context.clearRect(0, 0, bars.healthBar.width, bars.healthBar.height);
    bars.healthBar.key.context.fillRect(0, 0, health, 16);
    bars.healthBar.key.dirty = true;

    let b = (100 - player.muck) / 100;
    if (b > 100) b = 100;
    let smelly = 196 - (196 * b);
    let offset = 196 - smelly;

    bars.smellyBar.key.context.clearRect(0, 0, bars.smellyBar.width, bars.smellyBar.height);
    bars.smellyBar.key.context.fillRect(offset, 0, smelly, 16);
    bars.smellyBar.key.dirty = true;

    bars.flares.frame = player.flares;
  }
};