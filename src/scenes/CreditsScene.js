import { SCENES, UI_IMAGES, CREDITS_PAGE } from '../utils/constants.js';
import { createParchmentPage } from '../systems/ParchmentPage.js';

/**
 * * La page « Crédits » : le cadre du développement (projet de SAE, BUT MMI, IUT de Béziers) et l'équipe, sur un cadre en
 * parchemin posé sur l'image d'accueil assombrie. Le texte est dans CREDITS_PAGE (constants.js).
 */
export default class CreditsScene extends Phaser.Scene {
  constructor() {
    super(SCENES.CREDITS);
  }

  preload() {
    this.load.image(UI_IMAGES.HOME.KEY, UI_IMAGES.HOME.PATH);
  }

  create() {
    const text = createParchmentPage(this, 'Crédits');
    CREDITS_PAGE.LINES.forEach(({ TEXT, Y, SIZE, BOLD }) => text(this.scale.width / 2, Y, TEXT, SIZE, BOLD));
  }
}
