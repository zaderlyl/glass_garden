import { SCENES, UI_IMAGES, MENU_BUTTONS, FONT_FAMILY } from '../utils/constants.js';

/**
 * * L'écran d'accueil : une image plein écran (le titre est dessiné dedans).
 * Elle a 4 boutons (Jouer, Réglages, Commandes, Crédits). Entrée mène au choix du mode (ModeScene).
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  preload() {
    this.load.image(UI_IMAGES.HOME.KEY, UI_IMAGES.HOME.PATH);
    this.load.image(UI_IMAGES.BUTTON.KEY, UI_IMAGES.BUTTON.PATH);
  }

  // create() est appelée une fois, quand la scène démarre
  create() {
    const { width, height } = this.scale;

    // * L'image fait déjà 1280 x 720 : elle est simplement centrée
    this.add.image(width / 2, height / 2, UI_IMAGES.HOME.KEY);

    // * Les 4 boutons, empilés au centre. Le pixel art reste net : filtre « au plus proche » et agrandissement entier.
    this.textures.get(UI_IMAGES.BUTTON.KEY).setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.buttons = MENU_BUTTONS.LABELS.map((label, i) => {
      const y = MENU_BUTTONS.FIRST_Y + i * MENU_BUTTONS.SPACING;
      const image = this.add.image(width / 2, y, UI_IMAGES.BUTTON.KEY).setScale(MENU_BUTTONS.SCALE);
      const text = this.add
        .text(width / 2, y, label, {
          fontFamily: FONT_FAMILY,
          fontSize: MENU_BUTTONS.TEXT.SIZE,
          fontStyle: 'bold',
          color: MENU_BUTTONS.TEXT.COLOR,
          stroke: MENU_BUTTONS.TEXT.STROKE,
          strokeThickness: MENU_BUTTONS.TEXT.STROKE_THICKNESS,
        })
        .setOrigin(0.5);
      return { label, image, text };
    });

    // * Entrée : on passe au choix du mode (une seule fois, même si la touche est maintenue)
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start(SCENES.MODE));
  }
}
