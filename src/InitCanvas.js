import { NodeCanvasElement } from './NodeCanvas.js';
import { BACKGROUND_TYPE_NODE, FIGURE_TYPE, NODE_TYPE } from './constants/index.js';
import { MoveLogic, ScaleLogic } from './ManageCanvas.js';

export class SetupCanvas {
  constructor(idElement) {
    if (!idElement) return console.warn(`ID canvas not transferred`);

    this.canvas = document.getElementById(idElement);
    this.ctx = null;
    this.nodes = [];

    if (!this.canvas) return console.warn(`DOM element with id ${idElement} not found`);

    this._baseSettingsCanvas = {
      width: 800,
      height: 800,
      backgroundColor: '#f3f4f6',
      borderRadius: '24px'
    }
    this._configSizeNode = {
      seatSize: 40,
      gap: 12,
      paddingSector: 40,
    }
    this._initStyle();
    this._initCanvas();

    // Инициализация перемещения и масштабирования по канвасу
    this._initManageLogic();
    // this._initScaleLogic();
  }

  createSeat(x, y, textContent) {
    const seatsLength = this._getAllSeats().length;
    const seatNode = new NodeCanvasElement(
      this.ctx,
      { width: this._configSizeNode.seatSize, height: this._configSizeNode.seatSize, x, y, typeFigure: NODE_TYPE.ARC, radius: 24 },
      { fillStyle: '#fff', hoverColorFill: '#9CA3AF', activeColorFill: '#3390EC', activeAndHoverFill: '#89b8e5' },
      { textContent: textContent, fontSize: 14 },
      { figureType: FIGURE_TYPE.SEAT, id: seatsLength + 1 }
    );
    seatNode.draw();
    this.nodes.push(seatNode);
  }
  createSectorWIthSeats({ rows, cols }) {
    const sectorsLength = this._getAllSectors().length;
    const gapColumn = (cols - 1) * this._configSizeNode.gap;
    const gapRows = (rows - 1) * this._configSizeNode.gap;

    const width = this._configSizeNode.seatSize * cols + gapRows + this._configSizeNode.paddingSector;
    const height = this._configSizeNode.seatSize * rows + gapColumn + this._configSizeNode.paddingSector;

    const sectorNode = new NodeCanvasElement(
      this.ctx, 
      { width, height, typeFigure: NODE_TYPE.ROUND_RECT, typeFill: BACKGROUND_TYPE_NODE.STROKE },
      { strokeStyle: '#fff' },
      { textContent: `Сектор ${sectorsLength + 1}` },
      { figureType: FIGURE_TYPE.SECTOR, id: sectorsLength + 1 }
    );
    sectorNode.draw();
    this.nodes.push(sectorNode);

    this._fillSectorSeats(rows, cols);
  }
  clearCanvas() {
    this.ctx.clearRect(
      -100000000,
      -100000000,
      this.canvas.width * 1000000000,
      this.canvas.height * 1000000000
    );
  }

  // Syntax
  _getAllSeats() {
    return this.nodes.filter((n) => n?.additionalInfo?.figureType === FIGURE_TYPE.SEAT);
  }
  _getAllSectors() {
    return this.nodes.filter((n) => n?.additionalInfo?.figureType === FIGURE_TYPE.SECTOR);
  }
  _redrawAllNodes = () => {
    this.clearCanvas();
    this.nodes.forEach((n) => {
      n.updateCoordsAndRedraw(n.initialCoords[0], n.initialCoords[1]);
    });
  };
  _fillSectorSeats(rows, cols) {
    const { seatSize, gap, paddingSector } = this._configSizeNode;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let col = (seatSize + gap) * r + paddingSector;
        let row = (seatSize + gap) * c + paddingSector;
        this.createSeat(row, col, c + 1);
      }
    }
  }
  _initStyle = () => {
    const { width, height, backgroundColor, borderRadius } = this._baseSettingsCanvas;
    this.canvas.setAttribute('width', width);
    this.canvas.setAttribute('height', height);
    this.canvas.style.backgroundColor = backgroundColor;
    this.canvas.style.borderRadius = borderRadius;
  }
  _initCanvas() {
    this.ctx = this.canvas.getContext('2d');
  }
  _initManageLogic() {
    new MoveLogic(
      this.canvas, 
      // Это системная штука которая нужна при перемещении по канвасу
      (x, y) => {
        this.clearCanvas();
        this.nodes.forEach((n) => {
          n.updateCoordsAndRedraw(x + n.initialCoords[0], y + n.initialCoords[1]);
        });
      },
      // Это системная штука которая нужна при перемещении по канвасу
      () => {
        this.nodes.forEach((n) => {
          n.updateInitialCoords(n.nodeSettings.x, n.nodeSettings.y);
        });
      },
      // Это сработает при наведении на
      (e) => {
        const findNode = this.nodes.filter((n) => n?.nodeSettings?.typeFigure === NODE_TYPE.ARC).find((n) => {
          n.setNodeHoverState(false);
          n.draw();
          const {x: nX, y: nY} = n.nodeSettings;
          
          const [mX, mY] = [e.offsetX, e.offsetY];
          return Math.pow((mX - nX), 2) + Math.pow((mY - nY), 2) <= Math.pow(20, 2);
        })
        if (findNode) {
          findNode.setNodeHoverState(true);
          findNode.draw();
        }
      }
    );
    // Это сработает при клики на место
    this.canvas.addEventListener('click', (e) => {
      const seatsNodes = this.nodes.filter((n) => n?.nodeSettings?.typeFigure === NODE_TYPE.ARC);

      this._cleanAllNodes(seatsNodes);

      const findNode = seatsNodes.find((n) => {
        const {x: nX, y: nY} = n.nodeSettings;
        const [mX, mY] = [e.offsetX, e.offsetY];
        return Math.pow((mX - nX), 2) + Math.pow((mY - nY), 2) <= Math.pow(20, 2);
      });

      const $hint = document.querySelector('.hint');
      if (findNode && !findNode.nodeSettings.isActive) {
        $hint.classList.add('hint_act');
        $hint.style.top = `${findNode.nodeSettings.y}px`;
        $hint.style.left = `${findNode.nodeSettings.x + findNode.nodeSettings.width / 2}px`;
        findNode.setNodeActiveState(true);
        findNode.draw();
      } else $hint.classList.remove('hint_act');
    })
  }
  _initScaleLogic() {
    new ScaleLogic(this.canvas, this.ctx, this._redrawAllNodes);
  }
  _cleanAllNodes(seatsNodes) {
    seatsNodes.forEach((n) => {
      n.setNodeActiveState(false);
      n.setNodeHoverState(false);
      n.draw();
    })
  }
}