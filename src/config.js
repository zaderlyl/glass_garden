// * Configuration Phaser. La résolution est celle de la borne d'arcade : 1280 x 720 (16:9).


export default {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#2f6b3a',
  pixelArt: true, // pas de lissage : on veut des pixels nets
  scale: {
    // * FIT adapte le jeu à la taille de la fenêtre en gardant le ratio 16:9
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
