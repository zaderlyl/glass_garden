// Vitesse du joueur, en pixels par seconde
// TODO(équipe): la déplacer dans constants.js quand ce fichier existera
const PLAYER_SPEED = 300;

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

    // * Les touches de déplacement (clavier AZERTY : Z Q S D)
    // TODO(équipe): déplacer les touches dans un InputManager (étape suivante)
    this.keys = this.input.keyboard.addKeys({
      up: 'Z',
      down: 'S',
      left: 'Q',
      right: 'D',
    });
  }

  // update() est appelée à chaque image (environ 60 fois par seconde)
  // `delta` est le temps écoulé depuis l'image précédente, en millisecondes
  update(time, delta) {
    // Direction : -1, 0 ou 1 sur chaque axe
    let x = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    let y = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);

    // * En diagonale, on divise par racine de 2, sinon on irait plus vite qu'en ligne droite
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }

    // * distance = vitesse x temps : le déplacement est le même quelle que soit la fréquence d'images
    const distance = PLAYER_SPEED * (delta / 1000);
    this.player.x += x * distance;
    this.player.y += y * distance;

    // On garde le joueur à l'intérieur de l'écran (displayWidth tient compte de l'agrandissement)
    const halfWidth = this.player.displayWidth / 2;
    const halfHeight = this.player.displayHeight / 2;
    this.player.x = Phaser.Math.Clamp(this.player.x, halfWidth, this.scale.width - halfWidth);
    this.player.y = Phaser.Math.Clamp(this.player.y, halfHeight, this.scale.height - halfHeight);
  }
}
