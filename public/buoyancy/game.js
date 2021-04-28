const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fluidRestingHeight = .5 * canvas.height;
let fluidHeight = fluidRestingHeight;
const fluidWidth = canvas.width - 100; // no physics beyond this point

let fluidDensity = .01;

const gravity = 1;

const allToys = [];

let circlePath = (resolution, r) => { // generate circle path with 'resolution' number of points and radius of 'r'
    let path = [];
    for (let i = resolution; i >= 0; i--)
        path.push(Math.cos(i/resolution * Math.PI*2) * r, Math.sin(i/resolution * Math.PI*2) * r);
    return path;
}

allToys.push(new Toy( // Simple rectangle (40x20)
    fluidWidth - 25, 10, 1,
    [-20,-10, 20,-10, 20,10, -20,10],
    y => {
        let toyHeight = y - fluidHeight;
        if (toyHeight > 0)
            return Math.min(toyHeight * 20, 40 * 20);
        else return 0;
    }
));

allToys.push(new Toy( // Simple circle (r=20)
    fluidWidth +75, canvas.height -50, 1,
    circlePath(36, 20),
    y => { // approximate using a square cuz I don't want to implement integrals
        let toyHeight = y - fluidHeight;
        let approxWidth = 36; // square this size has same area as circle with r=20
        if (toyHeight > 0)
            return Math.min(toyHeight * approxWidth, approxWidth*2 * approxWidth);
        else return 0;
    }
));

function update(){
    for (const t of allToys){
        t.update();
    }
}
function render(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for (const t of allToys){
        t.render(ctx);
    }
}
function game_loop(){

    update();
    render();

    window.requestAnimationFrame(game_loop);
}

game_loop();