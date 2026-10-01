import timer from '../systems/TimerSystem.js';
import { getCollectedStars, getTotalStars } from '../systems/StarSystem.js';
import { formatTime } from '../utils/helpers.js';
import { SCENES, COLORS, FONT_FAMILY, FONT_SIZE, UI_MARGIN } from '../utils/constants.js';

/**
 * * Scène d'interface : affiche le chronomètre et le compteur d'étoiles par-dessus le monde en cours.
 *
 * Elle est lancée UNE SEULE FOIS, en parallèle des mondes, et n'est jamais arrêtée :
 * quand on change de monde, seule la scène du monde est remplacée. C'est ce qui garde
 * l'affichage stable pendant les téléportations.
 */
export default class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENES.UI);
  }

  create() {
    // * Coin haut droit : le texte est aligné sur son bord droit (origine à 1)
    this.timerText = this.add
      .text(this.scale.width - UI_MARGIN, UI_MARGIN, formatTime(0), {
        fontFamily: FONT_FAMILY,
        fontSize: FONT_SIZE.TIMER,
        color: COLORS.TEXT,
      })
      .setOrigin(1, 0);

    // * Le compteur d'étoiles, juste sous le chronomètre, aligné sur le même bord droit
    this.starsText = this.add
      .text(this.scale.width - UI_MARGIN, UI_MARGIN + this.timerText.height, this.getStarsLabel(), {
        fontFamily: FONT_FAMILY,
        fontSize: FONT_SIZE.STARS,
        color: COLORS.TEXT,
      })
      .setOrigin(1, 0);
  }

  // Le texte du compteur : « Étoiles : 2 / 5 »
  getStarsLabel() {
    return `Étoiles : ${getCollectedStars()} / ${getTotalStars()}`;
  }

  // update() est appelée à chaque image : on relit le chronomètre et on met le texte à jour
  update() {
    this.timerText.setText(formatTime(timer.elapsed()));
    this.starsText.setText(this.getStarsLabel());
  }
}
