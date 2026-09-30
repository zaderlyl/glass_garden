import InputManager from '../systems/InputManager.js';
import {
  ASSETS,
  PLAYER,
  INTERACT_DISTANCE,
  MESSAGE_DURATION_MS,
  DEPTH,
  COLORS,
  FONT_FAMILY,
  FONT_SIZE,
} from '../utils/constants.js';

/**
 * * Scène de base de tous les mondes (jardin compris) : elle charge une carte Tiled,
 * y place le joueur au point de départ, gère les collisions et les miroirs.
 * Chaque monde en hérite et lui indique sa carte ; il n'ajoute que sa mécanique propre.
 */
export default class WorldScene extends Phaser.Scene {
  /**
   * @param {string} sceneKey  Nom de la scène (voir SCENES dans constants.js)
   * @param {string} mapKey    Clé sous laquelle la carte est enregistrée dans Phaser
   * @param {string} mapPath   Chemin du fichier JSON de la carte, exporté de Tiled
   */
  constructor(sceneKey, mapKey, mapPath) {
    super(sceneKey);
    this.mapKey = mapKey;
    this.mapPath = mapPath;
  }

  // preload() charge les images avant que create() ne démarre
  preload() {
    // * Le spritesheet est découpé en images de 32 x 32 pixels (4 images côte à côte)
    this.load.spritesheet(ASSETS.PLAYER_1, 'assets/images/sprites/player_1_spritesheet.png', {
      frameWidth: PLAYER.FRAME_SIZE,
      frameHeight: PLAYER.FRAME_SIZE,
    });

    // * La carte (JSON exporté de Tiled) et l'image de son tileset
    this.load.tilemapTiledJSON(this.mapKey, this.mapPath);
    this.load.image(ASSETS.TILESET_GARDEN, 'assets/images/tilesets/tileset_garden.png');
  }

  create() {
    // * On construit la carte à partir du JSON Tiled
    const map = this.make.tilemap({ key: this.mapKey });

    // ! Le 1er nom est celui du tileset DANS Tiled, le 2e est la clé de l'image chargée ci-dessus
    const tileset = map.addTilesetImage('tileset_garden', ASSETS.TILESET_GARDEN);

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
    this.player = this.physics.add.sprite(spawn.x, spawn.y, ASSETS.PLAYER_1, PLAYER.FRAMES.DOWN);
    this.player.setCollideWorldBounds(true);

    // * La boîte de collision est plus petite que l'image et placée au niveau des pieds :
    // le joueur peut passer « devant » un mur sans que sa tête ne le bloque
    this.player.body.setSize(PLAYER.HITBOX.WIDTH, PLAYER.HITBOX.HEIGHT);
    this.player.body.setOffset(PLAYER.HITBOX.OFFSET_X, PLAYER.HITBOX.OFFSET_Y);

    // * On dit à Phaser : le joueur ne traverse pas les murs
    this.physics.add.collider(this.player, walls);

    // * Les miroirs sont les objets de classe « mirror » placés dans Tiled.
    // Leur nom donne le monde qu'ils ouvrent (ex. « world_1 »).
    // * Selon la version de Tiled, la classe s'appelle « class » ou « type » : on lit les deux.
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
          COLORS.MIRROR,
        );
        mirror.setStrokeStyle(2, COLORS.MIRROR_BORDER);
        mirror.world = object.name; // le monde de destination

        // * Un corps « statique » ne bouge jamais : le miroir bloque le joueur comme un mur
        this.physics.add.existing(mirror, true);
        this.physics.add.collider(this.player, mirror);

        this.mirrors.push(mirror);
      });

    // * Texte d'aide, affiché en haut de l'écran quand on est près d'un miroir
    this.hint = this.add
      .text(this.scale.width / 2, 40, '', {
        fontFamily: FONT_FAMILY,
        fontSize: FONT_SIZE.HINT,
        color: COLORS.TEXT,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.UI);

    // * decor_above passe devant le joueur : on le crée après lui avec une profondeur plus grande
    map.createLayer('decor_above', tileset).setDepth(DEPTH.ABOVE_PLAYER);

    // * Les touches passent par l'InputManager : la scène ne connaît aucune touche
    this.input1 = new InputManager(this, 1);
  }

  // update() est appelée à chaque image (environ 60 fois par seconde)
  update() {
    // * Direction souhaitée, déjà normalisée en diagonale par l'InputManager
    const { x, y } = this.input1.getMove();

    // * On change l'image selon la direction. À l'arrêt, on garde la dernière image.
    // En diagonale, la direction horizontale est prioritaire.
    if (x > 0) this.player.setFrame(PLAYER.FRAMES.RIGHT);
    else if (x < 0) this.player.setFrame(PLAYER.FRAMES.LEFT);
    else if (y < 0) this.player.setFrame(PLAYER.FRAMES.UP);
    else if (y > 0) this.player.setFrame(PLAYER.FRAMES.DOWN);

    // * On donne une vitesse (en pixels par seconde) : c'est la physique Phaser qui déplace
    // le joueur et qui l'arrête contre les murs
    this.player.setVelocity(x * PLAYER.SPEED, y * PLAYER.SPEED);

    // * Y a-t-il un miroir assez proche pour interagir ?
    const nearMirror = this.mirrors.find(
      (mirror) =>
        Phaser.Math.Distance.Between(this.player.x, this.player.y, mirror.x, mirror.y) <
        INTERACT_DISTANCE,
    );

    // On ne réécrit pas le texte pendant l'affichage du message d'interaction
    // ? La touche affichée (E) est provisoire : à changer avec les boutons de la borne
    // TODO(équipe): changer le message d'interaction (utiliser une icône de touche au-dessus des miroirs)
    if (!this.messageActive) {
      this.hint.setText(nearMirror ? 'E : entrer dans le miroir' : '');
    }

    if (nearMirror && this.input1.justPressed('interact')) {
      // TODO(équipe): téléporter le joueur vers la scène du monde (nearMirror.world)
      this.hint.setText(`Ce miroir mène vers : ${nearMirror.world}`);
      this.messageActive = true;
      this.time.delayedCall(MESSAGE_DURATION_MS, () => {
        this.messageActive = false;
      });
    }
  }
}
