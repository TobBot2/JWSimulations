class Planet {
    constructor (x, y, mass, radius, color, gConst, allPlanets){
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.radius = radius;
        this.color = color;

        this.velX = 0;
        this.velY = 0;

        this.gConst = gConst;

        this.allPlanets = allPlanets; // reference

        // init variables for resetting
        this.initX = x;
        this.initY = y;
        this.initVelX = 0;
        this.initVelY = 0;
    }
    resetSimulation(){
        this.x = this.initX;
        this.y = this.initY;
        this.velX = this.initVelX;
        this.velY = this.initVelY;
    }
    startSimulation(){
        this.x = this.initX;
        this.y = this.initY;
        this.velX = this.initVelX;
        this.velY = this.initVelY;
    }
    update(){
        // calculate force
        let netForceX = 0;
        let netForceY = 0;

        for (let p of this.allPlanets){
            // f = G(m1)(m2)/(r*r)
            let distanceSqr = (this.x - p.x)*(this.x - p.x) + (this.y - p.y)*(this.y - p.y);
            let forceMag = this.gConst * this.mass * p.mass / distanceSqr;
            let forceAng = Math.atan2(p.y - this.y, p.x - this.x);

            netForceX += forceMag * Math.cos(forceAng);
            netForceY += forceMag * Math.sin(forceAng);
        }

        this.velX += netForceX;
        this.velY += netForceY;

        // change position later (after all velocities have been calculated)

        // no friction because this is in space
    }
    lateUpdate(){
        // change position after all forces have been calculated
        this.x += this.velX;
        this.y += this.velY;
    }
    render(g){
        g.beginPath();
        g.fillStyle = this.color;
        g.strokeStyle = "black";
        g.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        g.fill();
        g.stroke();
        g.closePath();
    }
}