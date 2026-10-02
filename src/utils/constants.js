// * Toutes les valeurs partagées du jeu sont ici : noms de scènes, clés d'assets, vitesses, tailles, couleurs.
// * Aucune valeur « magique » ailleurs dans le code (voir docs/conventions.md).

// Résolution imposée par la borne d'arcade (16:9)
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Noms des scènes
export const SCENES = {
  MENU: 'MenuScene',
  HUB: 'HubScene',
};

// * Clés des assets : le nom sous lequel Phaser retrouve un fichier chargé
export const ASSETS = {
  PLAYER_1: 'player_1',
  HUB_MAP: 'hub_map',
  TILESET_GARDEN: 'tileset_garden',
};

// Joueur
export const PLAYER = {
  SPEED: 300, // pixels par seconde
  FRAME_SIZE: 32, // taille d'une image du spritesheet, en pixels
  // * Numéro de l'image du spritesheet pour chaque direction
  FRAMES: { UP: 0, RIGHT: 1, LEFT: 2, DOWN: 3 },
  // * Boîte de collision : plus petite que l'image, placée au niveau des pieds
  // ? À ajuster à l'oeil (activer debug dans config.js)
  HITBOX: { WIDTH: 20, HEIGHT: 16, OFFSET_X: 6, OFFSET_Y: 16 },
};

// Distance (en pixels) à laquelle le joueur peut interagir avec un miroir
export const INTERACT_DISTANCE = 64;

// Durée d'affichage d'un message d'interaction, en millisecondes
export const MESSAGE_DURATION_MS = 2000;

// * Ordre d'affichage : plus la valeur est grande, plus l'élément est devant
export const DEPTH = {
  ABOVE_PLAYER: 10, // calque decor_above
  UI: 20,
};

// Couleurs
export const COLORS = {
  BACKGROUND: '#2f6b3a',
  TEXT: '#f4f1e8',
  MIRROR: 0xbfe9ff,
  MIRROR_BORDER: 0xffffff,
};

// Textes
export const FONT_FAMILY = 'Georgia, serif';
export const FONT_SIZE = {
  TITLE: '96px',
  HINT: '28px',
};

// * Les quatre directions du jeu (vue du dessus) : le vecteur (x, y) de chacune et l'angle d'un sprite dessiné vers la DROITE
// qu'on veut orienter dans cette direction (en radians : un quart de tour = Math.PI / 2).
export const DIRECTION_VECTORS = {
  right: { x: 1, y: 0, angle: 0 },
  down: { x: 0, y: 1, angle: Math.PI / 2 },
  left: { x: -1, y: 0, angle: Math.PI },
  up: { x: 0, y: -1, angle: -Math.PI / 2 },
};

// * Les balles. balle.png est une bande de 33 images de 16 x 16 pixels (528 x 16), pas une image seule :
// images 0 à 5 = le projectile en vol (dessiné vers la droite), 6 à 15 = l'impact (explosion),
// 16 à 32 = un rayon qui grandit puis s'efface (inutilisé pour l'instant).
export const BULLET = {
  KEY: 'bullet',
  FRAME_SIZE: 16,
  FIRST_FRAME: 0, // l'image du projectile en vol
  SPEED: 600, // pixels par seconde
  START_OFFSET: 24, // distance entre le centre du joueur et l'endroit où la balle apparaît, en pixels
};
