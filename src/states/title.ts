import * as Assets from '../assets';
import * as AssetUtils from '../utils/assetUtils';

export default class Title extends Phaser.State {
  private googleFontText: Phaser.Text = null;
  private googleFontText2: Phaser.Text = null;

  public create(): void {
    let logo = this.game.add.image(this.game.width / 2, this.game.height / 2, Assets.Images.ImagesColossalgnomeLogo.getName());
    logo.anchor.setTo(0.5, 0.5);
    logo.scale.setTo(.5, .5);
    logo.alpha = 0;
    logo.fixedToCamera = true;

    this.googleFontText = this.game.add.text(this.game.width / 2, (this.game.height / 2), 'Presents', {
      font: '40px ' + Assets.GoogleWebFonts.PressStart2P,
      fill: '#FFFFFF',
      align: 'center',
    });
    this.googleFontText2 = this.game.add.text(this.game.width / 2, (this.game.height / 2), 'Maze Trudger!', {
      font: '50px ' + Assets.GoogleWebFonts.PressStart2P,
      fill: '#FFFFFF',
      align: 'center',
    });
    this.googleFontText.anchor.setTo(0.5, 0.5);
    this.googleFontText.alpha = 0;
    this.googleFontText.fixedToCamera = true;
    this.googleFontText2.anchor.setTo(0.5, 0.5);
    this.googleFontText2.alpha = 0;
    this.googleFontText2.fixedToCamera = true;

    setTimeout(() => this.game.add.tween(logo).to({ alpha: 1 }, 1500, Phaser.Easing.Linear.None, true), 500);
    setTimeout(() => this.game.add.tween(logo).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, true), 3500);
    setTimeout(() => this.game.add.tween(this.googleFontText).to({ alpha: 1 }, 1500, Phaser.Easing.Linear.None, true), 6000);
    setTimeout(() => this.game.add.tween(this.googleFontText).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, true), 8500);
    setTimeout(() => this.game.add.tween(this.googleFontText2).to({ alpha: 1 }, 1500, Phaser.Easing.Linear.None, true), 10500);
    setTimeout(() => this.game.add.tween(this.googleFontText2).to({ alpha: 0 }, 1500, Phaser.Easing.Linear.None, true), 13000);

    setTimeout(() => {
      logo.kill();
      this.googleFontText.kill();
      this.googleFontText2.kill();
      // Should be 'menu'..
      this.game.state.start('gameplay');
    }, 15000);
  }
}
