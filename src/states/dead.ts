import * as Assets from '../assets';
import * as AssetUtils from '../utils/assetUtils';

export default class Dead extends Phaser.State {
  private googleFontText: Phaser.Text = null;

  public create(): void {
    this.googleFontText = this.game.add.text(this.game.width / 2, this.game.height / 2, 'You Died.. :(', {
      font: '50px ' + Assets.GoogleWebFonts.PressStart2P,
      fill: '#AA0000',
      align: 'center',
    });
    this.googleFontText.anchor.setTo(0.5, 0.5);
    this.googleFontText.alpha = 0;
    this.googleFontText.fixedToCamera = true;
    this.game.add.tween(this.googleFontText).to({ alpha: 1 }, 1500, Phaser.Easing.Exponential.In, true);
    setTimeout(() => this.game.add.tween(this.googleFontText).to({ alpha: 0 }, 1500, Phaser.Easing.Exponential.Out, true), 6500);
    setTimeout(() => {
      this.googleFontText.destroy();
      // Should be 'menu'..
      this.game.state.start('gameplay');
    }, 10000);
  }
}
