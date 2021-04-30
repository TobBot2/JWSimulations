const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fluidRestingHeight = .5 * canvas.height;
let fluidHeight = fluidRestingHeight;
const fluidWidth = canvas.width * .6; // no physics beyond this point

let fluidDensity = .01;

const gravity = 1;
const friction = .95;

const allToys = [];

/****************************************/
/************* CREATE TOYS **************/
/****************************************/

let circlePath = (resolution, r) => { // generate circle path with 'resolution' number of points and radius of 'r'
    let path = [];
    for (let i = resolution; i >= 0; i--)
        path.push(Math.cos(i/resolution * Math.PI*2) * r, Math.sin(i/resolution * Math.PI*2) * r);
    return path;
}

allToys.push(new Toy( // Simple rectangle (400x200)
    fluidWidth/2, 10, 200, // X, Y, MASS
    [-200,-100, 200,-100, 200,100, -200,100], // RENDER PATH
    // FIND AREA OF WATER DISPLACED
    y => {
        let toyHeight = y + 100 - fluidHeight;
        return Math.min(Math.max(toyHeight * 400, 0), 400*200); // constrains between 0 and 400*200
    },
    // CHECK IF MOUSE IS OVER
    (x, y, mouseX, mouseY) => {
        return x + 200 > mouseX && x - 200 < mouseX && y + 100 > mouseY && y - 100 < mouseY;
    }
));

allToys.push(new Toy( // Simple circle (r=20)
    fluidWidth +75, canvas.height -50, 1, // x, y, mass
    circlePath(36, 20), // RENDER PATH
    // FIND AREA OF WATER DISPLACED, approximate using a square cuz I don't want to implement integrals
    y => {
        let toyHeight = y+10 - fluidHeight;
        let approxWidth = 36; // square this size has same area as circle with r=20
        if (toyHeight > 0)
            return Math.min(toyHeight * approxWidth, approxWidth * approxWidth);
        else return 0;
    },
    // CHECK IF MOUSE IS OVER
    (x, y, mouseX, mouseY) => {
        return (x-mouseX)*(x-mouseX) + (y-mouseY)*(y-mouseY) < 10*10;
    }
));

/**********************************/
/*********** MAIN LOOPS ***********/
/**********************************/

function update(){
    fluidHeight = fluidRestingHeight;
    for (const t of allToys){
        t.update();
    }
}
function render(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    ctx.fillStyle = "cornflowerblue";
    ctx.fillRect(0,fluidHeight,fluidWidth,canvas.height-fluidHeight);

    for (const t of allToys){
        t.render(ctx);
    }

    ctx.fillStyle = "cornflowerblue";
    ctx.globalAlpha = .5;
    ctx.fillRect(0,fluidHeight,fluidWidth,canvas.height-fluidHeight);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(0,canvas.height-fluidRestingHeight);
    ctx.lineTo(fluidWidth,canvas.height-fluidRestingHeight);
    ctx.closePath();
    ctx.stroke();
}
function game_loop(){

    update();
    render();

    window.requestAnimationFrame(game_loop);
}

game_loop();