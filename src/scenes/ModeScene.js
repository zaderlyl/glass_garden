import { SCENES, UI_IMAGES } from '../utils/constants.js';

/**
 * * L'écran de choix du mode (Solo ou Multi) : une image plein écran où la carte choisie est surlignée.
 * Pour l'instant il n'affiche que Solo surligné. Prochaines étapes : gauche/droite pour changer de carte, Entrée pour lancer
 * le jeu.
 */
export default class ModeScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MODE);
  }

  preload() {
    this.load.image(UI_IMAGES.MODE_SOLO.KEY, UI_IMAGES.MODE_SOLO.PATH);
    this.load.image(UI_IMAGES.MODE_MULTI.KEY, UI_IMAGES.MODE_MULTI.PATH);
  }

  create() {
    const { width, height } = this.scale;

    // * Les images font déjà 1280 x 720 : elles sont simplement centrées
    this.add.image(width / 2, height / 2, UI_IMAGES.MODE_SOLO.KEY);
  }
}
