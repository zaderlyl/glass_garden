// * Toutes les valeurs partagées du jeu sont ici : noms de scènes, clés d'assets, vitesses, tailles, couleurs.
// * Aucune valeur « magique » ailleurs dans le code (voir docs/conventions.md).

// Résolution imposée par la borne d'arcade (16:9)
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Noms des scènes
export const SCENES = {
  MENU: 'MenuScene',
  HUB: 'HubScene',
  WORLD_1: 'World1Scene',
  UI: 'UIScene',
};

// * Table des mondes : le nom d'un miroir dans Tiled -> la scène qu'il ouvre.
// Pour ajouter un monde : créer sa scène, puis ajouter une ligne ici.
export const WORLDS = {
  hub: SCENES.HUB,
  world_1: SCENES.WORLD_1,
};

// * Clés des assets : le nom sous lequel Phaser retrouve un fichier chargé
export const ASSETS = {
  PLAYER_1: 'player_1',
  HUB_MAP: 'hub_map',
  WORLD_1_MAP: 'world_1_map',
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

// * Où apparaît le joueur quand il arrive par un miroir : à droite du miroir, en pixels.
// X est mesuré depuis le bord droit du miroir, Y depuis son milieu.
// ? Valeurs à ajuster : 32 px = une tuile. À changer si un miroir est contre un mur à sa droite.
// ? Le placement des miroirs n'est pas encore officiel : les cartes actuelles sont des cartes de test.
export const MIRROR_SPAWN_OFFSET = { X: 32, Y: 0 };

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
  TIMER: '36px',
};

// * Modes de jeu : chacun a son propre meilleur temps
export const GAME_MODES = {
  SOLO: 'solo',
  MULTI: 'multi',
};

// * Noms sous lesquels les données sont rangées dans le navigateur (localStorage)
export const STORAGE_KEYS = {
  BEST_TIME_PREFIX: 'glass_garden_best_time_', // suivi du mode : « ..._solo », « ..._multi »
};

// Marge (en pixels) entre les éléments d'interface et le bord de l'écran
export const UI_MARGIN = 24;
