const canvas = document.getElementById("gameCanvas");
const slopeSlider = document.getElementById("slopeSlider");

const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 17; // - 17 for scrollbar
canvas.height = window.innerHeight - 100;

const toRad = Math.PI / 180;

const gravity = 1;

const hilltopHeight = canvas.height-100;
const hilltopWidth = canvas.width-100;
const pulleyOffset = 50; // offset from the hilltop position. (up and to the right)
const objectSize = 20; // radius of pulley, hanging object, and size of sitting object

let mus = .6; // coefficient of static friction (mu static)
let muk = .4; // coefficient of kinetic friction (mu kinetic)
let muThresh = .1;

// hanging object is the one that is suspended only by string,
// sitting object is the one suspended by string AND the ground/slope
let hangingObj = {
    mass: 1,
    height: canvas.height - hilltopHeight + 100,
    vel: 0, // only vertical
};
let sittingObj = {
    mass: 1,
    distance: 0, // distance to pulley (across slope)
    vel: 0, // only across slope
    moving: 0, // keeps track of how many frames it has been moving (or its vel > threshold) 
};


/* ====================
      MAIN FUNCTIONS
   ==================== */
function update(){
    // CALCULATE FORCES (aligned with slope)
    // calculate gravity of objects (F = mg)
    let hangingForce = gravity * hangingObj.mass;
    let sittingForce = gravity * sittingObj.mass;
    // add forces together and align forces to slope
    // sin/cos are switched because of weirdness. Also, sittingForce x is negative because weirdness
    let appliedForce = hangingForce - Math.sin(slopeSlider.value * toRad)*sittingForce;
    let normalForce = Math.cos(slopeSlider.value * toRad)*sittingForce; // normal force is gravity, but adjusted to be aligned with the slope.

    // CALCULATE FRICTION FORCE
    let frictionForce;
    if (sittingObj.moving < 100) { // if has been moving for less than x frames (should be ~2 seconds based on wikipedia)
        frictionForce = mus * normalForce;
    }else {
        frictionForce = muk * normalForce;
    }

    // GET NET FORCE by adding all the forces together
    let netForce = appliedForce - frictionForce;
    // no vertical because the normal force is by definition equal to the force the object pushes on it.

    sittingObj.vel += netForce;

    sittingObj.distance += sittingObj.vel;

    // see if object is considered moving or not.
    if (sittingObj.vel > .02) sittingObj.moving++;
    else sittingObj.moving = 0;

}
function render(){
    ctx.fillStyle = "cornflowerblue";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // draw slope
    ctx.beginPath();
    ctx.fillStyle = "sienna";
    ctx.moveTo(0, canvas.height); // I do crazy math \/ so the slope extends to the edge of the screen. A bit unnecessary, but whatever
    ctx.lineTo(0, canvas.height - hilltopHeight + Math.tan(slopeSlider.value * toRad) * hilltopWidth);
    ctx.lineTo(hilltopWidth, canvas.height - hilltopHeight);
    ctx.lineTo(hilltopWidth, canvas.height);
    ctx.fill();
    ctx.closePath();

    // draw pulley
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc(hilltopWidth + pulleyOffset, canvas.height - hilltopHeight - pulleyOffset, objectSize, 0, Math.PI*2);
    ctx.fill();
    ctx.closePath();
}
function gameLoop(){
    update();
    render();
    requestAnimationFrame(gameLoop);
}
gameLoop();