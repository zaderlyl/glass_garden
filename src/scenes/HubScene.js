/**
 * * Le jardin du spawn : le monde normal, d'où partiront les miroirs.
 * Pour l'instant : on y affiche seulement le joueur 1.
 */
export default class HubScene extends Phaser.Scene {
  constructor() {
    super('HubScene');
  }

  // preload() charge les images avant que create() ne démarre
  preload() {
    // * Le spritesheet est découpé en images de 32 x 32 pixels (4 images côte à côte)
    this.load.spritesheet('player_1', 'assets/images/player_1_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    const { width, height } = this.scale;

    // * On affiche la première image (frame 0) du spritesheet, au centre de l'écran
    this.player = this.add.sprite(width / 2, height / 2, 'player_1', 0);

    // * Le sprite est petit : on l'agrandit dans le jeu (x3), pas dans le fichier
    this.player.setScale(3);
  }
}
