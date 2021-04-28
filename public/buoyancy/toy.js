class Toy {
    constructor (x, y, mass, path, areaFunction){
        this.x = x;
        this.y = y;

        this.mass = mass;

        this.velX = 0;
        this.velY = 0;

        this.path = path; // render path to draw shape
        this.areaFunction = areaFunction; // input y value, output volume below that line.

        this.color = "hsv(" + Math.random() * 255 + ", 175, 200)";
    }
    update(){
        if (this.x < fluidWidth){ // only follow physics if in the fluid zone
            // calculate water line for the buoyancy force
            let displacedArea = this.recursiveDisplace();
            console.log(displacedArea);

            let forceY = 0;
            forceY -= fluidDensity * gravity * displacedArea; // buoyancy force F = -pgV
            forceY += gravity; // gravity
            
            this.velY += forceY / this.mass;

            this.x += this.velX;
            this.y += this.velY;
        }
    }
    recursiveDisplace(prevDisplacement = 0, depth = 3){ // prevDisplacement starts at 0. always.
        // handle recursively because Displacement of liquid relies on calculated submerged area,
        //                        but Calculated submerged area relies on displacement.
        if (depth <= 0) return prevDisplacement;

        let displacementArea = this.areaFunction(this.y);
        fluidHeight += (displacementArea - prevDisplacement) / fluidWidth;

        return this.recursiveDisplace(displacementArea, --depth);
    }
    render(ctx){
        ctx.strokeStyle = "white";
        ctx.fillStyle = this.color;
        ctx.beginPath();

        ctx.moveTo(this.x + this.path[0],this.y + this.path[1]);
        for (let i = 2, n = this.path.length-1; i < n; i++){
            ctx.lineTo(this.x + this.path[i],this.y + this.path[i+1]);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}