import InputManager from '../systems/InputManager.js';

// Vitesse du joueur, en pixels par seconde
// TODO(équipe): la déplacer dans constants.js quand ce fichier existera
const PLAYER_SPEED = 300;

// Numéro de l'image du spritesheet pour chaque direction
const FRAMES = { UP: 0, RIGHT: 1, LEFT: 2, DOWN: 3 };

// Distance (en pixels) à laquelle le joueur peut interagir avec un miroir
const INTERACT_DISTANCE = 64; // * Détéction en unité pixels

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

    // * Les miroirs sont les objets de classe « mirror » placés dans Tiled.
    // Leur nom donne le monde qu'ils ouvrent (ex. « world_1 »).
    // ? Ancien Tiled : la classe s'appelle « type ». On lit les deux.
    this.mirrors = [];
    map
      .getObjectLayer('objects')
      .objects.filter((object) => (object.class || object.type) === 'mirror')
      .forEach((object) => {
        // ! Placeholder : un rectangle bleu clair, à remplacer par le vrai sprite du miroir
        // Un rectangle est centré sur son point de placement, d'où le « + width / 2 »
        const mirror = this.add.rectangle(
          object.x + object.width / 2,
          object.y + object.height / 2,
          object.width,
          object.height,
          0xbfe9ff,
        );
        mirror.setStrokeStyle(2, 0xffffff);
        mirror.world = object.name; // le monde de destination

        // * Un corps « statique » ne bouge jamais : le miroir bloque le joueur comme un mur
        this.physics.add.existing(mirror, true);
        this.physics.add.collider(this.player, mirror);

        this.mirrors.push(mirror);
      });

    // * Texte d'aide, affiché en haut de l'écran quand on est près d'un miroir
    this.hint = this.add
      .text(this.scale.width / 2, 40, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#f4f1e8',
      })
      .setOrigin(0.5)
      .setDepth(20);

    // * decor_above passe devant le joueur : on le crée après lui avec une profondeur plus grande
    map.createLayer('decor_above', tileset).setDepth(10);

    // * Les touches passent par l'InputManager : la scène ne connaît aucune touche
    this.input1 = new InputManager(this, 1);
  }

  // update() est appelée à chaque image (environ 60 fois par seconde)
  update() {
    // * Direction souhaitée, déjà normalisée en diagonale par l'InputManager
    const { x, y } = this.input1.getMove();

    // * On change l'image selon la direction. À l'arrêt, on garde la dernière image.
    // En diagonale, la direction horizontale est prioritaire.
    if (x > 0) this.player.setFrame(FRAMES.RIGHT);
    else if (x < 0) this.player.setFrame(FRAMES.LEFT);
    else if (y < 0) this.player.setFrame(FRAMES.UP);
    else if (y > 0) this.player.setFrame(FRAMES.DOWN);

    // * On donne une vitesse (en pixels par seconde) : c'est la physique Phaser qui déplace
    // le joueur et qui l'arrête contre les murs
    this.player.setVelocity(x * PLAYER_SPEED, y * PLAYER_SPEED);

    // * Y a-t-il un miroir assez proche pour interagir ?
    const nearMirror = this.mirrors.find(
      (mirror) =>
        Phaser.Math.Distance.Between(this.player.x, this.player.y, mirror.x, mirror.y) <
        INTERACT_DISTANCE,
    );

    // On ne réécrit pas le texte pendant l'affichage du message d'interaction
    // ? La touche affichée (E) est provisoire : à changer avec les boutons de la borne
    // TODO(équipe): message d'intéraction a changer ( utilisation d'un UI touche au dessus des miroirs )
    if (!this.messageActive) {
      this.hint.setText(nearMirror ? 'E : entrer dans le miroir' : '');
    }

    if (nearMirror && this.input1.justPressed('interact')) {
      // TODO(équipe): téléporter le joueur vers la scène du monde (nearMirror.world)
      this.hint.setText(`Ce miroir mène vers : ${nearMirror.world}`);
      this.messageActive = true;
      this.time.delayedCall(2000, () => {
        this.messageActive = false;
      });
    }
  }
}
