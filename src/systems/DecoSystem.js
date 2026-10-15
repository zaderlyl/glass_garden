// =====================================================================================
// * DECO SYSTEM : LE DÉCOR DES MONDES
// =====================================================================================
//
// Le décor se pose dans Tiled : des objets « point » de classe « deco » (DECO.TILED_CLASS) dans le calque « objects ». Le NOM de
// l'objet est l'image à afficher (voir DECO.IMAGES dans constants.js : « fleur_1 », « lanterne_bleue »...). Le point marque les
// PIEDS de l'image (le bas, centré). Changer, déplacer ou ajouter du décor se fait dans Tiled, sans toucher au code.
//
// Le décor est trié en profondeur avec les personnages (voir WorldScene.sortByDepth) : le joueur passe devant ou derrière
// selon sa position. Une image de 16 px est agrandie ×2 pour aller avec les tuiles de 32 px.
//
// * COMMENT L'UTILISER
//   preloadDeco(this);                       // dans preload()
//   this.deco = createDeco(this, map);       // dans create() ; renvoie la liste des sprites de décor
// =====================================================================================

import { DECO } from '../utils/constants.js';

/** Charge les images du décor. À appeler dans preload(). */
export function preloadDeco(scene) {
  DECO.IMAGES.forEach((name) => scene.load.image(DECO.KEY_PREFIX + name, `${DECO.PATH}${name}.png`));
}

/**
 * Crée le décor de la carte : une image à chaque objet « deco ».
 * @param {Phaser.Scene} scene
 * @param {Phaser.Tilemaps.Tilemap} map
 * @returns {Phaser.GameObjects.Image[]} les images posées (vide s'il n'y a pas de décor)
 */
export function createDeco(scene, map) {
  const objects = map.getObjectLayer('objects')?.objects ?? [];
  return objects
    .filter((object) => (object.class || object.type) === DECO.TILED_CLASS)
    .map((object) => {
      const key = DECO.KEY_PREFIX + object.name;
      if (!scene.textures.exists(key)) {
        console.warn(`[DecoSystem] Décor inconnu : « ${object.name} » (voir DECO.IMAGES dans constants.js).`);
        return null;
      }
      const image = scene.add.image(object.x, object.y, key).setOrigin(0.5, 1);
      image.texture.setFilter(Phaser.Textures.FilterMode.NEAREST); // pixel art net, même agrandi
      if (image.width <= DECO.SMALL_SIZE) image.setScale(2);
      return image;
    })
    .filter(Boolean);
}
