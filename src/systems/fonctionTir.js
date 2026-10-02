// =====================================================================================
// * FONCTION TIR : CRÉER UNE BALLE, L'ANIMER ET LA FAIRE DISPARAÎTRE
// =====================================================================================
//
// * POURQUOI CE FICHIER EXISTE
// Quand le joueur tire, une balle apparaît à côté de lui et part tout droit dans la direction où il regarde.
// Ce fichier ne contient QUE la vie d'une balle : naître, voler, exploser. Il ne lit aucune touche
// (c'est le travail d'InputManager) et ne crée aucun groupe : la scène lui donne le groupe de balles à remplir.
//
// * LA VIE D'UNE BALLE
//   shoot()           elle apparaît devant le joueur et vole (animation en boucle)
//   explodeBullet()   elle s'arrête, joue son explosion, puis disparaît pour de bon
//   Elle explose toute seule après BULLET.LIFETIME_MS : même sortie de l'écran, une balle ne reste jamais indéfiniment.
//   Plus tard, un mur ou une cible appelleront explodeBullet() quand la balle les touche.
//
// * COMMENT L'UTILISER
//   import { createBulletAnimations, shoot, explodeBullet } from '../systems/fonctionTir.js';
//
//   // Dans la scène, UNE SEULE FOIS (create) : les animations et le groupe qui contient toutes les balles
//   createBulletAnimations(this);
//   this.bullets = this.physics.add.group();
//
//   // Quand le joueur tire (update), avec la direction : 'up', 'down', 'left' ou 'right'
//   shoot(this, this.bullets, this.player, 'right');
//
// ! La texture « bullet » doit être chargée comme un SPRITESHEET (images de BULLET.FRAME_SIZE), pas comme une image seule.
// TODO(équipe): charger la texture, brancher la touche de tir, et les collisions avec les murs et les cibles
// =====================================================================================

import { BULLET, DIRECTION_VECTORS } from '../utils/constants.js';

/**
 * Crée les deux animations de la balle (vol et explosion). Sans effet si elles existent déjà :
 * les animations sont communes à tout le jeu, on peut donc l'appeler à chaque création de scène.
 * @param {Phaser.Scene} scene
 */
export function createBulletAnimations(scene) {
  const { FLY_ANIM, HIT_ANIM } = BULLET;

  if (!scene.anims.exists(FLY_ANIM.KEY)) {
    scene.anims.create({
      key: FLY_ANIM.KEY,
      frames: scene.anims.generateFrameNumbers(BULLET.KEY, { start: FLY_ANIM.FIRST_FRAME, end: FLY_ANIM.LAST_FRAME }),
      frameRate: FLY_ANIM.FRAME_RATE,
      repeat: -1, // en boucle tant que la balle vole
    });
  }

  if (!scene.anims.exists(HIT_ANIM.KEY)) {
    scene.anims.create({
      key: HIT_ANIM.KEY,
      frames: scene.anims.generateFrameNumbers(BULLET.KEY, { start: HIT_ANIM.FIRST_FRAME, end: HIT_ANIM.LAST_FRAME }),
      frameRate: HIT_ANIM.FRAME_RATE,
      repeat: 0, // une seule fois
    });
  }
}

/**
 * Crée une balle à côté du joueur et l'envoie dans une direction.
 * @param {Phaser.Scene} scene  La scène (elle sert à programmer l'explosion automatique)
 * @param {Phaser.Physics.Arcade.Group} bullets  Le groupe qui contient les balles (créé une fois par la scène)
 * @param {Phaser.GameObjects.Sprite} player  Le joueur (la balle apparaît à côté de lui)
 * @param {string} direction  'up', 'down', 'left' ou 'right'
 * @returns {Phaser.Physics.Arcade.Sprite|null} la balle créée, ou null si la direction est inconnue
 */
export function shoot(scene, bullets, player, direction) {
  const vector = DIRECTION_VECTORS[direction];
  if (!vector) return null;

  // * La balle apparaît devant le joueur, pas sur lui : sinon elle le toucherait dès sa naissance
  const bullet = bullets.create(
    player.x + vector.x * BULLET.START_OFFSET,
    player.y + vector.y * BULLET.START_OFFSET,
    BULLET.KEY,
    BULLET.FLY_ANIM.FIRST_FRAME,
  );

  // * L'image est dessinée vers la droite : on la tourne pour qu'elle regarde dans la direction du tir
  bullet.setRotation(vector.angle);
  bullet.setVelocity(vector.x * BULLET.SPEED, vector.y * BULLET.SPEED);
  bullet.play(BULLET.FLY_ANIM.KEY);

  // * Fin de vie automatique. explodeBullet ne fait rien si la balle a déjà explosé (contre un mur, par exemple).
  scene.time.delayedCall(BULLET.LIFETIME_MS, () => explodeBullet(bullet));

  return bullet;
}

/**
 * Fait exploser une balle : elle s'arrête, joue son explosion, puis est détruite.
 * Sans effet si elle a déjà explosé ou a déjà été détruite. À appeler quand elle touche quelque chose.
 * @param {Phaser.Physics.Arcade.Sprite} bullet
 */
export function explodeBullet(bullet) {
  // active = faux une fois détruite ; exploding = déjà en train d'exploser
  if (!bullet.active || bullet.exploding) return;
  bullet.exploding = true;

  // * Elle s'arrête et ne touche plus rien pendant son explosion : le corps est désactivé, l'image reste
  bullet.setVelocity(0, 0);
  bullet.body.enable = false;

  bullet.play(BULLET.HIT_ANIM.KEY);
  bullet.once('animationcomplete', () => bullet.destroy());
}
