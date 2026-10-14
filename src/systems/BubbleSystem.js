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

/** Charge l'image des bulles (à appeler dans preload). */
export function preloadBubbles(scene) {
  scene.load.spritesheet(BUBBLES.KEY, BUBBLES.IMAGE, { frameWidth: BUBBLES.FRAME_SIZE, frameHeight: BUBBLES.FRAME_SIZE });
}

/**
 * Crée une bulle à la position de chaque objet « bubble » de la carte.
 * @param {Function} onAllBurst  Appelée quand la dernière bulle a éclaté (jamais appelée s'il n'y a aucune bulle)
 * @returns {{ total: number, burst: number }} le nombre de bulles de la carte et le nombre déjà éclatées
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
  const state = { total: objects.length, burst: 0 };

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
      if (state.burst === state.total) onAllBurst?.();
    });
  });

  return state;
}
