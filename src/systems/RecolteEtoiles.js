var nombreEtoiles = 0;

export function RecolteEtoiles(player, scene, x, y) {
  var etoile = scene.physics.add.sprite(x, y, 'etoile');

  scene.physics.add.overlap(player, etoile, function () {
    nombreEtoiles += 1;
    etoile.disableBody(true, true);
  });
}
