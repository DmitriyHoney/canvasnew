import { NodeCanvasElement } from "./NodeCanvas.js";
import {
  BACKGROUND_TYPE_NODE,
  FIGURE_TYPE,
  NODE_TYPE,
} from "./constants/index.js";
import { MoveLogic, ScaleLogic } from "./ManageCanvas.js";

export class SetupCanvas {
  constructor(idElement) {
    if (!idElement) return console.warn(`ID canvas not transferred`);
    this.$canvas = document.getElementById(idElement);
    if (!this.$canvas) return console.warn(`Canvas ${idElement} not found`);

    this.$hint = document.querySelector(".hint");
    if (!this.$hint) return console.warn("Element with class .hint not found");

    this.ctx = null;
    this.nodes = [];

    this._baseSettingsCanvas = {
      width: 1100,
      height: 800,
      backgroundColor: "#f3f4f6",
      borderRadius: "24px",
    };
    this._configSizeNode = {
      seatSize: 40,
      gap: 12,
      paddingSector: 40,
    };
    this.moveSector = null;
    this._initStyle();
    this._initCanvas();

    // Инициализация перемещения и масштабирования по канвасу
    this.moveInstance = this._initManageLogic();
    // this.scaleInstance = this._initScaleLogic();
  }

  createSeat(parent, x, y, textContent) {
    const seatsLength = this._getAllSeats().length;
    const seatNode = new NodeCanvasElement(
      this.ctx,
      {
        width: this._configSizeNode.seatSize,
        height: this._configSizeNode.seatSize,
        x,
        y,
        typeFigure: NODE_TYPE.ARC,
        radius: 20,
      },
      {
        fillStyle: "#fff",
        hoverColorFill: "#9CA3AF",
        activeColorFill: "#3390EC",
        activeAndHoverFill: "#89b8e5",
      },
      { textContent: textContent, fontSize: 14 },
      { figureType: FIGURE_TYPE.SEAT, id: seatsLength + 1, parent }
    );
    seatNode.draw();
    this.nodes.push(seatNode);
  }
  createSeatNumberRow(parent, x, y, textContent) {
    const seatsLength = this._getAllHelperSeats().length;
    const seatNode = new NodeCanvasElement(
      this.ctx,
      {
        width: this._configSizeNode.seatSize,
        height: this._configSizeNode.seatSize,
        x,
        y,
        typeFigure: NODE_TYPE.ARC,
        radius: 20,
      },
      {
        fillStyle: "transparent",
        hoverColorFill: "transparent",
        activeColorFill: "transparent",
        activeAndHoverFill: "transparent",
      },
      { textContent: textContent, fontSize: 14 },
      { figureType: FIGURE_TYPE.HELPER_SEAT, id: seatsLength + 1, parent }
    );
    seatNode.draw();
    this.nodes.push(seatNode);
  }
  createSectorWithSeats({ rows, cols }) {
    const addAdditionalCols = () => (cols += 2); // for show number rows left and right
    addAdditionalCols();

    const sectorsLength = this._getAllSectors().length;

    const width =
      this._configSizeNode.paddingSector * 2 +
      this._configSizeNode.seatSize * cols +
      this._configSizeNode.gap * (cols - 1);
    const height =
      this._configSizeNode.paddingSector * 2 +
      this._configSizeNode.seatSize * rows +
      this._configSizeNode.gap * (rows - 1);

    const sectorNode = new NodeCanvasElement(
      this.ctx,
      {
        width,
        height,
        typeFigure: NODE_TYPE.ROUND_RECT,
        typeFill: BACKGROUND_TYPE_NODE.STROKE,
      },
      { strokeStyle: "#fff" },
      { textContent: `Сектор ${sectorsLength + 1}` },
      { figureType: FIGURE_TYPE.SECTOR, id: sectorsLength + 1 }
    );
    sectorNode.draw();
    this.nodes.push(sectorNode);

    this._fillSectorSeats(sectorNode, rows, cols);
  }
  clearCanvas() {
    this.ctx.clearRect(
      -100000000,
      -100000000,
      this.$canvas.width * 1000000000,
      this.$canvas.height * 1000000000
    );
  }

