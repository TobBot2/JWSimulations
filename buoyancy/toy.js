class Toy {
    constructor (x, y, mass, path, areaFunction){
        this.x = x;
        this.y = y;

        this.mass = mass;

        this.velX = 0;
        this.velY = 0;

        this.path = path; // render path to draw shape
        this.areaFunction = areaFunction; // input y value, output volume below that line.
    }
    update(){
        if (this.x > fluidWidth){ // only follow physics if in the fluid zone
            // calculate water line for the buoyancy force
            this.recursiveDisplace();

            let forceY;

            forceY -= density * gravity * this.areaFunction(this.y); // buoyancy force
            forceY += gravity; // gravity
            
            this.velY += forceY / this.mass;

            this.x += this.velX;
            this.y += this.velY;
            
        }
    }
    recursiveDisplace(prevDisplacement = 0, depth = 3){ // prevDisplacement starts at 0. always.
        // handle recursively because Displacement of liquid relies on calculated submerged area, 
        //                        but Calculated submerged area relies on displacement. 
        if (depth <= 0) return;

        let displacementArea = this.areaFunction(this.y);
        fluidHeight += (displacementArea - prevDisplacement) / fluidWidth;

        this.recursiveDisplace(displacementArea, depth--);
    }
}