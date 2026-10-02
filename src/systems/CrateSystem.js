// =====================================================================================
// * CRATE SYSTEM : LES CAISSES QU'ON CASSE EN TIRANT
// =====================================================================================
//
// * POURQUOI CE FICHIER EXISTE
// Une caisse est un objet Tiled de classe « crate ». Elle bloque le joueur comme un mur, et chaque balle qui la touche
// lui retire une vie (hitPoints) : à zéro, elle est détruite. La carte décide donc où sont les caisses et combien
// de tirs il faut pour les casser, sans toucher au code.
//
// * DANS TILED
//   1. Dans le calque d'objets « objects », ajouter un objet (un POINT suffit : il est posé au centre de la caisse,
//      comme les étoiles ; un rectangle marche aussi).
//   2. Lui donner la classe « crate » (CRATE.TILED_CLASS).
//   3. Facultatif : une propriété personnalisée « hitPoints » (entier) = nombre de tirs pour la casser.
//      Sans elle, CRATE.DEFAULT_HIT_POINTS (1).
//
// * COMMENT L'UTILISER (dans une scène de monde qui a un joueur et un groupe de balles)
//   import { preloadCrate, createCrates } from '../systems/CrateSystem.js';
//
//   preload() { preloadCrate(this); }
//   create()  { ... this.crates = createCrates(this, map, this.player, this.bullets); }
//
// La collision balle/caisse est celle des cibles (addTargetCollision, dans fonctionTir.js) : la balle explose,
// la caisse perd une vie.
// TODO(équipe): une animation quand la caisse se casse (pour l'instant elle disparaît simplement)
// =====================================================================================

import { CRATE } from '../utils/constants.js';
import { addTargetCollision } from './fonctionTir.js';

/**
 * Charge l'image des caisses. À appeler dans preload().
 * @param {Phaser.Scene} scene
 */
export function preloadCrate(scene) {
  scene.load.image(CRATE.KEY, CRATE.PATH);
}

/**
 * La valeur d'une propriété personnalisée d'un objet Tiled, ou la valeur par défaut si elle n'existe pas.
 * (Tiled stocke les propriétés dans un tableau [{ name, type, value }, ...].)
 * @param {object} object  Un objet Tiled
 * @param {string} name
 * @param {*} defaultValue
 */
export function getTiledProperty(object, name, defaultValue) {
  const property = (object.properties ?? []).find((p) => p.name === name);
  return property ? property.value : defaultValue;
}

/**
 * Crée les caisses d'une carte : un groupe statique, bloquant pour le joueur et cassable par les balles.
 * Sans objet « crate » dans la carte (ou sans calque « objects »), le groupe est simplement vide.
 * @param {Phaser.Scene} scene
 * @param {Phaser.Tilemaps.Tilemap} map  La carte Tiled
 * @param {Phaser.GameObjects.Sprite} player  Le joueur : il ne traverse pas les caisses
 * @param {Phaser.Physics.Arcade.Group} bullets  Le groupe de balles (voir fonctionTir.js)
 * @returns {Phaser.Physics.Arcade.StaticGroup} le groupe de caisses
 */
export function createCrates(scene, map, player, bullets) {
  const crates = scene.physics.add.staticGroup();
  const objects = map.getObjectLayer('objects')?.objects ?? [];

  objects
    .filter((object) => (object.class || object.type) === CRATE.TILED_CLASS)
    .forEach((object) => {
      // * Un point est posé au centre ; un rectangle Tiled a son coin en haut à gauche : on vise son centre
      const x = object.x + (object.width ?? 0) / 2;
      const y = object.y + (object.height ?? 0) / 2;

      const crate = crates.create(x, y, CRATE.KEY);
      crate.hitPoints = getTiledProperty(object, 'hitPoints', CRATE.DEFAULT_HIT_POINTS);
    });

  scene.physics.add.collider(player, crates);
  addTargetCollision(scene, bullets, crates);

  return crates;
}
