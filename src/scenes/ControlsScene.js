import { SCENES, UI_IMAGES, FONT_FAMILY, DIALOGUE, CONTROL_MODES, CONTROLS_PAGE, MENU_COMMANDS_INDEX } from '../utils/constants.js';
import { BINDINGS } from '../systems/InputManager.js';

/** Le nom d'une touche tel qu'on l'affiche : « ENTER » devient « Entrée » (les lettres restent telles quelles). */
const keyLabel = (key) => ({ ENTER: 'Entrée', SPACE: 'Espace', SHIFT: 'Maj' }[key] ?? key);

/**
 * * La page « Commandes » : les touches du mode arcade des deux joueurs, sur un cadre en parchemin posé sur l'image d'accueil
 * assombrie. Les touches sont lues dans BINDINGS (InputManager.js) : la page reste juste si on les change pour la borne.
 * O (ou Échap) revient à l'accueil.
 */
export default class ControlsScene extends Phaser.Scene {
  constructor() {
    super(SCENES.CONTROLS);
  }

  preload() {
    this.load.image(UI_IMAGES.HOME.KEY, UI_IMAGES.HOME.PATH);
  }

  create() {
    const { width, height } = this.scale;
    const { FRAME, TITLE, COLUMNS_X, PLAYER_Y, FIRST_ROW_Y, ROW_SPACING, ROWS, BACK } = CONTROLS_PAGE;

    // * Le fond : l'image d'accueil, assombrie
    this.add.image(width / 2, height / 2, UI_IMAGES.HOME.KEY);
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, CONTROLS_PAGE.DIM_ALPHA);

    // * Le cadre en parchemin (les couleurs de la boîte de dialogue)
    const frame = this.add.graphics();
    frame.fillStyle(DIALOGUE.COLORS.PAPER, 1).fillRoundedRect(FRAME.X, FRAME.Y, FRAME.WIDTH, FRAME.HEIGHT, FRAME.RADIUS);
    frame.lineStyle(FRAME.BORDER, DIALOGUE.COLORS.BORDER, 1).strokeRoundedRect(FRAME.X, FRAME.Y, FRAME.WIDTH, FRAME.HEIGHT, FRAME.RADIUS);

    const text = (x, y, content, size, bold = false) =>
      this.add.text(x, y, content, { fontFamily: FONT_FAMILY, fontSize: size, fontStyle: bold ? 'bold' : 'normal', color: DIALOGUE.COLORS.TEXT }).setOrigin(0.5);

    text(width / 2, TITLE.Y, 'Commandes', TITLE.SIZE, true);

    // * Une colonne par joueur : son nom, puis une ligne par action (le libellé, et dessous la touche)
    [1, 2].forEach((player, column) => {
      const keys = BINDINGS[CONTROL_MODES.ARCADE][player];
      const x = COLUMNS_X[column];
      text(x, PLAYER_Y, `Joueur ${player}`, CONTROLS_PAGE.PLAYER_SIZE, true);
      ROWS.forEach(([label, action], row) => {
        const y = FIRST_ROW_Y + row * ROW_SPACING;
        text(x, y - 18, label, CONTROLS_PAGE.ACTION_SIZE);
        // * Le déplacement se fait au joystick (sur la borne, chaque joueur a le sien) : on n'affiche pas ses touches
        text(x, y + 16, action === 'move' ? 'Joystick' : keyLabel(keys[action]), CONTROLS_PAGE.KEY_SIZE, true);
      });
    });

    // * O (le bouton de retour de la borne) ou Échap : retour à l'accueil, sur le bouton « Commandes »
    text(width / 2, BACK.Y, BACK.TEXT, BACK.SIZE);
    const back = () => {
      if (this.leaving) return;
      this.leaving = true; // une touche maintenue répète l'événement : on ne lance la scène qu'une fois
      this.scene.start(SCENES.MENU, { selected: MENU_COMMANDS_INDEX });
    };
    this.leaving = false;
    this.input.keyboard.on('keydown-O', back);
    this.input.keyboard.on('keydown-ESC', back);
  }
}
