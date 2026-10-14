// =====================================================================================
// * BUBBLE SYSTEM : LES BULLES À ÉCLATER
// =====================================================================================
//
// Les bulles se posent dans Tiled : des objets « point » de classe « bubble » dans le calque « objects ». Le point est
// le centre de la bulle. Changer une bulle de place, ou en ajouter, se fait dans Tiled, sans toucher au code.
// Une carte sans objet « bubble » n'en a pas.
// Selon la version de Tiled, la classe s'appelle « class » ou « type » : on lit les deux.
//
// Une bulle flotte doucement. Quand le joueur la touche, elle éclate (animation) puis disparaît.
//
// * COMMENT L'UTILISER
//   preloadBubbles(this);                                          // dans preload()
//   this.bubbles = createBubbles(this, map, this.player, () => ...); // dans create(), une fois le joueur créé
//   // le dernier argument est appelé quand TOUTES les bulles sont éclatées
// =====================================================================================

import { BUBBLES } from '../utils/constants.js';

// Les cartes dont toutes les bulles ont été éclatées, retenues pour toute la partie (une scène est recréée à chaque visite)
const completedMaps = new Set();

/** Toutes les bulles de cette carte ont-elles déjà été éclatées ? */
export const isBubblesComplete = (mapKey) => completedMaps.has(mapKey);

/** Charge l'image des bulles (à appeler dans preload). */
export function preloadBubbles(scene) {
  scene.load.spritesheet(BUBBLES.KEY, BUBBLES.IMAGE, { frameWidth: BUBBLES.FRAME_SIZE, frameHeight: BUBBLES.FRAME_SIZE });
}

/**
 * Crée une bulle à la position de chaque objet « bubble » de la carte.
 * @param {Function} onAllBurst  Appelée quand la dernière bulle a éclaté (jamais appelée s'il n'y a aucune bulle)
 * Si toutes les bulles de la carte ont déjà été éclatées lors d'une visite précédente, il n'y en a plus.
 * @returns {{ total: number, burst: number, done: boolean }} le nombre de bulles, le nombre déjà éclatées, et si c'est fini
 */
export function createBubbles(scene, map, player, onAllBurst) {
  // * L'animation d'éclatement est globale à tout le jeu : on ne la crée qu'une fois
  if (!scene.anims.exists(BUBBLES.BURST.KEY)) {
    scene.anims.create({
      key: BUBBLES.BURST.KEY,
      frames: scene.anims.generateFrameNumbers(BUBBLES.KEY, { start: BUBBLES.BURST.FIRST_FRAME, end: BUBBLES.BURST.LAST_FRAME }),
      frameRate: BUBBLES.BURST.FRAME_RATE,
      repeat: 0,
    });
  }

  const objects = map.getObjectLayer('objects').objects.filter((object) => (object.class || object.type) === 'bubble');
  if (objects.length > 0 && isBubblesComplete(scene.mapKey)) return { total: 0, burst: 0, done: true };
  const state = { total: objects.length, burst: 0, done: false };

  objects.forEach((object) => {
    const bubble = scene.physics.add.sprite(object.x, object.y, BUBBLES.KEY, 0).setDepth(BUBBLES.DEPTH);
    bubble.body.setCircle(BUBBLES.HITBOX_RADIUS, BUBBLES.FRAME_SIZE / 2 - BUBBLES.HITBOX_RADIUS, BUBBLES.FRAME_SIZE / 2 - BUBBLES.HITBOX_RADIUS);

    // * Elle flotte : un va-et-vient vertical, décalé d'une bulle à l'autre pour qu'elles ne bougent pas toutes ensemble
    scene.tweens.add({
      targets: bubble,
      y: object.y - BUBBLES.FLOAT.AMPLITUDE,
      duration: BUBBLES.FLOAT.DURATION_MS,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: Math.random() * BUBBLES.FLOAT.DURATION_MS,
    });

    scene.physics.add.overlap(player, bubble, () => {
      if (bubble.burst) return;
      bubble.burst = true;
      bubble.body.enable = false; // elle ne peut plus être touchée
      scene.tweens.killTweensOf(bubble);
      bubble.play(BUBBLES.BURST.KEY);
      bubble.once('animationcomplete', () => bubble.destroy());

      state.burst += 1;
      if (state.burst === state.total) {
        completedMaps.add(scene.mapKey);
        onAllBurst?.();
      }
    });
  });

  return state;
}
