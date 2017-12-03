import * as Assets from '../assets';
import * as AssetUtils from '../utils/assetUtils';

export default class Winner extends Phaser.State {
  private googleFontText: Phaser.Text = null;
  private googleFontText2: Phaser.Text = null;

  public create(): void {
    this.googleFontText = this.game.add.text(this.game.width / 2, (this.game.height / 2) - 30, 'Winner, Winner...', {
      font: '50px ' + Assets.GoogleWebFonts.PressStart2P,
      fill: '#00AA00',
      align: 'center',
    });
    this.googleFontText2 = this.game.add.text(this.game.width / 2, (this.game.height / 2) + 30, 'You\'re no longer dinner!', {
      font: '40px ' + Assets.GoogleWebFonts.PressStart2P,
      fill: '#00AA00',
      align: 'center',
    });
    this.googleFontText.anchor.setTo(0.5, 0.5);
    this.googleFontText.alpha = 0;
    this.googleFontText.fixedToCamera = true;
    this.googleFontText2.anchor.setTo(0.5, 0.5);
    this.googleFontText2.alpha = 0;
    this.googleFontText2.fixedToCamera = true;
    this.game.add.tween(this.googleFontText).to({ alpha: 1 }, 1500, Phaser.Easing.Exponential.In, true);
    this.game.add.tween(this.googleFontText2).to({ alpha: 1 }, 1500, Phaser.Easing.Exponential.In, true, 2500);
    setTimeout(() => {
      this.game.add.tween(this.googleFontText).to({ alpha: 0 }, 1500, Phaser.Easing.Exponential.Out, true);
      this.game.add.tween(this.googleFontText2).to({ alpha: 0 }, 1500, Phaser.Easing.Exponential.Out, true);
    }, 6500);
    setTimeout(() => {
      this.googleFontText.destroy();
      this.googleFontText2.destroy();
      // Should be 'menu'..
      this.game.state.start('gameplay');
    }, 10000);
  }
}
