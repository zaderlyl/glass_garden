import InputManager from '../systems/InputManager.js';
this.load.image("cible", "assets/boite1.png");
var groupeCibles;

cibles = this.physics.add.group({
            key: 'cible',
            repeat: 7,
            setXY: { x: 24, y: 0, stepX: 107 }
        });
this.physics.add.collider(cibles, platforms);

function hit (uneBalle, uneCible) {
    uneBalle.destroy();
    uneCible.destroy();
}

this.physics.add.overlap(groupeBullets, cibles, hit, null,this);

cibles.children.iterate(function (cibleTrouvee) {
   // définition de points de vie
   cibleTrouvee.pointsVie=Phaser.Math.Between(1, 5);;
   // modification de la position en y
   cibleTrouvee.y = Phaser.Math.Between(10,250);
   // modification du coefficient de rebond
   cibleTrouvee.setBounce(1);
});

function hit (bullet, cible) {
  cible.pointsVie--;
  if (cible.pointsVie==0) {
    cible.destroy();
  }
   bullet.destroy();
}

bullet.body.onWorldBounds = true;

this.physics.world.on("worldbounds", function(body) {
        // on récupère l'objet surveillé
        var objet = body.gameObject;
        // s'il s'agit d'une balle
        if (groupeBullets.contains(objet)) {
            // on le détruit
            objet.destroy();
        }
    });

