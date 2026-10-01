//cette fonction sert à récolter les étoiles//
//quand le personnage atteint l'étoile, elle disparaitra, et le compteur d'étoiles augmentera de 1//
//pour gagner une partie, il faut 5 etoiles//

// ! PISTES : des questions, pas des solutions. Un pas à la fois, testé dans le navigateur,
// un commit par pas.
// * 1. L'étoile s'affiche au bon endroit
// * 2. Elle disparaît quand le joueur la touche
// * 3. Le compteur monte, une seule fois par étoile
// * 4. Le jeu se souvient des étoiles déjà prises
// * 5. Victoire et arrêt du chrono (relire docs/game-design.md : 5 étoiles suffisent-elles ?)

function RecolteEtoiles(player, scene, y,x){
  var RecolteEtoile;

  // ? Pas 1 : 'Etoile.png' est une clé de chargement, pas un nom de fichier. Où est-elle chargée ?
  // ? Pas 2 : d'où viennent x et y ? (voir comment WorldScene.js place les miroirs)

  const etoile = scene.physics.add.sprite(x, y, 'Etoile.png');
  scene.physics.add.overlap(player, etoile, () => {

     // ? Pas 3 : une scène est recréée à chaque téléportation. Où ranger le compteur ? (voir TimerSystem.js)
     // ? Pas 4 : si on revient dans ce monde, l'étoile déjà prise doit-elle réapparaître ?

     etoile.disableBody(true, true);
  });


  }



// * CE QUE TON CODE FAIT ACTUELLEMENT
//   - Crée une étoile aux coordonnées (x, y) avec l'image dont la clé est 'Etoile.png'.
//   - Quand le joueur la touche, l'étoile disparaît (cachée et désactivée).
//
// CE QU'IL NE FAIT PAS ENCORE
//   - Personne n'appelle la fonction : elle n'est ni exportée ni importée ailleurs.
//   - L'image n'est chargée nulle part : sans chargement, Phaser affiche une image « manquante » ce qu'on appelle un "placeholder". // * regarde se que j'ai fait pour le mirroir dans WorldScene.js [l41 - l51] et [l98 - l123]
//   - Rien ne compte les étoiles, et rien ne se souvient de celles déjà prises. // TODO : creation d'une variable qui attend un resultat et qui a +1 au moment ou l'étoile est recupérée

