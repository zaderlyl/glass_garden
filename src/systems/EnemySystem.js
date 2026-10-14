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
//   this.enemies = createEnemies(this, map);                 // dans create()
//   updateEnemies(this, this.enemies, this.player, frozen);  // à chaque image dans update() (frozen : tout s'arrête)
//
// * LE COMPORTEMENT (une petite machine à états, voir ENEMY_AI dans constants.js)
//   idle    au repos : il flâne près de son point de départ.
//   chase   il VOIT le joueur (assez près ET aucun mur entre eux) : il fonce dessus.
//   search  il l'a perdu (trop loin, ou caché derrière un mur) : il va où il l'a vu en dernier et y attend un instant.
//   return  il rentre à son point de départ, puis redevient « idle ».
//   S'il revoit le joueur à n'importe quel moment, il repart en chase.
// =====================================================================================

import { ENEMIES, ENEMY_FRAME_SIZE, ENEMY_AI, FONT_FAMILY, DEPTH } from '../utils/constants.js';

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

// ---------------------------------------------------------------------------------------------------------------
// LE COMPORTEMENT
// ---------------------------------------------------------------------------------------------------------------

/** Vrai si aucun mur n'est sur le segment de (x1, y1) à (x2, y2) : c'est la « ligne de vue ». */
function hasLineOfSight(scene, x1, y1, x2, y2) {
  const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);
  for (let d = ENEMY_AI.LINE_OF_SIGHT_STEP; d < distance; d += ENEMY_AI.LINE_OF_SIGHT_STEP) {
    const t = d / distance;
    if (scene.walls.hasTileAtWorldXY(Phaser.Math.Linear(x1, x2, t), Phaser.Math.Linear(y1, y2, t))) return false;
  }
  return true;
}

/** L'ennemi voit-il le joueur à moins de `range` pixels ? */
function sees(scene, enemy, player, range) {
  const from = enemy.body.center;
  const to = player.body.center;
  return Phaser.Math.Distance.Between(from.x, from.y, to.x, to.y) < range && hasLineOfSight(scene, from.x, from.y, to.x, to.y);
}

/** Le petit « ! » qui monte au-dessus de l'ennemi quand il repère le joueur. */
function showAlert(scene, enemy) {
  const { TEXT, COLOR, SIZE, RISE, DURATION_MS } = ENEMY_AI.ALERT;
  const mark = scene.add
    .text(enemy.x, enemy.y - ENEMY_FRAME_SIZE - 4, TEXT, { fontFamily: FONT_FAMILY, fontSize: SIZE, fontStyle: 'bold', color: COLOR })
    .setOrigin(0.5, 1)
    .setDepth(DEPTH.UI);
  scene.tweens.add({ targets: mark, y: mark.y - RISE, alpha: 0, duration: DURATION_MS, onComplete: () => mark.destroy() });
}

/** Avance l'ennemi vers (x, y) à la vitesse donnée. Renvoie vrai s'il est arrivé. */
function moveToward(enemy, x, y, speed) {
  const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, x, y);
  if (distance <= ENEMY_AI.ARRIVE_DISTANCE) {
    enemy.setVelocity(0, 0);
    return true;
  }
  enemy.setVelocity(((x - enemy.x) / distance) * speed, ((y - enemy.y) / distance) * speed);
  return false;
}

/** L'image du faucheur selon la direction où il va (la capuche, elle, joue son animation). */
function faceDirection(enemy) {
  const config = ENEMIES[enemy.enemyType];
  if (!config.frames || (enemy.body.velocity.x === 0 && enemy.body.velocity.y === 0)) return;
  const { x, y } = enemy.body.velocity;
  const direction = Math.abs(x) >= Math.abs(y) ? (x < 0 ? 'left' : 'right') : y < 0 ? 'up' : 'down';
  enemy.setFrame(config.frames[direction]);
}

function setState(enemy, state, now) {
  enemy.state = state;
  enemy.stateSince = now;
}

/**
 * À appeler à chaque image : fait vivre tous les ennemis.
 * @param {Phaser.Scene} scene  La scène du monde (elle doit avoir un calque `walls`)
 * @param {Phaser.Physics.Arcade.Sprite[]} enemies
 * @param {Phaser.Physics.Arcade.Sprite} player
 * @param {boolean} frozen  Vrai pendant un dialogue ou une transition : les ennemis s'arrêtent
 */
export function updateEnemies(scene, enemies, player, frozen) {
  const now = scene.time.now;

  enemies.forEach((enemy) => {
    if (frozen) {
      enemy.setVelocity(0, 0);
      return;
    }
    if (!enemy.state) setState(enemy, 'idle', now);

    const config = ENEMIES[enemy.enemyType];
    const canSee = sees(scene, enemy, player, enemy.state === 'chase' ? config.sight * ENEMY_AI.LOSE_SIGHT_FACTOR : config.sight);

    // * Il voit le joueur : il fonce dessus (et il se retient où il l'a vu, au cas où il le perde)
    if (canSee) {
      if (enemy.state !== 'chase') showAlert(scene, enemy);
      setState(enemy, 'chase', now);
      enemy.lastSeen = { x: player.x, y: player.y + player.height / 2 }; // les pieds du joueur
      enemy.setVelocity(0, 0);
      moveToward(enemy, enemy.lastSeen.x, enemy.lastSeen.y, config.speed);
    } else if (enemy.state === 'chase') {
      setState(enemy, 'search', now); // il vient de le perdre
    } else if (enemy.state === 'search') {
      const waited = now - enemy.stateSince;
      const arrived = moveToward(enemy, enemy.lastSeen.x, enemy.lastSeen.y, config.speed);
      if (arrived && !enemy.arrivedAt) enemy.arrivedAt = now;
      if ((enemy.arrivedAt && now - enemy.arrivedAt >= ENEMY_AI.SEARCH.WAIT_MS) || waited >= ENEMY_AI.SEARCH.MAX_MS) {
        enemy.arrivedAt = null;
        setState(enemy, 'return', now);
      }
    } else if (enemy.state === 'return') {
      if (moveToward(enemy, enemy.home.x, enemy.home.y, config.speed * ENEMY_AI.RETURN_SPEED_FACTOR)) setState(enemy, 'idle', now);
    } else {
      wander(enemy, config, now); // au repos
    }

    faceDirection(enemy);
  });
}

/** Au repos : il flâne autour de son point, avec des pauses. */
function wander(enemy, config, now) {
  const { RADIUS, SPEED_FACTOR, PAUSE_MS } = ENEMY_AI.WANDER;
  if (!enemy.wanderTarget) {
    enemy.setVelocity(0, 0);
    if (!enemy.nextWanderAt) enemy.nextWanderAt = now + Phaser.Math.Between(PAUSE_MS.MIN, PAUSE_MS.MAX);
    if (now >= enemy.nextWanderAt) {
      const angle = Math.random() * Math.PI * 2;
      const length = Math.random() * RADIUS;
      enemy.wanderTarget = { x: enemy.home.x + Math.cos(angle) * length, y: enemy.home.y + Math.sin(angle) * length };
      enemy.nextWanderAt = null;
    }
    return;
  }
  if (moveToward(enemy, enemy.wanderTarget.x, enemy.wanderTarget.y, config.speed * SPEED_FACTOR)) enemy.wanderTarget = null;
}
