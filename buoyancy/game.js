const canvas = document.getElementById("gameCanvas");

const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const fluidRestingHeight = .5 * canvas.height;
let fluidHeight = fluidRestingHeight;
const fluidWidth = canvas.width - 100; // no physics beyond this point

const gravity = 1;

const allToys = [];

let circlePath = (resolution, r) => { // generate circle path with 'resolution' number of points and radius of 'r'
    let path = [];
    for (let i = resolution; i >= 0; i--)
        path.push(Math.cos(i/resoultion * Math.PI*2) * r, Math.sin(i/resolution * Math.PI*2) * r);
    return path;
}

allToys.push(new Toy( // Simple rectangle
    fluidWidth + 25, canvas.height - 50, 1,
    [-20,-10, 20,-10, 20,10, -20,10],
    y => {
        let toyHeight = y - fluidHeight;
        if (toyHeight > 0)
            return Math.min(toyHeight * 20, 40 * 20);
        else
            return 0;
    }
));

allToys.push(new Toy(
    fluidWidth +75, canvas.height -50, 1,
    circlePath(36, 20),
    y => {
        let toyHeight = y - fluidHeight;
        if (toyHeight > 0){
            
        }else return 0;
    }
));

function update(){

}
function render(){

}
function game_loop(){

    update();
    render();

    window.requestAnimationFrame(game_loop);
}