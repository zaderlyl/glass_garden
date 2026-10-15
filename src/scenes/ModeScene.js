import { SCENES, UI_IMAGES, GAME_MODES } from '../utils/constants.js';
import { setGameMode } from '../systems/GameMode.js';

/**
 * * L'écran de choix du mode (Solo ou Multi) : une image plein écran où la carte choisie est surlignée.
 * Gauche choisit Solo, droite choisit Multi, Entrée valide : le mode est retenu (GameMode.js) et le jeu se lance.
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

    // * Les images font déjà 1280 x 720 : elles sont simplement centrées. Au départ, Solo est choisi.
    this.mode = GAME_MODES.SOLO;
    this.background = this.add.image(width / 2, height / 2, UI_IMAGES.MODE_SOLO.KEY);

    // * Gauche : Solo. Droite : Multi.
    this.input.keyboard.on('keydown-LEFT', () => this.choose(GAME_MODES.SOLO));
    this.input.keyboard.on('keydown-RIGHT', () => this.choose(GAME_MODES.MULTI));

    // * Entrée : on retient le mode choisi et on lance le jeu (une seule fois, même si la touche est maintenue)
    this.input.keyboard.once('keydown-ENTER', () => {
      setGameMode(this.mode);
      this.scene.start(SCENES.HUB);
    });
  }

  /** Surligne la carte de ce mode (en changeant l'image) et le retient dans this.mode. */
  choose(mode) {
    this.mode = mode;
    this.background.setTexture(mode === GAME_MODES.MULTI ? UI_IMAGES.MODE_MULTI.KEY : UI_IMAGES.MODE_SOLO.KEY);
  }
}
