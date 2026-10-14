// =====================================================================================
// * TRANSITION SYSTEM : LE PASSAGE ENTRE DEUX MONDES
// =====================================================================================
//
// Un « iris » : un rectangle noir plein écran, percé d'un trou rond qui rétrécit jusqu'à zéro.
// Le trou est un cercle dessiné dans un Graphics invisible, utilisé comme masque INVERSÉ (le noir n'est
// visible qu'en dehors du cercle).
//
// ! Les masques ne marchent qu'avec WebGL (Phaser.AUTO le choisit quand c'est possible).
//
// * COMMENT L'UTILISER
//   import { irisClose } from '../systems/TransitionSystem.js';
//   irisClose(this, mirror.x, mirror.y, () => this.scene.start(...));
// =====================================================================================

import { GAME_WIDTH, GAME_HEIGHT, DEPTH, TRANSITION } from '../utils/constants.js';

/**
 * Referme un cercle noir sur le point (x, y), puis appelle onComplete quand l'écran est noir.
 */
export function irisClose(scene, x, y, onComplete) {
  const cover = scene.add
    .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, TRANSITION.COLOR)
    .setOrigin(0, 0)
    .setDepth(DEPTH.TRANSITION);

  const hole = scene.make.graphics({ add: false });
  const mask = hole.createGeometryMask();
  mask.setInvertAlpha(true);
  cover.setMask(mask);

  // Le cercle de départ couvre tout l'écran : son rayon va jusqu'au coin le plus éloigné
  const circle = { radius: Math.hypot(Math.max(x, GAME_WIDTH - x), Math.max(y, GAME_HEIGHT - y)) };

  const drawHole = () => hole.clear().fillStyle(0xffffff).fillCircle(x, y, circle.radius);
  drawHole(); // dès la première image, sinon l'écran serait tout noir un instant

  scene.tweens.add({
    targets: circle,
    radius: 0,
    duration: TRANSITION.IRIS_CLOSE_MS,
    ease: TRANSITION.IRIS_EASE,
    onUpdate: drawHole,
    onComplete,
  });
}
