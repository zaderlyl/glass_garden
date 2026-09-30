//cette fonction sert à récolter les étoiles//
//quand le personnage atteint l'étoile, elle disparaitra, et le compteur d'étoiles augmentera de 1//
//pour gagner une partie, il faut 5 etoiles//
function RecolteEtoiles(player, scene, y,x){
  const etoile = scene.physics.add.sprite(x, y, 'Etoile.png');
  scene.physics.add.overlap(player, etoile, () => {
     etoile.disableBody(true, true);
  });
}

