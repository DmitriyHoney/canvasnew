export class MoveLogic {
    constructor(canvas, redrawCb, updateInitialCoordsCb, mouseMoveLogic) {
      this.startPointMove = null;
      this.redrawCb = redrawCb;
      this.updateInitialCoordsCb = updateInitialCoordsCb;
        
      canvas.addEventListener("mousemove", mouseMoveLogic);
      canvas.addEventListener("mousedown", this.mouseDownCanvas);
      canvas.addEventListener("mouseup", () => {
        this.updateInitialCoordsCb();
        canvas.removeEventListener("mousemove", this.mouseMoveCanvas);
        this.startPointMove = null;
      });
    }
    mouseDownCanvas = (e) => {
      this.startPointMove = [e.offsetX, e.offsetY];
      canvas.addEventListener("mousemove", this.mouseMoveCanvas);
    };
    mouseMoveCanvas = (e) => {
      const newX = e.offsetX - this.startPointMove[0];
      const newY = e.offsetY - this.startPointMove[1];
  
      this.redrawCb(newX, newY);
    };
}
  
export  class ScaleLogic {
    constructor(canvas, ctx, redrawCb) {
      this.ctx = ctx;
      this.canvas = canvas;
      this.scale = 1;
  
      this.canvas.addEventListener("dblclick", (e) => {
        e.ctrlKey ? this.ctx.scale(0.8, 0.8, this.canvas.width / 2, this.canvas.height / 2) : this.ctx.scale(1.2, 1.2, this.canvas.width / 2, this.canvas.height / 2);
        if (!e.ctrlKey) {
          this.scale += 0.2;
          const widthNew = e.offsetX / 2;
          const heightNew = e.offsetY / 2;
          this.ctx.setTransform(this.scale,0,0,this.scale,-(this.scale-1)*widthNew,-(this.scale-1)*heightNew);
        } else {
          this.scale -= 0.2;
          const widthNew = e.offsetX / 2;
          const heightNew = e.offsetY / 2;
          this.ctx.setTransform(this.scale,0,0,this.scale,-(this.scale-1)*widthNew,-(this.scale-1)*heightNew);
        }
        redrawCb();
      });
    }
}