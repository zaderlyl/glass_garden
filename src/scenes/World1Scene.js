import WorldScene from './WorldScene.js';
import { SCENES, ASSETS } from '../utils/constants.js';

/**
 * * Monde 1 : la nuit.
 * Pour l'instant, il affiche seulement sa carte de test grâce à WorldScene.
 * TODO(équipe): ajouter la mécanique propre au monde 1 (lampe, exploration dans le noir, étoile)
 */
export default class World1Scene extends WorldScene {
  constructor() {
    super(SCENES.WORLD_1, ASSETS.WORLD_1_MAP, 'assets/maps/monde_1.json');
  }
}
