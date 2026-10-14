// =====================================================================================
// * DASH SYSTEM : UNE COURTE ACCÉLÉRATION DU JOUEUR
// =====================================================================================
//
// Une pression sur la touche de dash lance le joueur dans la direction où il se déplace (sinon dans celle qu'il
// regarde), à DASH.SPEED_MULTIPLIER fois sa vitesse, pendant DASH.DURATION_MS. Il laisse derrière lui des images
// fantômes qui s'estompent. Ensuite, une pause (DASH.COOLDOWN_MS) avant de pouvoir recommencer.
// Les murs, l'eau et les miroirs bloquent toujours le joueur : c'est la physique qui le déplace, on ne change que sa vitesse.
//
// * COMMENT L'UTILISER
//   this.dash = new Dash(this, this.player);                  // dans create(), une fois le joueur créé
//   if (this.dash.update(this.input1, move, this.facing)) ... // dans update() : vrai si le joueur est en plein dash
//                                                             // (le dash impose alors la vitesse du joueur)
// =====================================================================================

import { PLAYER, DASH } from '../utils/constants.js';

// Les directions regardées, en vecteurs (pour dasher à l'arrêt)
const FACING_VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

export default class Dash {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.endsAt = 0; // l'instant où le dash en cours se termine
    this.readyAt = 0; // l'instant à partir duquel on peut dasher de nouveau
    this.nextGhostAt = 0;
    this.direction = [0, 0];
  }

  /**
   * À appeler à chaque image.
   * @param {InputManager} input
   * @param {{x: number, y: number}} move  La direction du déplacement (-1 à 1), nulle à l'arrêt
   * @param {string} facing  La direction regardée ('up', 'down', 'left', 'right')
   * @returns {boolean} vrai si le joueur est en plein dash
   */
  update(input, move, facing) {
    const now = this.scene.time.now;

    if (now >= this.endsAt && now >= this.readyAt && input.justPressed('dash')) {
      // * Direction du dash : celle du déplacement, sinon celle qu'on regarde
      this.direction = move.x !== 0 || move.y !== 0 ? [move.x, move.y] : FACING_VECTORS[facing];
      this.endsAt = now + DASH.DURATION_MS;
      this.readyAt = this.endsAt + DASH.COOLDOWN_MS;
      this.nextGhostAt = now;
    }

    if (now >= this.endsAt) return false;

    const speed = PLAYER.SPEED * DASH.SPEED_MULTIPLIER;
    this.player.setVelocity(this.direction[0] * speed, this.direction[1] * speed);
    if (now >= this.nextGhostAt) {
      this.leaveGhost();
      this.nextGhostAt = now + DASH.GHOST.INTERVAL_MS;
    }
    return true;
  }

  // Une copie du joueur, laissée sur place, qui s'estompe puis disparaît
  leaveGhost() {
    const { player } = this;
    const ghost = this.scene.add
      .image(player.x, player.y, player.texture.key, player.frame.name)
      .setDepth(player.depth - 1)
      .setAlpha(DASH.GHOST.ALPHA)
      .setTint(DASH.GHOST.TINT);
    this.scene.tweens.add({ targets: ghost, alpha: 0, duration: DASH.GHOST.FADE_MS, onComplete: () => ghost.destroy() });
  }
}