  // Syntax
  _redrawAll() {
    this.clearCanvas();
    this.nodes.forEach((n) => n.draw());
  }
  _getAllSectorChildNodes(parentId) {
    return this.nodes.filter(
      (n) => n.additionalInfo?.parent?.additionalInfo?.id === parentId
    );
  }
  _getAllSeats() {
    return this.nodes.filter(
      (n) => n?.additionalInfo?.figureType === FIGURE_TYPE.SEAT
    );
  }
  _getAllHelperSeats() {
    return this.nodes.filter(
      (n) => n?.additionalInfo?.figureType === FIGURE_TYPE.HELPER_SEAT
    );
  }
  _getAllSectors() {
    return this.nodes.filter(
      (n) => n?.additionalInfo?.figureType === FIGURE_TYPE.SECTOR
    );
  }
  _redrawAllNodes = () => {
    this.clearCanvas();
    this.nodes.forEach((n) => {
      n.updateCoordsAndRedraw(n.initialCoords[0], n.initialCoords[1]);
    });
  };
  _fillSectorSeats(parent, rows, cols) {
    const { seatSize, gap, paddingSector } = this._configSizeNode;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let col = (seatSize + gap) * r + paddingSector + seatSize / 2;
        let row = (seatSize + gap) * c + paddingSector + seatSize / 2;
        const isFirstOrLastPositionInRow = [0, cols - 1].includes(c);
        isFirstOrLastPositionInRow
          ? this.createSeatNumberRow(parent, row, col, r + 1)
          : this.createSeat(parent, row, col, c);
      }
    }
  }
  _initStyle = () => {
    const { width, height, backgroundColor, borderRadius } =
      this._baseSettingsCanvas;
    this.$canvas.setAttribute("width", width);
    this.$canvas.setAttribute("height", height);
    this.$canvas.style.backgroundColor = backgroundColor;
    this.$canvas.style.borderRadius = borderRadius;
  };
  _initCanvas() {
    this.ctx = this.$canvas.getContext("2d");
  }
  _pointRectangleIntersection(point, rectangle) {
    const { x: clickX, y: clickY } = point;
    const { width, height, x: startRectX, y: startRectY } = rectangle;
    const endRectX = startRectX + width;
    const endRectY = startRectY + height;
    return (
      startRectX <= clickX &&
      clickX <= endRectX &&
      startRectY <= clickY &&
      clickY <= endRectY
    );
  }
  _initManageLogic() {
    return (
      new MoveLogic(
        this.$canvas,
        // Это системная штука которая нужна при перемещении по канвасу
        (x, y, isEditMode, startPoint, isMouseMoveAct) => {
          console.log(this.moveInstance);
          if (!isMouseMoveAct) this.moveSector = false;
          if (isEditMode) {
            const [clickX, clickY] = startPoint;
            console.log(this.moveSector?.additionalInfo?.id);
            const sectors = this._getAllSectors();
            this.moveSector = this.moveSector
              ? this.moveSector
              : sectors.find((n) => {
                  const isIntersect = this._pointRectangleIntersection(
                    { x: clickX, y: clickY },
                    { ...n.nodeSettings }
                  );
                  return isIntersect;
                });
            if (this.moveSector) {
              this.moveSector.updateCoordsAndRedraw(
                x + this.moveSector.initialCoords[0],
                y + this.moveSector.initialCoords[1]
              );
              this._getAllSectorChildNodes(
                this.moveSector.additionalInfo.id
              ).forEach((n) => {
                n.updateCoordsAndRedraw(
                  x + n.initialCoords[0],
                  y + n.initialCoords[1]
                );
              });
            }
          } else {
            this.moveSector = null;
            this.clearCanvas();
            this.nodes.forEach((n) => {
              n.updateCoordsAndRedraw(
                x + n.initialCoords[0],
                y + n.initialCoords[1]
              );
              if (n.nodeSettings.isActive) {
                this._updateHintPosition(
                  n.nodeSettings.y - n.nodeSettings.width,
                  n.nodeSettings.x - n.nodeSettings.radius / 2
                );
              }
            });
          }
        },
        // Это системная штука которая нужна при перемещении по канвасу
        () => {
          this.nodes.forEach((n) => {
            n.updateInitialCoords(n.nodeSettings.x, n.nodeSettings.y);
          });
        },
        // Это сработает при наведении на место
        (e) => {
          this._redrawAll();
          const findNode = this._getAllSeats().find((n) => {
            n.setNodeHoverState(false);
            n.draw();
            const { x: nX, y: nY } = n.nodeSettings;
            const [mX, mY] = [e.offsetX, e.offsetY];
            // const scale = this.scaleInstance.scale;
            return (
              Math.pow(mX - nX, 2) + Math.pow(mY - nY, 2) < Math.pow(20, 2)
            );
          });
          if (findNode) {
            // console.log(e.offsetX, e.offsetY);
            const [mX, mY] = [e.offsetX, e.offsetY];
            const { x: nX, y: nY } = findNode.nodeSettings;
            window.t = { mX, mY, nX, nY };

            findNode.setNodeHoverState(true);
            findNode.draw();
          }
        },
        () => {
          console.log(111);
          this.moveSector = null;
        }
      ),
      // Это сработает при клики на место
      this.$canvas.addEventListener("click", (e) => {
        const seatsNodes = this._getAllSeats();
        this._redrawAll();
        this._cleanAllNodes(seatsNodes);

        const findNode = seatsNodes.find((n) => {
          const { x: nX, y: nY } = n.nodeSettings;
          const [mX, mY] = [e.offsetX, e.offsetY];
          return Math.pow(mX - nX, 2) + Math.pow(mY - nY, 2) <= Math.pow(20, 2);
        });

        if (findNode && !findNode.nodeSettings.isActive) {
          this.$hint.classList.add("hint_act");
          const top = findNode.nodeSettings.y - findNode.nodeSettings.width;
          const left =
            findNode.nodeSettings.x - findNode.nodeSettings.radius / 2;
          this._updateHintPosition(top, left);
          findNode.setNodeActiveState(true);
          findNode.draw();
        } else this.$hint.classList.remove("hint_act");
      })
    );
  }
  _updateHintPosition(top, left) {
    if (!this.$hint) return console.warn("Element with class .hint not found");
    this.$hint.style.top = `${top}px`;
    this.$hint.style.left = `${left}px`;
  }
  _initScaleLogic() {
    return new ScaleLogic(this.$canvas, this.ctx, this._redrawAllNodes);
  }
  _cleanAllNodes(seatsNodes) {
    seatsNodes.forEach((n) => {
      n.setNodeActiveState(false);
      n.setNodeHoverState(false);
      n.draw();
    });
  }
}
