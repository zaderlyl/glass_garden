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
// * UTILISÉ PAR : les scènes où le joueur agit (voir src/scenes/)
//
// * COMMENT L'UTILISER
//   import InputManager from '../systems/InputManager.js';
//
//   create() { this.input1 = new InputManager(this, 1); }
//   update() {
//     const move = this.input1.getMove();              // { x: -1..1, y: -1..1 }
//     if (this.input1.justPressed('interact')) { ... } // une seule fois par appui
//   }
//
// TODO(équipe): ajouter les actions courir, tirer, lampe, pause
// TODO(équipe): brancher les boutons de la borne (joystick + 6 boutons par joueur)
// =====================================================================================

// * Association action -> touche (noms de touches Phaser), pour chaque joueur.
// ? Les touches du joueur 2 sont provisoires : à valider avec l'équipe et la borne.
// ? La touche E (interagir) n'est PAS définitive : elle dépendra des boutons de la borne d'arcade.
const BINDINGS = {
  1: { up: 'Z', down: 'S', left: 'Q', right: 'D', interact: 'E' },
  2: { up: 'UP', down: 'DOWN', left: 'LEFT', right: 'RIGHT', interact: 'ENTER' },
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
   * Vrai uniquement à l'image où l'action vient d'être appuyée (un seul déclenchement).
   * Différent d'isDown, qui reste vrai tant que la touche est maintenue.
   * @param {string} action  Nom de l'action (ex. 'interact')
   */
  justPressed(action) {
    return Phaser.Input.Keyboard.JustDown(this.keys[action]);
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
