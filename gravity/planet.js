/**
 * This file requires the file 'gravity/game.js' to work
 *  The variables 'allPlanets' 'gConst' and 'velDampener' are used
 */

class Planet {
    constructor (x, y, mass, radius, color){
        this.x = x;
        this.y = y;
        this.mass = mass;
        this.radius = radius;
        this.color = color;

        this.velX = 0;
        this.velY = 0;

        this.futureVels = []; // stores velocities of each step (to create path). The first element is the initial velocity

        // init variables for resetting sim
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
    applyInitValues(){
        this.x = this.initX;
        this.y = this.initY;
        this.velX = this.initVelX;
        this.velY = this.initVelY;
    }
    calculateAcc(cPosX, cPosY, timeIndex = 0){ // timeIndex of 0 means the present
        let netForceX = 0;
        let netForceY = 0;

        for (const p of allPlanets){
            if (p == this) continue;

            // get position of p in correct time
            let pTimedPos = { x: p.x, y: p.y } // start calculations from initial position.

            if (timeIndex != 0){
                pTimedPos.x = p.initX;
                pTimedPos.y = p.initY;
                for (let i = 0; i < timeIndex; i++){
                    pTimedPos.x += p.futureVels[i].x; // add velocities cumulatively to move forward in time
                    pTimedPos.y += p.futureVels[i].y; // if timeIndex == 0, then this doesn't run and pTimedPos is just normal pos
                }
            }

            // f = f->G(m1)(m2)/(r*r)
            let distanceSqr = (cPosX - pTimedPos.x)*(cPosX - pTimedPos.x) + (cPosY - pTimedPos.y)*(cPosY - pTimedPos.y); // r*r
            let forceMag = gConst * this.mass * p.mass / distanceSqr; // G(m1)(m2)
            let forceAng = Math.atan2(pTimedPos.y - cPosY, pTimedPos.x - cPosX); // f-> (force direction)

            netForceX += forceMag * Math.cos(forceAng);
            netForceY += forceMag * Math.sin(forceAng);
        }

        return { x: netForceX / this.mass, y: netForceY / this.mass }
    }
    calculateNextVelInPath(){
        let currentPos = { x: this.initX, y: this.initY }

        const pathLength = this.futureVels.length;
        for (let i = 0; i < pathLength; i++){
            currentPos.x += this.futureVels[i].x;
            currentPos.y += this.futureVels[i].y;
        }

        const acc = this.calculateAcc(currentPos.x, currentPos.y, pathLength);

        this.futureVels.push( { x: acc.x + this.futureVels[pathLength-1].x, y: acc.y + this.futureVels[pathLength-1].y} );
    }
    clearVelsInPath(){
        this.futureVels = [ { x: this.initVelX, y: this.initVelY} ]; // first value is the initial velocity
    }
    update(){
        const acc = this.calculateAcc(this.x, this.y);        

        this.velX += acc.x;
        this.velY += acc.y;
    }
    lateUpdate(){
        // change position after all forces have been calculated
        this.x += this.velX;
        this.y += this.velY;
    }
    /*
        =========================
        rendering planet + gizmos
        =========================
    */
    renderArrow(ctx, startX, startY, targX, targY){
        const ang = Math.atan2(targY-startY, targX-startX);
        const headSize = Math.sqrt( (startX-targX)*(startX-targX)+(startY-targY)*(startY-targY) ) / 6;

        let headStart = {
            x: targX - Math.cos(ang) * (headSize * .93), // not sure why I need to multiply the headSize by .93,
            y: targY - Math.sin(ang) * (headSize * .93), //   its too short otherwise
        }

        ctx.globalAlpha = .5;
        // main line
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(headStart.x, headStart.y); // don't go all the way to the end so the opacity doesn't overlap
        ctx.closePath();
        ctx.stroke();
        
        // arrow head
        ctx.beginPath();
        let drawHelper = { // point of reference to draw the ends of the two lines that make up the head
            x: Math.cos(ang + Math.PI/8 + Math.PI) * headSize,
            y: Math.sin(ang + Math.PI/8 + Math.PI) * headSize,
        }
        ctx.moveTo(targX + drawHelper.x, targY + drawHelper.y);
        ctx.lineTo(targX, targY);
        drawHelper = {
            x: Math.cos(ang - Math.PI/8 + Math.PI) * headSize,
            y: Math.sin(ang - Math.PI/8 + Math.PI) * headSize,
        }
        ctx.lineTo(targX + drawHelper.x, targY + drawHelper.y);
        ctx.closePath();
        ctx.fill();

        ctx.globalAlpha = 1;
    }
    render(ctx){
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    renderForces(ctx){
        ctx.strokeStyle = "blue";
        ctx.fillStyle = "blue";
        ctx.lineWidth = 5;
        const acc = this.calculateAcc(this.x, this.y);
        this.renderArrow(ctx, this.x, this.y, this.x + acc.x/velDampener*30, this.y + acc.y/velDampener*30); // *30 to exaggerate it a bit
    }
    renderVel(ctx){
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.lineWidth = 5;
        this.renderArrow(ctx, this.x, this.y, this.x+this.velX/velDampener, this.y+this.velY/velDampener);
    }
    renderPath(ctx, focusedPlanet = null){
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = .5;

        let focusedStep = { x: 0, y: 0};
        if (focusedPlanet != null){
            focusedStep.x -= focusedPlanet.futureVels[0].x - focusedPlanet.x + canvas.width/2 + focusedPlanet.initX - canvas.width/2;
            focusedStep.y -= focusedPlanet.futureVels[0].y - focusedPlanet.y + canvas.height/2 + focusedPlanet.initY - canvas.height/2;
        }

        ctx.moveTo(this.initX + this.futureVels[0].x + focusedStep.x, this.initY + this.futureVels[0].y + focusedStep.y);
        let prevPos = { x: this.initX + this.futureVels[0].x, y: this.initY + this.futureVels[0].y };

        for (let i = 1; i < this.futureVels.length-1; i++){
            const step = this.futureVels[i];

            if (focusedPlanet != null && focusedPlanet.futureVels.length > i){
                focusedStep.x -= focusedPlanet.futureVels[i].x;
                focusedStep.y -= focusedPlanet.futureVels[i].y;
            }

            // FOR DOTTED LINE:
            /*if (i % 60 < 30) // i % x < x/2 (so it is half on and half off) - proportional to speed
                ctx.lineTo(prevPos.x + step.x + focusedStep.x, prevPos.y + step.y + focusedStep.y);
            else 
                ctx.moveTo(prevPos.x + step.x + focusedStep.x, prevPos.y + step.y + focusedStep.y);*/
            // FOR SOLID LINE:
            ctx.lineTo(prevPos.x + step.x + focusedStep.x, prevPos.y + step.y + focusedStep.y);
            
            prevPos.x += step.x;
            prevPos.y += step.y;
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.closePath();
    }
}