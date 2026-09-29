/**
 * * Première scène du jeu : pour l'instant elle affiche seulement le titre.
 * Elle deviendra l'écran d'accueil (jouer, contrôles...).
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  // create() est appelée une fois, quand la scène démarre
  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'GLASS GARDEN', {
        fontFamily: 'Georgia, serif',
        fontSize: '96px',
        color: '#f4f1e8',
      })
      .setOrigin(0.5); // * on centre le texte sur son point de placement
  }
}
