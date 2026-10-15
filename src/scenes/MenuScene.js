import { SCENES, UI_IMAGES } from '../utils/constants.js';

/**
 * * L'écran d'accueil : une image plein écran (le titre est dessiné dedans).
 * Prochaines étapes : l'image à la bonne taille, puis Entrée pour lancer le jeu.
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

    // * L'image est centrée et étirée aux dimensions de l'écran (elle est au même format 16:9)
    this.add.image(width / 2, height / 2, UI_IMAGES.HOME.KEY).setDisplaySize(width, height);
  }
}
