import InputManager from '../systems/InputManager.js';

this.load.image("bullet", "assets/balle.png");
player.direction = 'right';

if (cursors.left.isDown) {
    player.direction = 'left';
    player.setVelocityX(-160);
    player.anims.play('left', true);
}
else if (cursors.right.isDown) {
    player.direction = 'right';
    player.setVelocityX(160);
    player.anims.play('right', true);
}

function tirer(player) {
  var boutonFeu;
  boutonFeu = this.input.keyboard.addKey('A');
  var groupeBullets;
  groupeBullets = this.physics.add.group();
	var coefDir;
	    if (player.direction == 'left') { coefDir = -1; } else { coefDir = 1 }
        var bullet = groupeBullets.create(player.x + (25 * coefDir), player.y - 4, 'bullet');
        bullet.setCollideWorldBounds(true);
        bullet.body.allowGravity =false;
        bullet.setVelocity(1000 * coefDir, 0);
}

if ( Phaser.Input.Keyboard.JustDown(boutonFeu)) {
   tirer(player);
}
