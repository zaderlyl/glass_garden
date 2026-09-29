// =====================================================================================
// * INPUT MANAGER : TOUTES LES TOUCHES DU JEU À UN SEUL ENDROIT
// =====================================================================================
//
// * POURQUOI CE FICHIER EXISTE
// Le reste du jeu ne doit jamais dire « est-ce que la touche Z est appuyée ? ».
// Il doit dire « est-ce que le joueur veut aller vers le haut ? ».
// Seul ce fichier fait le lien entre une ACTION (haut, bas...) et une TOUCHE (Z, S...).
//
// * POURQUOI C'EST IMPORTANT : LA BORNE D'ARCADE
// Le jeu doit tourner sur une borne d'arcade : joystick + boutons, pas de clavier.
// Si les touches sont écrites dans chaque scène, il faudra modifier tout le code.
// Avec ce fichier, brancher la borne = modifier UNIQUEMENT la table BINDINGS ci-dessous.
//
// * AUTRES AVANTAGES
// - Le joueur 2 : un deuxième InputManager avec d'autres touches, sans dupliquer de code.
// - La diagonale (diviser par racine de 2) est écrite une seule fois, ici.
//
// ! OPTIONNEL POUR LE MOMENT
// Ce fichier n'est PAS encore utilisé : HubScene lit encore ses touches elle-même.
// On l'utilisera dès qu'on aura un deuxième joueur, une deuxième scène qui bouge,
// ou d'autres actions (interagir, tirer, lampe).
//
// * COMMENT L'UTILISER (quand on le branchera)
//   import InputManager from '../systems/InputManager.js';
//
//   create() { this.input1 = new InputManager(this, 1); }
//   update() { const move = this.input1.getMove(); }   // { x: -1..1, y: -1..1 }
//
// TODO(équipe): ajouter les actions interagir, courir, tirer, lampe, pause
// TODO(équipe): brancher les boutons de la borne (joystick + 6 boutons par joueur)
// =====================================================================================

// * Association action -> touche (noms de touches Phaser), pour chaque joueur.
// ? Les touches du joueur 2 sont provisoires : à valider avec l'équipe et la borne.
const BINDINGS = {
  1: { up: 'Z', down: 'S', left: 'Q', right: 'D' },
  2: { up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT' },
};

export default class InputManager {
  /**
   * @param {Phaser.Scene} scene  La scène qui utilise cet InputManager
   * @param {number} playerId     1 ou 2 : choisit les touches dans BINDINGS
   */
  constructor(scene, playerId = 1) {
    this.playerId = playerId;

    // addKeys crée un objet { action: touche } à partir de { action: 'NOM_DE_TOUCHE' }
    this.keys = scene.input.keyboard.addKeys(BINDINGS[playerId]);
  }

  /**
   * Direction souhaitée, entre -1 et 1 sur chaque axe.
   * @returns {{x: number, y: number}}
   */
  getMove() {
    let x = Number(this.keys.right.isDown) - Number(this.keys.left.isDown);
    let y = Number(this.keys.down.isDown) - Number(this.keys.up.isDown);

    // * En diagonale, on divise par racine de 2, sinon on irait plus vite qu'en ligne droite
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }

    return { x, y };
  }
}
