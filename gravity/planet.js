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
            let pTimedPos = { x: p.x, y: p.y } // start at current position
            for (let i = 0; i < timeIndex; i++){
                pTimedPos.x += p.futureVels[i].x; // add velocities cumulatively to move forward in time
                pTimedPos.y += p.futureVels[i].y; // if timeIndex == 0, then this doesn't run and pTimedPos is just normal pos
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
    renderVel(ctx){
        if (Math.abs(this.velX/velDampener) + Math.abs(this.velY/velDampener) < 5) return; // don't draw the line if it is too short

        const arrowTip = { x: this.velX/velDampener + this.x, y: this.velY/velDampener + this.y, }
        const arrowHeadMag = (this.velX + this.velY)/velDampener/4 < 10 ? 10 : (this.velX + this.velY)/velDampener/4; // constrain to a min of 10
        const arrowAng = Math.atan2(this.velY, this.velX);

        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.lineWidth = 5;
        
        // main line
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(arrowTip.x, arrowTip.y);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        
        ctx.beginPath();
        // arrow head
        let arrowHead = {
            x: Math.cos(arrowAng + Math.PI/4 + Math.PI) * arrowHeadMag,
            y: Math.sin(arrowAng + Math.PI/4 + Math.PI) * arrowHeadMag,
        }
        ctx.moveTo(arrowTip.x + arrowHead.x, arrowTip.y + arrowHead.y);
        ctx.lineTo(arrowTip.x, arrowTip.y);
        arrowHead = {
            x: Math.cos(arrowAng - Math.PI/4 + Math.PI) * arrowHeadMag,
            y: Math.sin(arrowAng - Math.PI/4 + Math.PI) * arrowHeadMag,
        }
        ctx.lineTo(arrowTip.x + arrowHead.x, arrowTip.y + arrowHead.y);
        
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    renderPath(ctx){
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;

        ctx.moveTo(this.initX + this.futureVels[0].x, this.initY + this.futureVels[0].y);
        let prevPos = { x: this.initX + this.futureVels[0].x, y: this.initY + this.futureVels[0].y };

        for (let i = 1; i < this.futureVels.length-1; i++){
            const step = this.futureVels[i];
            ctx.lineTo(prevPos.x + step.x, prevPos.y + step.y);
            prevPos.x += step.x;
            prevPos.y += step.y;
        }

        ctx.stroke();
        ctx.closePath();
    }
}