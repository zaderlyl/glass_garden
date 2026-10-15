import { SCENES, UI_IMAGES } from '../utils/constants.js';

/**
 * * L'écran d'accueil : une image plein écran (le titre est dessiné dedans).
 * Prochaine étape : Entrée pour lancer le jeu.
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  preload() {
    this.load.image(UI_IMAGES.HOME.KEY, UI_IMAGES.HOME.PATH);
  }

  // create() est appelée une fois, quand la scène démarre
  create() {
    const { width, height } = this.scale;

    // * L'image fait déjà 1280 x 720 : elle est simplement centrée
    this.add.image(width / 2, height / 2, UI_IMAGES.HOME.KEY);
  }
}
