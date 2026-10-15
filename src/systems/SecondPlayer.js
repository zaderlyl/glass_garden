import { P2_SPRITE, P2_START, P2_SPEED, PLAYER } from '../utils/constants.js';
import { createP2Keys } from './InputManager.js';

const FRAME_HAUT   = 0; // dos
const FRAME_DROITE = 1;
const FRAME_GAUCHE = 2;
const FRAME_BAS    = 3; // face

export function loadSecondPlayer(scene) {
  scene.load.spritesheet(P2_SPRITE.key, P2_SPRITE.path, {
    frameWidth: P2_SPRITE.frameWidth,
    frameHeight: P2_SPRITE.frameHeight
  });
}

export function createSecondPlayer(scene) {
  const p2 = scene.physics.add.sprite(P2_START.x, P2_START.y, P2_SPRITE.key, FRAME_BAS);
  p2.setCollideWorldBounds(true);
  // * Petite boîte de collision aux pieds, comme le joueur 1 (sinon il se coince dans les décors)
  p2.body.setSize(PLAYER.HITBOX.WIDTH, PLAYER.HITBOX.HEIGHT);
  p2.body.setOffset(PLAYER.HITBOX.OFFSET_X, PLAYER.HITBOX.OFFSET_Y);
  p2.keys = createP2Keys(scene);
  return p2;
}

export function updateSecondPlayer(p2) {
  const k = p2.keys;

  p2.setVelocity(0);

  if (k.left.isDown) {
    p2.setVelocityX(-P2_SPEED);
    p2.setFrame(FRAME_GAUCHE);
  } else if (k.right.isDown) {
    p2.setVelocityX(P2_SPEED);
    p2.setFrame(FRAME_DROITE);
  }

  if (k.up.isDown) {
    p2.setVelocityY(-P2_SPEED);
    p2.setFrame(FRAME_HAUT);
  } else if (k.down.isDown) {
    p2.setVelocityY(P2_SPEED);
    p2.setFrame(FRAME_BAS);
  }
}
