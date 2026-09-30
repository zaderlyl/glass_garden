import WorldScene from './WorldScene.js';
import { SCENES, ASSETS } from '../utils/constants.js';

/**
 * * Le jardin du spawn : le monde normal, d'où partent les miroirs.
 * Tout le comportement vient de WorldScene : cette scène indique seulement quelle carte afficher.
 */
export default class HubScene extends WorldScene {
  constructor() {
    super(SCENES.HUB, ASSETS.HUB_MAP, 'assets/maps/hub_test.json');
  }
}
