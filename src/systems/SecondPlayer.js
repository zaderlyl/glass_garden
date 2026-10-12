this.touches_SecondPlayer = this.input.keyboard.addKeys({
input: { gamepad: true },


});
const pad = this.input.gamepad.getPad(1);
let vx = 0, vy = 0;

if (pad) {
  if (pad.axes[0].getValue() < -0.5) vx = -150;
  else if (pad.axes[0].getValue() > 0.5) vx = 150;
  if (pad.axes[1].getValue() < -0.5) vy = -150;
  else if (pad.axes[1].getValue() > 0.5) vy = 150;
}
this.joueur2.setVelocity(vx, vy);
