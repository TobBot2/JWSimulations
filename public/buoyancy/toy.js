class Toy {
    constructor (x, y, mass, path, areaFunction, mouseoverFunction){
        this.x = x; // center
        this.y = y;

        
        this.mass = mass;
        
        this.velX = 0;
        this.velY = 0;
        
        this.path = path; // render path to draw shape
        this.areaFunction = areaFunction; // input y value, output volume below that line.
        this.mouseoverFunction = mouseoverFunction;

        this.width = this.findWidth();
        this.height = this.findHeight();

        this.color = "hsl(" + Math.random() * 255 + ", 80%, 80%)";

        this.mouseDiff = { x:0, y:0 };

        this.densityMultiplier = 1;
    }
    findWidth(){
        let farthestRight = 0;
        let farthestLeft = 0;
        for (let i = 0; i < this.path.length; i+=2){
            if (this.path[i] > farthestRight) farthestRight = this.path[i];
            else if (this.path[i] < farthestLeft) farthestLeft = this.path[i];
        }
        return farthestRight - farthestLeft;
    }
    findHeight(){
        let farthestDown = 0;
        let farthestUp = 0;
        for (let i = 1; i < this.path.length; i+=2){
            if (this.path[i] > farthestDown) farthestDown = this.path[i];
            else if (this.path[i] < farthestUp) farthestUp = this.path[i];
        }
        return farthestDown - farthestUp;
    }
    updateVels(){
        let forceY = 0;
        if (this.x+this.width/2 < fluidWidth) // only follow buoyancy physics if it gets in the zone- the fluid zone.
            forceY -= fluidDensity.value * gravity * this.areaFunction(this.y); // buoyancy force F = -pgV
        forceY += gravity * this.mass * this.densityMultiplier; // gravity
        
        this.velY += forceY / (this.mass * this.densityMultiplier);

        if (this.x+this.width/2 < fluidWidth){
            this.velY *= fluidFric;
            this.velX *= fluidFric;
        }else{
            this.velY *= airFric;
            this.velX *= airFric;
        }
    }
    displace(){
        return this.areaFunction(this.y) / fluidWidth
    }
    grab(){
        this.velX = -this.x + (mouse.x + this.mouseDiff.x); // new position minus old position
        this.velY = -this.y + (mouse.y + this.mouseDiff.y); //   (vel is change in position)

        this.x = mouse.x + this.mouseDiff.x;
        this.y = mouse.y + this.mouseDiff.y;
    }
    move(){
        this.x += this.velX;
        this.y += this.velY;

        if (this.y+this.height/2 > canvas.height) {
            this.y = canvas.height - this.height/2;
            this.velY *= -.9;
        }
        if (this.x+this.width/2 > canvas.width) {
            this.x = canvas.width - this.width/2;
            this.velX *= -.9;
        }else if (this.x-this.width/2 < 0) {
            this.x = this.width/2;
            this.velX *= -.9;
        }

    }
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
        ctx.strokeStyle = "white";
        ctx.fillStyle = this.color;
        ctx.beginPath();

        ctx.moveTo(this.x + this.path[0],this.y + this.path[1]);
        for (let i = 2, n = this.path.length-1; i < n; i += 2){
            ctx.lineTo(this.x + this.path[i],this.y + this.path[i+1]);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}