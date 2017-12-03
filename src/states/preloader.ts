import * as Assets from '../assets';
import * as AssetUtils from '../utils/assetUtils';

export default class Preloader extends Phaser.State {
  private preloadBarSprite: Phaser.Sprite = null;
  private preloadFrameSprite: Phaser.Sprite = null;
  private googleFontText: Phaser.Text = null;

  public preload(): void {
    this.googleFontText = this.game.add.text(this.game.width / 2, (this.game.height / 2) - 80, 'Loading...', {
      font: '35px ' + Assets.GoogleWebFonts.PressStart2P,
      fill: '#EEEEEE',
      align: 'center',
    });
    this.googleFontText.anchor.setTo(0.5, 0.5);
    this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Atlases.AtlasesPreloadSpritesArray.getName(), Assets.Atlases.AtlasesPreloadSpritesArray.Frames.PreloadBar);
    this.preloadBarSprite.anchor.setTo(0, 0.5);
    this.preloadBarSprite.x -= this.preloadBarSprite.width * 0.5;

    this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Atlases.AtlasesPreloadSpritesArray.getName(), Assets.Atlases.AtlasesPreloadSpritesArray.Frames.PreloadFrame);
    this.preloadFrameSprite.anchor.setTo(0.5);

    this.game.load.setPreloadSprite(this.preloadBarSprite);

    AssetUtils.Loader.loadAllAssets(this.game, this.waitForSoundDecoding, this);
  }

  private waitForSoundDecoding(): void {
    AssetUtils.Loader.waitForSoundDecoding(this.startGame, this);
  }

  private startGame(): void {
    this.game.camera.onFadeComplete.addOnce(this.loadTitle, this);
    this.game.camera.fade(0x000000, 1000);
  }

  private loadTitle(): void {
    this.game.state.start('title');
  }
}


// TODO: Need a less fugly bootloader, and include colossal gnome logo screen.

// TODO: Need a proper menu screen

// TODO: Gameplay & Art -- need a player than can be moved, camera to follow player
// TODO: Gameplay & Art -- need creatures that stalk player
// TODO: Gameplay -- need to reveal map as user moves around
// TODO: Gameplay -- would be nice to include the flare idea to temporarily reveal some of the map
// TODO: Health meter, encountering a creature shouldn't necessarily be _instant_ death
// TODO: Muck attractant, and half-life logic


// TODO: maybe have many levels of the maze? so ladders up & down in various places?
// TODO: Audio! Don't put off until the very end...
// TODO: Logo/Icon for packaging the game
// TODO: Screenshots & Writeup for publishing.

