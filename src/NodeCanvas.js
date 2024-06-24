import { BACKGROUND_TYPE_NODE, FIGURE_TYPE, NODE_TYPE } from "./constants";

export class NodeCanvasElement {
  // ctx, Object<settingsNode>,  Object<styleNode>, Object<fontSettings>
  constructor(ctx, nodeSettings, nodeStyle, fontSettings, additionalInfo) {
    this.ctx = ctx;
    this.nodeSettings = {
      ...{
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        radius: 24,
        borderRadius: 24,
        typeFill: BACKGROUND_TYPE_NODE.FILL,
        typeFigure: NODE_TYPE.ROUND_RECT,
        isHover: false,
        isActive: false,
      },
      ...nodeSettings,
    };
    this.nodeStyle = {
      ...{
        lineWidth: "2",
        lineFill: "#000",
        strokeStyle: "#000",
        fillStyle: "#000",
        hoverFill: "#ccc",
        hoverColorFill: "#000",
        activeColorFill: "#000",
        activeAndHoverFill: "#000",
      },
      ...nodeStyle,
    };
    this.fontSettings = {
      ...{
        fillStyle: "#9CA3AF",
        fillStyleHover: "#fff",
        textAlign: "center",
        font: "Arial",
        textContent: "",
        fontSize: 13,
      },
      ...fontSettings,
    };
    this.additionalInfo = {
      ...{ figureType: FIGURE_TYPE.SEAT, id: null },
      ...additionalInfo,
    };
    this.initialCoords = [this.nodeSettings.x, this.nodeSettings.y];
  }
  setNodeHoverState(value = false) {
    this.nodeSettings.isHover = value;
  }
  setNodeActiveState(value = false) {
    this.nodeSettings.isActive = value;
  }
  setNodeText(text, x, y) {
    const { fillStyle, textAlign, font, fontSize, fillStyleHover } =
      this.fontSettings;
    this.ctx.beginPath();
    this.ctx.fillStyle =
      this.nodeSettings.isHover || this.nodeSettings.isActive
        ? fillStyleHover
        : fillStyle;
    this.ctx.textAlign = textAlign;
    this.ctx.font = `${fontSize}px ${font}`;
    this.ctx.fillText(text, x, y + Math.floor(fontSize / 2));
    this.ctx.closePath();
  }
  draw() {
    const isTypeFigureValid = Object.values(NODE_TYPE).includes(
      this.nodeSettings.typeFigure
    );
    if (!isTypeFigureValid)
      return console.warn(
        `typeFigure must be ${Object.values(NODE_TYPE)}, now ${
          this.nodeSettings.typeFigure
        }`
      );
    this.nodeSettings.typeFigure === NODE_TYPE.ROUND_RECT
      ? this._drawRoundRect()
      : this._drawRoundArc();
    // this.setNodeCssState(false, false);
  }
  updateCoordsAndRedraw(x, y) {
    this.nodeSettings.x = x;
    this.nodeSettings.y = y;
    this.draw();
  }
  updateInitialCoords(x = this.initialCoords[0], y = this.initialCoords[1]) {
    this.initialCoords = [x, y];
  }

  // Syntax
  _initNodeStyle() {
    let fillStyle = this.nodeStyle.fillStyle;
    if (this.nodeSettings.isHover && this.nodeSettings.isActive)
      fillStyle = this.nodeStyle.activeAndHoverFill;
    else if (this.nodeSettings.isHover)
      fillStyle = this.nodeStyle.hoverColorFill;
    else if (this.nodeSettings.isActive)
      fillStyle = this.nodeStyle.activeColorFill;
    this.ctx.lineFill = this.nodeStyle.lineFill;
    this.ctx.strokeStyle =
      this.nodeSettings.isHover && this.nodeSettings.isActive
        ? this.nodeStyle.activeAndHoverFill
        : this.nodeStyle.strokeStyle;
    this.ctx.fillStyle = fillStyle;
    this.ctx.lineWidth = this.nodeStyle.lineWidth;
  }
  _drawRoundRect() {
    this.ctx.beginPath();
    this._initNodeStyle();
    const { x, y, width, height, borderRadius } = this.nodeSettings;
    this.ctx.roundRect(x, y, width, height, borderRadius);
    this.ctx[this.nodeSettings.typeFill]();

    if (this.fontSettings.textContent)
      this.setNodeText(this.fontSettings.textContent, x + width / 2, y - 22);
    this.ctx.closePath();
  }
  _drawRoundArc() {
    this.ctx.beginPath();
    this._initNodeStyle();
    const { x, y, radius } = this.nodeSettings;
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx[this.nodeSettings.typeFill]();
    if (this.fontSettings.textContent)
      this.setNodeText(this.fontSettings.textContent, x, y);
    this.ctx.closePath();
  }
}
