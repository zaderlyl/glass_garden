// =====================================================================================
// * MIRROR SYSTEM : LA MÉMOIRE DES MIROIRS UTILISÉS
// =====================================================================================
//
// * POURQUOI CE FICHIER EXISTE
// Quand le joueur revient dans le jardin, le miroir qu'il avait pris pour partir disparaît.
// Une scène est recréée à chaque visite : elle ne peut pas se souvenir de ça. Cette liste
// vit dans ce fichier, qui n'est chargé qu'une seule fois pour tout le jeu (comme TimerSystem).
//
// * LES MIROIRS SONT RETENUS PAR LEUR NOM
// Le nom d'un miroir dans Tiled est le monde qu'il ouvre (« world_1 »). On retient donc
// « le miroir du monde world_1 est utilisé ».
//
// * COMMENT L'UTILISER
//   import { isMirrorUsed, markMirrorUsed, shouldMirrorDisappear, getMirrorFacing } from '../systems/MirrorSystem.js';
// =====================================================================================

import { isWorldStarCollected } from './StarSystem.js';

const usedMirrors = [];

/** Ce miroir est-il déjà utilisé (donc disparu) ? */
export function isMirrorUsed(world) {
  return usedMirrors.includes(world);
}

/** Marque le miroir de ce monde comme utilisé. Sans effet s'il l'est déjà. */
export function markMirrorUsed(world) {
  if (!isMirrorUsed(world)) {
    usedMirrors.push(world);
  }
}

/** Remet tous les miroirs en place : à appeler au début d'une nouvelle partie. */
export function resetMirrors() {
  usedMirrors.length = 0;
}

/**
 * Le miroir de ce monde doit-il disparaître quand le joueur revient dans le jardin ?
 * * Oui seulement si l'étoile de ce monde est ramassée. Sans elle, le miroir reste : le joueur peut y retourner.
 */
export function shouldMirrorDisappear(world) {
  return isWorldStarCollected(world);
}

/**
 * De quel côté regarde ce miroir ? 'right' : le joueur apparaît à sa droite. 'left' : l'image est inversée et le joueur apparaît à sa gauche.
 * * Une propriété « facing » (right ou left) sur l'objet miroir dans Tiled décide. Sans elle : un miroir de la moitié gauche de la carte
 * regarde vers la droite, un miroir de la moitié droite regarde vers la gauche (ils regardent vers le milieu de la carte).
 * @param {object} object  L'objet « mirror » de Tiled (avec x, width et properties)
 * @param {number} mapWidth  La largeur de la carte, en pixels
 * @returns {'left'|'right'}
 */
export function getMirrorFacing(object, mapWidth) {
  const property = (object.properties ?? []).find((p) => p.name === 'facing');
  if (property && (property.value === 'left' || property.value === 'right')) return property.value;
  return object.x + (object.width ?? 0) / 2 < mapWidth / 2 ? 'right' : 'left';
}
