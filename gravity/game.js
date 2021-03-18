/**
 * TODO:
 * Add 'Focus Next' or 'Select Next' button to select the next planet in the list (reach off screen ones)
 * Add collision?
 * Add Solar System preset (see wikipedia to-scale)
 */

const canvas = document.getElementById("gameCanvas");
const colorInput = document.getElementById("planetColor");
const massInput = document.getElementById("massSlider");
const sizeInput = document.getElementById("sizeSlider");
const showPathsInput = document.getElementById("showPaths");
const showVelsInput = document.getElementById("showVels");
const showForcesInput = document.getElementById("showForces");

const ctx = canvas.getContext("2d");

const gConst = 1; // gravitational constant (kind of works like the speed too)
const velDampener = .005; // dampens velocity so pixel size and in-code vel are not 1:1

const allPlanets = [];
let sPlanetIndex = -1; // selected planet index
let fPlanetIndex = -1; // focused planet index

let playing = false;
let atStart = true;
let simSpeed = 1;
let pathStats = {
    size: 0,
    maxSize: 30000,
    calculateSpeed: 100,
};

let stars = [];
for (let i = 0; i < 50; i++){
    stars.push( { x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 3} );
}

function getMouse(e){ // parameter is a MouseEvent
    // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
    let mouseX = e.pageX - e.currentTarget.offsetLeft;
    let mouseY = e.pageY - e.currentTarget.offsetTop;

    if (fPlanetIndex != -1){ // if centered on planet, adjust
        const p = allPlanets[fPlanetIndex];
        mouseX -= -p.x + canvas.width/2;
        mouseY -= -p.y + canvas.height/2;
    }
    return { x: mouseX, y: mouseY }
}
// ============ button functions ===============
function togglePlaySimulation(){
    playing = !playing;
    sPlanetIndex = -1;
    atStart = false;
}
function speedUpSimulation(buttonID){
    simSpeed *= 2;
    if (simSpeed > 4) simSpeed = 1;
    document.getElementById(buttonID).innerHTML = simSpeed + "x Speed";
}
function resetSimulation(){
    playing = false;
    atStart = true;
    for (let p of allPlanets){
        p.resetSimulation();
    }
}
function deleteCurrentPlanet(){
    if (sPlanetIndex != -1){
        allPlanets.splice(sPlanetIndex, 1);
        if (fPlanetIndex == sPlanetIndex)
            fPlanetIndex = -1;
        sPlanetIndex = -1;
    }
    clearVelsInPaths();
}
function focusCurrentPlanet(){
    fPlanetIndex = sPlanetIndex;
}
function loadPreset(...args){ // input is n number of objects { x, y, mass, radius, r, g, b }
    resetSimulation();
    allPlanets.length = 0;

    const template = { x:0, y:0, mass:0, radius:0, r:0, g:0, b:0} // values don't matter, just checking the keys
    for (const newPlanet of args){
        if (Object.keys(newPlanet) != Object.keys(template))
            return alert("There was an error while loading the preset");
        allPlanets.push(new Planet(newPlanet.x, newPlanet.y, newPlanet.mass, newPlanet.radius, ))
    }
}
// ============ path stuff ==================
function calculateNextVelInPaths(){
    pathStats.size += pathStats.calculateSpeed;
    for (let i = 0; i < pathStats.calculateSpeed; i++){
        for (const p of allPlanets){
            p.calculateNextVelInPath();
        }
    }
}
function clearVelsInPaths(){
    pathStats.size = 0;
    for (const p of allPlanets){
        p.clearVelsInPath();
    }
}
/*  =========================
          main functions
    ========================= */
function update(){
    // ========== update planets ==============
    if (playing){
        for (let i = 0; i < simSpeed; i++){
            for (const p of allPlanets){
                p.update();
            }
            for (const p of allPlanets){
                p.lateUpdate();
            }
        }
    } else {
        if (showPathsInput.checked && pathStats.size < pathStats.maxSize)
            calculateNextVelInPaths();
    }
}
function render(){
    //ctx.canvas.width = window.innerWidth - 60; // not sure why 60...
    //ctx.canvas.height = window.innerHeight - 78;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // style, background-color is already black

    for (const s of stars){ // draw stars (before translation & scale, because they are lightyears away)
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2, false);
        ctx.fill();
        ctx.closePath();
    }

    let focusedTranslation = { x:0, y:0 };
    if (fPlanetIndex != -1) {
        focusedTranslation.x = allPlanets[fPlanetIndex].x - canvas.width/2;
        focusedTranslation.y = allPlanets[fPlanetIndex].y - canvas.height/2;
    }
    ctx.translate(-focusedTranslation.x, -focusedTranslation.y);


    for (const p of allPlanets){ // draw planets
        p.render(ctx);
    }
    
    // ================ draw gizmos ===================== \\
    let focusedPlanet = null;
    if (fPlanetIndex != -1) focusedPlanet = allPlanets[fPlanetIndex];
    for (const p of allPlanets){
        if (showPathsInput.checked)
            p.renderPath(ctx, focusedPlanet);
        if (showVelsInput.checked)
            p.renderVel(ctx);
        if (showForcesInput.checked)
            p.renderForces(ctx);
    }
    // ============= highlights selected planet ============== \\
    if (sPlanetIndex != -1){
        const p = allPlanets[sPlanetIndex];
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2, false);
        ctx.stroke();
        ctx.closePath();
    }
    
    ctx.translate(focusedTranslation.x, focusedTranslation.y);
}

function gameLoop(){
    update();
    render();
    window.requestAnimationFrame(gameLoop);
}

gameLoop();

// ==================== canvas mouse inputs ====================================
canvas.onclick = e => { // ON LEFT CLICK
    if (playing) return;
    
    const mouse = getMouse(e);

    // check if click on existing
    for (let i = 0; i < allPlanets.length; i++){
        const p = allPlanets[i];
        if ((p.x - mouse.x)*(p.x - mouse.x) + (p.y - mouse.y)*(p.y - mouse.y) < p.radius * p.radius){
            sPlanetIndex = i;
            return;
        }
    }

    if (!atStart) return; // so you cannot place planets mid simulation

    // if not clicked anything, create new planet
    allPlanets.push(new Planet(mouse.x, mouse.y, massInput.value, sizeInput.value, colorInput.value));
    sPlanetIndex = allPlanets.length - 1;
    clearVelsInPaths();
}
canvas.oncontextmenu = e => { // ON RIGHT CLICK
    if (playing) return false;

    const mouse = getMouse(e);

    if (sPlanetIndex != -1){
        // set velocity of planet
        const p = allPlanets[sPlanetIndex];
        p.initVelX = (mouse.x - p.x) * velDampener;
        p.initVelY = (mouse.y - p.y) * velDampener;
        p.applyInitValues();
    }
    clearVelsInPaths();
    return false; // return false so the context menu doesn't show
}