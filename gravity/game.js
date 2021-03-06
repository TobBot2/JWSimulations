const canvas = document.getElementById("gameCanvas");
const massInput = document.getElementById("massSlider");
const sizeInput = document.getElementById("sizeSlider");

const ctx = canvas.getContext("2d");

const gConst = .1; // gravitational constant
const velDampener = .01; // dampens velocity so pixel size and in-code vel are not 1:1

const allPlanets = [];
let sPlanetIndex = -1; // selected planet index
let fPlanetIndex = -1; // focused planet index;

let playing = false;
let pathStats = {
    size: 0,
    maxSize: 60000,
    calculateSpeed: 60,
};

// ====== toggle gizmos ========= 
let showVelocities = true;
let showForces = true;
let showPaths = true;
// ============ button functions ===============
function togglePlaySimulation(){
    playing = !playing;
    sPlanetIndex = -1;
}
function resetSimulation(){
    playing = false;
    for (let p of allPlanets){
        p.resetSimulation();
    }
}
function deleteCurrentPlanet(){
    if (sPlanetIndex != -1){
        allPlanets.splice(sPlanetIndex, 1);
        sPlanetIndex = -1;
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
    if (playing){
        for (const p of allPlanets){
            p.update();
        }
        for (const p of allPlanets){
            p.lateUpdate();
        }
    } else {
        if (showPaths && pathStats.size < pathStats.maxSize)
            calculateNextVelInPaths();
    }
}
function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of allPlanets){ // draw planets
        p.render(ctx);
    }
    
    for (const p of allPlanets){ // draw gizmos
        if (showVelocities)
            p.renderVel(ctx);
        if (showPaths)
            p.renderPath(ctx);
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
}

function gameLoop(){
    update();
    render();
    window.requestAnimationFrame(gameLoop);
}

gameLoop();
canvas.onclick = e => {
    if (playing) return;
    
    // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
    const mouseX = e.pageX - e.currentTarget.offsetLeft;
    const mouseY = e.pageY - e.currentTarget.offsetTop;

    // check if click on existing
    for (let i = 0; i < allPlanets.length; i++){
        const p = allPlanets[i];
        if ((p.x - mouseX)*(p.x - mouseX) + (p.y - mouseY)*(p.y - mouseY) < p.radius * p.radius){
            sPlanetIndex = i;
            return;
        }
    }
    // if not clicked anything, create new planet
    allPlanets.push(new Planet(mouseX, mouseY, massInput.value, sizeInput.value, "green", gConst, velDampener, allPlanets));
    sPlanetIndex = allPlanets.length - 1;
    clearVelsInPaths();
}
canvas.oncontextmenu = e => { // ON RIGHT CLICK
    if (playing) return false;

    // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
    const mouseX = e.pageX - e.currentTarget.offsetLeft;
    const mouseY = e.pageY - e.currentTarget.offsetTop;

    if (sPlanetIndex != -1){
        // set velocity of planet
        const p = allPlanets[sPlanetIndex];
        p.initVelX = (mouseX - p.x) * velDampener;
        p.initVelY = (mouseY - p.y) * velDampener;
        p.applyInitValues();
    }
    clearVelsInPaths();
    return false; // return false so the context menu doesn't show
}
canvas.ondrag = e => {
    
}