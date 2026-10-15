import { P2_SPRITE, P2_SPAWN_DISTANCE, P2_SPEED, PLAYER } from '../utils/constants.js';
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

// * Le premier endroit libre (sans mur sous sa boîte de collision) autour du joueur 1
function findStartNear(player, walls) {
  const d = P2_SPAWN_DISTANCE;
  const isFree = ({ x, y }) =>
    [-PLAYER.HITBOX.WIDTH / 2, PLAYER.HITBOX.WIDTH / 2].every((dx) => !walls.hasTileAtWorldXY(x + dx, y + PLAYER.HITBOX.HEIGHT / 2));
  const candidates = [[d, 0], [-d, 0], [0, d], [0, -d]].map(([dx, dy]) => ({ x: player.x + dx, y: player.y + dy }));
  return candidates.find(isFree) || { x: player.x, y: player.y };
}

export function createSecondPlayer(scene, player, walls) {
  const start = findStartNear(player, walls);
  const p2 = scene.physics.add.sprite(start.x, start.y, P2_SPRITE.key, FRAME_BAS);
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
