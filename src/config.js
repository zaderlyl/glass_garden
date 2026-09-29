import MenuScene from './scenes/MenuScene.js';
import HubScene from './scenes/HubScene.js';

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
  // * La première scène de la liste est celle qui démarre
  // ? HubScene est en premier le temps de développer le joueur. Le menu redeviendra la première scène.
  scene: [HubScene, MenuScene],
};
