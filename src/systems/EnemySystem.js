// =====================================================================================
// * ENEMY SYSTEM : LES ENNEMIS
// =====================================================================================
//
// Un ennemi se pose dans Tiled : un objet « point » de classe « enemy » dans le calque « objects ». Son NOM donne le type
// (une clé de ENEMIES dans constants.js : « faucheur » ou « capuche »). Le point marque l'endroit où il a les pieds.
// Changer un ennemi de place, ou en ajouter, se fait donc dans Tiled, sans toucher au code. Une carte sans objet « enemy »
// n'en a pas. Selon la version de Tiled, la classe s'appelle « class » ou « type » : on lit les deux.
//
// * COMMENT L'UTILISER
//   preloadEnemies(this);                                    // dans preload()
//   this.enemies = createEnemies(this, map, this.player);    // dans create(), une fois le joueur créé
// =====================================================================================

import { ENEMIES, ENEMY_FRAME_SIZE } from '../utils/constants.js';

/** Charge les images de tous les ennemis (à appeler dans preload). */
export function preloadEnemies(scene) {
  Object.values(ENEMIES).forEach((enemy) =>
    scene.load.spritesheet(enemy.key, enemy.image, { frameWidth: ENEMY_FRAME_SIZE, frameHeight: ENEMY_FRAME_SIZE }),
  );
}

/**
 * Crée un ennemi à la position de chaque objet « enemy » de la carte.
 * @returns {Phaser.Physics.Arcade.Sprite[]} les ennemis créés, avec enemy.enemyType = le nom de l'objet Tiled
 */
export function createEnemies(scene, map) {
  // * L'animation de la capuche est globale à tout le jeu : on ne la crée qu'une fois
  const { idle } = ENEMIES.capuche;
  if (!scene.anims.exists(idle.KEY)) {
    scene.anims.create({
      key: idle.KEY,
      frames: scene.anims.generateFrameNumbers(ENEMIES.capuche.key, { start: 0, end: ENEMIES.capuche.frameCount - 1 }),
      frameRate: idle.FRAME_RATE,
      repeat: -1,
    });
  }

  return map
    .getObjectLayer('objects')
    .objects.filter((object) => (object.class || object.type) === 'enemy')
    .map((object) => {
      const config = ENEMIES[object.name];
      if (!config) {
        console.warn(`[EnemySystem] Ennemi inconnu : « ${object.name} » (voir ENEMIES dans constants.js).`);
        return null;
      }

      // * Les pieds sont au point de l'objet : le bas de l'image, centré
      const enemy = scene.physics.add.sprite(object.x, object.y, config.key, 0).setOrigin(0.5, 1);
      enemy.enemyType = object.name;
      enemy.home = { x: object.x, y: object.y }; // l'endroit où il est posé, pour y revenir plus tard

      // * La zone de collision est un petit rectangle aux pieds (et non toute l'image)
      const { WIDTH, HEIGHT } = config.hitbox;
      enemy.body.setSize(WIDTH, HEIGHT);
      enemy.body.setOffset((ENEMY_FRAME_SIZE - WIDTH) / 2, ENEMY_FRAME_SIZE - HEIGHT);

      if (config.idle) enemy.play(config.idle.KEY);
      return enemy;
    })
    .filter(Boolean);
}
