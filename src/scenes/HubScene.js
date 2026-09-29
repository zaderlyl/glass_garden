// Vitesse du joueur, en pixels par seconde
// TODO(équipe): la déplacer dans constants.js quand ce fichier existera
const PLAYER_SPEED = 300;

// Numéro de l'image du spritesheet pour chaque direction
const FRAMES = { UP: 0, RIGHT: 1, LEFT: 2, DOWN: 3 };

/**
 * * Le jardin du spawn : le monde normal, d'où partiront les miroirs.
 * Pour l'instant : la carte de test et le joueur 1, placé au point de départ.
 */
export default class HubScene extends Phaser.Scene {
  constructor() {
    super('HubScene');
  }

  // preload() charge les images avant que create() ne démarre
  preload() {
    // * Le spritesheet est découpé en images de 32 x 32 pixels (4 images côte à côte)
    this.load.spritesheet('player_1', 'assets/images/sprites/player_1_spritesheet.png', {
      frameWidth: 32,
      frameHeight: 32,
    });

    // * La carte (JSON exporté de Tiled) et l'image de son tileset
    this.load.tilemapTiledJSON('hub_map', 'assets/maps/hub_test.json');
    this.load.image('tileset_garden', 'assets/images/tilesets/tileset_garden.png');
  }

  create() {
    // * On construit la carte à partir du JSON Tiled
    const map = this.make.tilemap({ key: 'hub_map' });

    // ! Le 1er nom est celui du tileset DANS Tiled, le 2e est la clé de l'image chargée ci-dessus
    const tileset = map.addTilesetImage('tileset_garden', 'tileset_garden');

    // * Les calques sont créés du dessous vers le dessus, dans le même ordre que dans Tiled
    map.createLayer('background', tileset);
    map.createLayer('ground', tileset);
    map.createLayer('decor_below', tileset);
    const walls = map.createLayer('walls', tileset);

    // * Toute tuile posée dans le calque « walls » devient un obstacle (-1 = case vide)
    walls.setCollisionByExclusion([-1]);

    // * Le point de départ du joueur est un objet « spawn » placé dans Tiled
    const spawn = map.findObject('objects', (object) => object.name === 'spawn');

    // * Le joueur est un sprite « physique » : c'est ce qui permet de le faire entrer en collision
    // Il commence de face (vers le bas), sur le point de départ
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player_1', FRAMES.DOWN);
    this.player.setCollideWorldBounds(true);

    // * La boîte de collision est plus petite que l'image et placée au niveau des pieds :
    // le joueur peut passer « devant » un mur sans que sa tête ne le bloque
    // ? Taille et décalage à ajuster à l'oeil (activer debug dans config.js)
    this.player.body.setSize(20, 16);
    this.player.body.setOffset(6, 16);

    // * On dit à Phaser : le joueur ne traverse pas les murs
    this.physics.add.collider(this.player, walls);

    // * decor_above passe devant le joueur : on le crée après lui avec une profondeur plus grande
    map.createLayer('decor_above', tileset).setDepth(10);

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
  update() {
    // Direction : -1, 0 ou 1 sur chaque axe
    let x = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    let y = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);

    // * En diagonale, on divise par racine de 2, sinon on irait plus vite qu'en ligne droite
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }

    // * On change l'image selon la direction. À l'arrêt, on garde la dernière image.
    // En diagonale, la direction horizontale est prioritaire.
    if (x > 0) this.player.setFrame(FRAMES.RIGHT);
    else if (x < 0) this.player.setFrame(FRAMES.LEFT);
    else if (y < 0) this.player.setFrame(FRAMES.UP);
    else if (y > 0) this.player.setFrame(FRAMES.DOWN);

    // * On donne une vitesse (en pixels par seconde) : c'est la physique Phaser qui déplace
    // le joueur et qui l'arrête contre les murs
    this.player.setVelocity(x * PLAYER_SPEED, y * PLAYER_SPEED);
  }
}
