// =====================================================================================
// * STAR SYSTEM : COMPTER LES ÉTOILES DU JEU
// =====================================================================================
//
// * POURQUOI CE FICHIER EXISTE
// Le nombre total d'étoiles n'est écrit nulle part à la main : il est CALCULÉ en comptant les objets
// « star » posés dans les cartes Tiled. Ajouter ou retirer une étoile dans Tiled suffit, le total suit.
// Les valeurs vivent dans ce fichier, chargé une seule fois pour tout le jeu (comme MirrorSystem).
//
// * COMMENT L'UTILISER
//   import { countStarsInMap, computeStarTotals, getTotalStars } from '../systems/StarSystem.js';
//
//   computeStarTotals(this.cache.tilemap);   // une fois, quand les cartes sont chargées (PreloadScene)
//   getTotalStars();                          // le total, partout ailleurs
// =====================================================================================

import { WORLD_MAPS } from '../utils/constants.js';

// Nom du calque d'objets et classe Tiled d'une étoile (les mêmes que dans WorldScene.createStars)
const OBJECT_LAYER = 'objects';
const STAR_CLASS = 'star';

let totalStars = 0;
const starsPerWorld = {};

/**
 * Compte les étoiles d'une carte, à partir du JSON exporté de Tiled.
 * Fonction pure : elle ne connaît ni Phaser ni l'état du jeu, elle se teste seule.
 * @param {Object} mapData  Le JSON de la carte (celui de cache.tilemap.get(clé).data)
 * @returns {number}
 */
export function countStarsInMap(mapData) {
  const layer = mapData?.layers?.find((l) => l.type === 'objectgroup' && l.name === OBJECT_LAYER);
  if (!layer) return 0;
  // * Tiled écrit la classe dans « class » (versions récentes) ou « type » (anciennes) : on lit les deux
  return layer.objects.filter((object) => (object.class || object.type) === STAR_CLASS).length;
}

/**
 * Compte les étoiles de TOUTES les cartes de WORLD_MAPS et mémorise le total.
 * @param {Phaser.Cache.BaseCache} tilemapCache  this.cache.tilemap
 * @returns {number} le total
 */
export function computeStarTotals(tilemapCache) {
  totalStars = 0;
  Object.keys(starsPerWorld).forEach((world) => delete starsPerWorld[world]);

  Object.entries(WORLD_MAPS).forEach(([world, { key }]) => {
    // Une carte absente du cache compte 0 : PreloadScene prévient déjà qu'elle est introuvable
    const count = tilemapCache.exists(key) ? countStarsInMap(tilemapCache.get(key).data) : 0;
    starsPerWorld[world] = count;
    totalStars += count;
  });

  // ! Un total de 0 ferait gagner la partie dès le départ (« toutes les étoiles sont prises »)
  if (totalStars === 0) console.warn('[StarSystem] Aucune étoile trouvée dans les cartes : vérifier les objets « star » dans Tiled.');
  return totalStars;
}

/** Le nombre total d'étoiles du jeu (0 tant que computeStarTotals n'a pas été appelée). */
export function getTotalStars() {
  return totalStars;
}

/** Le nombre d'étoiles d'un monde (nom de WORLDS). 0 si le monde est inconnu. */
export function getStarsInWorld(world) {
  return starsPerWorld[world] ?? 0;
}
