// * Systems d'import de fonction : "import {fonction} from {chemin}"

import config from './config.js';

// * Point d'entrée : on crée le jeu Phaser avec notre configuration.
// Phaser est chargé avant ce fichier par index.html (variable globale `Phaser`).
new Phaser.Game(config);
