// =====================================================================================
// * FONCTION TIR : CRÉER UNE BALLE
// =====================================================================================
//
// * POURQUOI CE FICHIER EXISTE
// Quand le joueur tire, une balle apparaît à côté de lui et part tout droit dans la direction où il regarde.
// Ce fichier ne contient QUE ça : créer une balle. Il ne lit aucune touche (c'est le travail d'InputManager)
// et ne crée aucun groupe : la scène lui donne le groupe de balles à remplir.
//
// * COMMENT L'UTILISER
//   import { shoot } from '../systems/fonctionTir.js';
//
//   // Dans la scène, UNE SEULE FOIS (create) : le groupe qui contient toutes les balles
//   this.bullets = this.physics.add.group();
//
//   // Quand le joueur tire (update), avec la direction : 'up', 'down', 'left' ou 'right'
//   shoot(this.bullets, this.player, 'right');
//
// TODO(équipe): détruire les balles qui sortent de l'écran ou touchent un mur, les animer, et brancher la touche de tir
// =====================================================================================

import { BULLET, DIRECTION_VECTORS } from '../utils/constants.js';

/**
 * Crée une balle à côté du joueur et l'envoie dans une direction.
 * @param {Phaser.Physics.Arcade.Group} bullets  Le groupe qui contient les balles (créé une fois par la scène)
 * @param {Phaser.GameObjects.Sprite} player  Le joueur (la balle apparaît à côté de lui)
 * @param {string} direction  'up', 'down', 'left' ou 'right'
 * @returns {Phaser.Physics.Arcade.Sprite|null} la balle créée, ou null si la direction est inconnue
 */
export function shoot(bullets, player, direction) {
  const vector = DIRECTION_VECTORS[direction];
  if (!vector) return null;

  // * La balle apparaît devant le joueur, pas sur lui : sinon elle le toucherait dès sa naissance
  const bullet = bullets.create(
    player.x + vector.x * BULLET.START_OFFSET,
    player.y + vector.y * BULLET.START_OFFSET,
    BULLET.KEY,
    BULLET.FIRST_FRAME,
  );

  // * L'image est dessinée vers la droite : on la tourne pour qu'elle regarde dans la direction du tir
  bullet.setRotation(vector.angle);
  bullet.setVelocity(vector.x * BULLET.SPEED, vector.y * BULLET.SPEED);

  return bullet;
}
