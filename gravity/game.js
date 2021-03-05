let canvas = document.getElementById("gameCanvas");
let g = canvas.getContext("2d");

const gConst = 1;
const velDampener = .1;

const allPlanets = [];
let sPlanetIndex = -1; // selected planet index

let playing = false;

function togglePlaySimulation(){
    playing = !playing;
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
function update(){
    if (playing){
        for (const p of allPlanets){
            p.update();
        }
        for (const p of allPlanets){
            p.lateUpdate();
        }
    }
}
function render(){
    // render slightly larger red circle behind selected circle to show it is selected
    g.clearRect(0, 0, canvas.width, canvas.height);
    if (sPlanetIndex != -1){
        const p = allPlanets[sPlanetIndex];
        g.beginPath();
        g.fillStyle = "red";
        g.arc(p.x, p.y, p.radius + 2, 0, Math.PI*2, false);
        g.fill();
        g.closePath();
    }
    for (let p of allPlanets){
        p.render(g);
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

    onMouseClick: if (e.button == 0){
        // check if click on existing
        for (let i = 0; i < allPlanets.length; i++){
            const p = allPlanets[i];
            if ((p.x - mouseX)*(p.x - mouseX) + (p.y - mouseY)*(p.y - mouseY) < p.radius * p.radius){
                sPlanetIndex = i;
                break onMouseClick;
            }
        }
        // if not clicked anything, create new planet
        allPlanets.push(new Planet(mouseX, mouseY, 1, 50, "green", gConst, allPlanets));
        sPlanetIndex = allPlanets.length - 1;
    }

    if (e.button == 2){
        if (sPlanetIndex != -1){
            // set velocity of planet
            const p = allPlanets[sPlanetIndex];
            p.initVelX = (mouseX - p.x) * velDampener;
            p.initVelY = (mouseY - p.y) * velDampener;
        }
    }
}
canvas.ondrag = e => {
    // if selected planet != null, move it
}