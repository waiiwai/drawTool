let dCanvas;
let vCanvas;
let drawSelect;
let paletteSelect;
let toolSelect;

let dcontext;
let vcontext;
let v2context;
let bcontext;
let svcontext;
let svSelect;
let huecontext;
let hueSelect;
let selectedColorContext;
let paletteContext;
let paletteBackContext;

let posX = 0;
let posY = 0;

const cellWidth = 20;
const cells = 32;
const viewCellWidth = 2;
const lineWidth = 1;

const colorWidth = 40;
const colorHeight = 20;
const colorLineWidth = 2;

let mode = -1;
let paletteNo = 0;
let toolNo = "pen";
let colors = ["ffffff", "c0c0c0", "808080", "000000", "ff0000", "800000", "ffff00", "808000", "00ff00", "008000", "00f0f0", "008080", "0000ff", "000080", "ff00ff", "800080"];

let field = new Array(cells);
for (let i = 0; i < cells; i++) field[i] = new Array(cells).fill(-1);

function md(e){
  let {x, y} = getCell(e);
  if(0 <= x && x < cells && 0 <= y && y < cells){
    mode = 1;
    fill(x, y);
  }
  posX = x;
  posY = y;
  showCursor();
}

function mv(e){
  if (mode == -1) return;
  let {x, y} = getCell(e);
  if(0 <= x && x < cells && 0 <= y && y < cells){
    fill(x, y);
    posX = x;
    posY = y;
  }
  showCursor();
}

function mu(e){
  mode = -1;
  let {x, y} = getCell(e);
  showCursor();
}

function hideCursor(e){
  mode = 1;
  showCursor();
}
function showCursor() {
  if (mode == 1) {
    drawSelect.style.visibility = 'hidden';
  } else {
    if (0 <= posX && posX < cells && 0 <= posY && posY < cells) {
      drawSelect.style.visibility = 'visible';
      drawSelect.style.left = posX * cellWidth;
      drawSelect.style.top  = posY * cellWidth;
    }
  }
}

function getCell(e) {
  let x;
  let y;
  if (e.offsetX) {
    x = Math.floor(e.offsetX/cellWidth);
    y = Math.floor(e.offsetY/cellWidth);
  } else if (e.touches && e.touches[0].clientX) {
    x = Math.floor((e.touches[0].clientX-dCanvas.getBoundingClientRect().left)/cellWidth);
    y = Math.floor((e.touches[0].clientY-dCanvas.getBoundingClientRect().top)/cellWidth);
  }
  if (x < 0 || cells <= x || y < 0 || cells <= y ) mode = -1;
  return {x: x, y: y}
}

function fill(x,y) {
  if (mode == -1) return;
  let posX = cellWidth * x;
  let posY = cellWidth * y;
  const color = "#" + colors[paletteNo];
  dcontext.globalCompositeOperation = "source-over";
  dcontext.fillStyle = color;
  vcontext.globalCompositeOperation = "source-over";
  vcontext.fillStyle = color;
  v2context.globalCompositeOperation = "source-over";
  v2context.fillStyle = color;
  if (toolNo == "pen" && field[y][x] != paletteNo) {
      field[y][x] = paletteNo;
      dcontext.fillRect(posX+lineWidth, posY+lineWidth, cellWidth-lineWidth*2, cellWidth-lineWidth*2);
      vcontext.fillRect(x*viewCellWidth, y*viewCellWidth, viewCellWidth, viewCellWidth);
      v2context.fillRect(x, y, 1, 1);
    } else if (toolNo == "eracer" && field[y][x] != -1){
      field[y][x] = -1;
      dcontext.globalCompositeOperation = "xor";
      dcontext.fillRect(posX+lineWidth, posY+lineWidth, cellWidth-lineWidth*2, cellWidth-lineWidth*2);
      vcontext.globalCompositeOperation = "xor";
      vcontext.fillRect(x*viewCellWidth, y*viewCellWidth, viewCellWidth, viewCellWidth);
      v2context.globalCompositeOperation = "xor";
      v2context.fillRect(x, y, 1, 1);
    } else if (toolNo == "bucket" && field[y][x] != paletteNo){
      let target = getArea(x, y);
      for (let i = 0; i < target.length; i++) {
        field[target[i].y][target[i].x] = paletteNo;
        dcontext.fillRect(target[i].x*cellWidth+lineWidth, target[i].y*cellWidth+lineWidth, cellWidth-lineWidth*2, cellWidth-lineWidth*2);
        vcontext.fillRect(target[i].x*viewCellWidth, target[i].y*viewCellWidth, viewCellWidth, viewCellWidth);
        v2context.fillRect(target[i].x, target[i].y, 1, 1);
      }
      mode = -1;
    }
}

function getArea(x, y) {
  const color = field[y][x];
  const result = new Array();
  const q = new Array();
  let pos = new Object();
  pos.x = x;
  pos.y = y;
  q.push(pos);
  while (q.length > 0) {
    const now = q.shift();
    if (field[now.y][now.x] == color) {
      if (!result.find(p=> (p.x == now.x && p.y == now.y))) result.push(now);
      if (now.x > 0) {
        pos = new Object();
        pos.x = now.x-1;
        pos.y = now.y;
        if (field[pos.y][pos.x] == color && 
          !q.find((p)=> (p.x == pos.x && p.y == pos.y)) && 
          !result.find((p)=> (p.x == pos.x && p.y == pos.y))) q.push(pos);
      }
      if (now.x < cells-1) {
        pos = new Object();
        pos.x = now.x+1;
        pos.y = now.y;
        if (field[pos.y][pos.x] == color && 
          !q.find((p)=> (p.x == pos.x && p.y == pos.y)) && 
          !result.find((p)=> (p.x == pos.x && p.y == pos.y))) q.push(pos);
      }
      if (now.y > 0) {
        pos = new Object();
        pos.x = now.x;
        pos.y = now.y-1;
        if (field[pos.y][pos.x] == color && 
          !q.find((p)=> (p.x == pos.x && p.y == pos.y)) && 
          !result.find((p)=> (p.x == pos.x && p.y == pos.y))) q.push(pos);
      }
      if (now.y < cells-1) {
        pos = new Object();
        pos.x = now.x;
        pos.y = now.y+1;
        if (field[pos.y][pos.x] == color && 
          !q.find((p)=> (p.x == pos.x && p.y == pos.y)) && 
          !result.find((p)=> (p.x == pos.x && p.y == pos.y))) q.push(pos);
      }
    }
  }
  return result;
}


function drawBack(cvs, ctx) {
  ctx.fillStyle = "rgba(0,0,0, 0.25)";
  const dotSize = 5;
  ctx.beginPath();
  for (let y = 0; y < cvs.height; y+=dotSize) {
    for (let x = 0; x < cvs.width; x+=dotSize) {
      if ((x/dotSize + y/dotSize)%2 == 0) ctx.fillRect(x, y, dotSize, dotSize);
    }
  }
}

function drawLine(size, cvs, ctx, bCvs, bCtx) {
  cvs.height = cells * cellWidth;
  cvs.width = cells * cellWidth;
  bCvs.height = cells * cellWidth;
  bCvs.width = cells * cellWidth;
  drawBack(bCvs, bCtx);

  const strokeStryle = "rgba(0,0,0, 0.25)";

  ctx.beginPath();
  for (let i = 0; i <= cells; i++) {
    ctx.moveTo(0,    cellWidth * i);
    ctx.lineTo(size, cellWidth * i);
    ctx.moveTo(cellWidth * i, 0);
    ctx.lineTo(cellWidth * i, size);
  }
  for (let i = 1; i < 4; i++) {
    ctx.moveTo(0,    size/4 * i);
    ctx.lineTo(size, size/4 * i);
    ctx.moveTo(size/4 * i, 0);
    ctx.lineTo(size/4 * i, size);
  }
  ctx.moveTo(0,    size/2);
  ctx.lineTo(size, size/2);
  ctx.moveTo(size/2, 0);
  ctx.lineTo(size/2, size);
  ctx.strokeStyle = strokeStryle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

let selectedH = 0;
let selectedS = 100;
let selectedV = 100;


function hueCanvasClicked(e) {
  hueChange(e.offsetX, e.offsetY);
}
function hueDivClicked(e) {
  hueChange(hueSelect.style.left.replace("px","")*1 + e.offsetX, hueSelect.style.top.replace("px","")*1 + e.offsetY);
}
function hueChange(x, y) {
  let deg = Math.atan2(x-100, -1*(y-100))* 180 / Math.PI;
  if (deg < 0) deg += 360;
  selectedH = Math.floor(deg);
  hueDispRefresh();
  colorChange();
}
function hueDispRefresh() {
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      svcontext.beginPath();
      svcontext.rect(i, 99-j, 1, 1);
      let rgb = hsv2rgb(selectedH, i, j);
      svcontext.fillStyle = "rgb(" + rgb.r + "," + rgb.g +"," + rgb.b + ")";
      svcontext.fill();
    }
  }
  showColorSelectStat();
}

function svCanvasClicked(e) {
  svChange(e.offsetX, e.offsetY);
}
function svDivClicked(e) {
  let x = Math.min(100, svSelect.style.left.replace("px","")*1 + e.offsetX);
  if (x < 0) x = 0;
  let y = Math.min(100, svSelect.style.top.replace("px","")*1 + e.offsetY);
  if (y < 0) y = 0;
  svChange(x, y);
}
function svChange(x, y) {
  selectedS = x;
  selectedV = 100 - y;
  showColorSelectStat();
  colorChange();
}


function rgbhexChange() {
  const rgbHex = document.getElementById('rgb_hex');
  colors[paletteNo] = rgbHex.value.replace("#", "");
  paletteSelected();
  hueDispRefresh();
  showColorSelectStat();
  colorChange();
}

function rgbChange() {
  let r = document.getElementById('rgb_r').value;
  let g = document.getElementById('rgb_g').value;
  let b = document.getElementById('rgb_b').value;
  colors[paletteNo] = ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2);
  const hsv = rgb2hsv(r, g, b);
  if (hsv.s != 0) selectedH = hsv.h;
  selectedS = hsv.s;
  selectedV = hsv.v;
  showColorSelectStat();
  colorChange();
}

function hsvChange() {
  selectedH = document.getElementById('hsv_h').value;
  selectedS = document.getElementById('hsv_s').value;
  selectedV = document.getElementById('hsv_v').value;
  showColorSelectStat();
  colorChange();
}

function paletteSelected() {
  let color = colors[paletteNo];
  let r = parseInt(color.substring(0,2), 16);
  let g = parseInt(color.substring(2,4), 16);
  let b = parseInt(color.substring(4,6), 16);
  const hsv = rgb2hsv(r, g, b);
  if (hsv.s != 0) selectedH = hsv.h;
  selectedS = hsv.s;
  selectedV = hsv.v;
}

function showColorSelectStat() {
  document.getElementById('hsv_h').value = selectedH;
  document.getElementById('hsv_s').value = selectedS;
  document.getElementById('hsv_v').value = selectedV;
  const rgb = hsv2rgb(selectedH, selectedS, selectedV);
  document.getElementById('rgb_r').value = rgb.r;
  document.getElementById('rgb_g').value = rgb.g;
  document.getElementById('rgb_b').value = rgb.b;
  document.getElementById('rgb_hex').value = "#" + ("0" + rgb.r.toString(16)).slice(-2) + ("0" + rgb.g.toString(16)).slice(-2) + ("0" + rgb.b.toString(16)).slice(-2);

  selectedColorContext.beginPath();
  selectedColorContext.rect(0, 0, 200, 200);
  selectedColorContext.fillStyle = "rgb(" + rgb.r + "," + rgb.g +"," + rgb.b + ")";
  selectedColorContext.fill();

  const hX = Math.cos((selectedH-90) * Math.PI / 180) * 90 + 100;
  const hY = Math.sin((selectedH-90) * Math.PI / 180) * 90 + 100;
  hueSelect.style.left = hX - 10;
  hueSelect.style.top = hY - 10;
  svSelect.style.left = selectedS - 5;
  svSelect.style.top = 100-selectedV - 5;

  if (toolNo != 1) {
    const top = Math.floor(paletteNo / 8) * colorHeight;
    const left = (paletteNo % 8) * colorWidth;
    colors[paletteNo] = ("0" + rgb.r.toString(16)).slice(-2) + ("0" + rgb.g.toString(16)).slice(-2) + ("0" + rgb.b.toString(16)).slice(-2);
    paletteContext.fillStyle = "rgb(" + rgb.r + "," + rgb.g +"," + rgb.b + ")";
    paletteContext.fillRect(left+2, top+2, colorWidth-2, colorHeight-2);
  }
}

function colorChange() {
  const color = "#" + colors[paletteNo];
  dcontext.globalCompositeOperation = "source-over";
  dcontext.fillStyle = color;
  vcontext.globalCompositeOperation = "source-over";
  vcontext.fillStyle = color;
  v2context.globalCompositeOperation = "source-over";
  v2context.fillStyle = color;
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      if (field[y][x] == paletteNo) {
        dcontext.fillRect(cellWidth*x+lineWidth, cellWidth*y+lineWidth, cellWidth-lineWidth*2, cellWidth-lineWidth*2);
        vcontext.fillRect(x*viewCellWidth, y*viewCellWidth, viewCellWidth, viewCellWidth);
        v2context.fillRect(x, y, 1, 1);
      }
    }
  }
}

function init() {
  const bCanvas = document.getElementById('bgCanvas');
  bcontext = bCanvas.getContext("2d");
  dCanvas = document.getElementById('drawCanvas');
  dcontext = dCanvas.getContext("2d");
  drawLine(cells * cellWidth, dCanvas, dcontext, bCanvas, bcontext);

  drawSelect = document.getElementById('drawSelect');
  let drawCtx = drawSelect.getContext("2d")
  drawCtx.lineWidth = 2;
  drawCtx.beginPath();
  drawCtx.strokeStyle = "rgb(255,255,255)";
  drawCtx.strokeRect(1, 1, cellWidth-1, cellWidth-1);
  drawCtx.stroke();
  drawCtx.lineWidth = 2;
  drawCtx.beginPath();
  drawCtx.strokeStyle = "rgb(0,0,0)";
  drawCtx.strokeRect(3, 3, cellWidth-5, cellWidth-5);
  drawCtx.stroke();


  const vbCanvas = document.getElementById('viewBgCanvas');
  vbCanvas.height = cells * viewCellWidth;
  vbCanvas.width = cells * viewCellWidth;
  const vbcontext = vbCanvas.getContext("2d");
  drawBack(vbCanvas, vbcontext);
  vCanvas = document.getElementById('viewCanvas');
  vCanvas.height = cells * viewCellWidth;
  vCanvas.width = cells * viewCellWidth;
  vcontext = vCanvas.getContext("2d") ;

  const v2bCanvas = document.getElementById('viewBgCanvas2');
  v2bCanvas.height = cells;
  v2bCanvas.width = cells;
  const v2bcontext = v2bCanvas.getContext("2d") ;
  drawBack(v2bCanvas, v2bcontext);
  const v2Canvas = document.getElementById('viewCanvas2');
  v2Canvas.height = cells * viewCellWidth;
  v2Canvas.width = cells * viewCellWidth;
  v2context = v2Canvas.getContext("2d") ;

  dCanvas.addEventListener('mousedown', md, false);
  dCanvas.addEventListener('mousemove', mv, false);
  dCanvas.addEventListener('mouseup', mu, false);
  dCanvas.addEventListener('mouseleave', mu, false);
  drawSelect.addEventListener('mousedown', hideCursor, false);

  const hueCanvas = document.getElementById('hueCanvas');
  huecontext = hueCanvas.getContext("2d");
  huecontext.lineWidth = 20;
  const deg90 = Math.PI/2*3;
  for (let i = -1; i < 360; i++) {
    huecontext.beginPath();
    huecontext.arc(100, 100, 90, deg90 + i * Math.PI/180, deg90 + (i+1) * Math.PI/180, false);
    huecontext.strokeStyle = "hsl(" + i + ",100%,50%)";
    huecontext.stroke();
  }
  hueCanvas.addEventListener('click', hueCanvasClicked, false);
  hueSelect = document.getElementById('hueSelect');
  let hueCtx = hueSelect.getContext("2d")
  hueCtx.lineWidth = 2
  hueCtx.beginPath();
  hueCtx.strokeStyle = "rgb(0,0,0)";
  hueCtx.arc(10, 10, 9, 0, 2*Math.PI);
  hueCtx.stroke();
  hueCtx.beginPath();
  hueCtx.strokeStyle = "rgb(255,255,255)";
  hueCtx.arc(10, 10, 7, 0, 2*Math.PI);
  hueCtx.stroke();
  hueSelect.addEventListener('click', hueDivClicked, false);

  const svCanvas = document.getElementById('svCanvas');
  svcontext = svCanvas.getContext("2d") ;
  for (let i = 0; i < 100; i++) {
    for (let j = 0; j < 100; j++) {
      svcontext.beginPath();
      svcontext.rect(i, 99-j, 1, 1);
      let rgb = hsv2rgb(selectedH, i, j);
      svcontext.fillStyle = "rgb(" + rgb.r + "," + rgb.g +"," + rgb.b + ")";
      svcontext.fill();
    }
  }
  svCanvas.addEventListener('click', svCanvasClicked, false);
  svSelect = document.getElementById('svSelect');
  let svCtx = svSelect.getContext("2d")
  svCtx.lineWidth = 2
  svCtx.beginPath();
  svCtx.strokeStyle = "rgb(0,0,0)";
  svCtx.arc(5, 5, 5, 0, 2*Math.PI);
  svCtx.stroke();
  svCtx.beginPath();
  svCtx.strokeStyle = "rgb(255,255,255)";
  svCtx.arc(5, 5, 3, 0, 2*Math.PI);
  svCtx.stroke();
  svSelect.addEventListener('click', svDivClicked, false);

  selectedColorContext = document.getElementById('selectedColorCanvas').getContext("2d");

  const paletteCanvas = document.getElementById('paletteCanvas');
  paletteContext = paletteCanvas.getContext("2d") ;
  const paletteBackCanvas = document.getElementById('paletteBackCanvas');
  const paletteBackContext = paletteBackCanvas.getContext("2d") ;
  drawPalette(paletteCanvas, paletteContext, paletteBackCanvas, paletteBackContext);

  paletteSelect = document.getElementById('paletteSelect');
  let paletteCtx = paletteSelect.getContext("2d")
  paletteCtx.lineWidth = 2;
  paletteCtx.beginPath();
  paletteCtx.strokeStyle = "rgb(255,0,0)";
  paletteCtx.strokeRect(1, 1, colorWidth-1, colorHeight-1);
  paletteCtx.stroke();
  paletteCtx.lineWidth = 2;
  paletteCtx.beginPath();
  paletteCtx.strokeStyle = "rgb(0,0,255)";
  paletteCtx.strokeRect(3, 3, colorWidth-5, colorHeight-5);
  paletteCtx.stroke();
  paletteCanvas.addEventListener('click', paletteClicked, false);
  paletteSelected();
  hueDispRefresh();
  showColorSelectStat();


  toolSelect = document.getElementById('toolSelect');
  let toolCtx = toolSelect.getContext("2d")
  toolCtx.lineWidth = 2;
  toolCtx.beginPath();
  toolCtx.strokeStyle = "rgb(255,0,0)";
  toolCtx.strokeRect(1, 1, 30, 30);
  toolCtx.stroke();
  toolCtx.lineWidth = 2;
  toolCtx.beginPath();
  toolCtx.strokeStyle = "rgb(0,0,255)";
  toolCtx.strokeRect(3, 3, 26, 26);
  toolCtx.stroke();
  toolSelect.addEventListener('click', eracerClicked, false);

  document.getElementById('penIcon').addEventListener('click', penClicked, false);
  document.getElementById('eracerIcon').addEventListener('click', eracerClicked, false);
  document.getElementById('bucketIcon').addEventListener('click', bucketClicked, false);

  document.getElementById('rgb_hex').addEventListener('change', rgbhexChange, false);
  document.getElementById('rgb_r').addEventListener('change', rgbChange, false);
  document.getElementById('rgb_g').addEventListener('change', rgbChange, false);
  document.getElementById('rgb_b').addEventListener('change', rgbChange, false);
  document.getElementById('hsv_h').addEventListener('change', hsvChange, false);
  document.getElementById('hsv_s').addEventListener('change', hsvChange, false);
  document.getElementById('hsv_v').addEventListener('change', hsvChange, false);
  document.getElementsByTagName('body')[0].addEventListener('keydown', keydown, false);
  
}

function drawPalette(canvas, ctx, bCvs, bctx) {
  canvas.height = colorHeight * 2 + colorLineWidth;
  canvas.width = colorWidth * 8 + colorLineWidth;
  bCvs.height = colorHeight * 2 + colorLineWidth;
  bCvs.width = colorWidth * 8 + colorLineWidth;
  drawBack(bCvs, bctx);

  ctx.beginPath();
  ctx.strokeStyle = "rgba(0,0,0,1)";
  ctx.lineWidth = colorLineWidth;
  for (let i = 0; i <= 8; i++) {
    ctx.moveTo(colorWidth * i + colorLineWidth/2, 0);
    ctx.lineTo(colorWidth * i + colorLineWidth/2, colorHeight * 2 + colorLineWidth);
  }
  for (let i = 0; i < 3; i++) {
    ctx.moveTo(0,                               colorHeight * i + colorLineWidth/2);
    ctx.lineTo(colorWidth * 8 + colorLineWidth, colorHeight * i + colorLineWidth/2);
  }
  ctx.stroke();

  for (let y = 0; y < 2; y++) {
    let top = y * colorHeight;
    for (let x = 0; x < 8; x++) {
      let left = x * colorWidth;
      ctx.fillStyle = "#" + colors[y*8 + x];
      ctx.fillRect(left+2, top+2, colorWidth-2, colorHeight-2);
    }
  }

}

function keydown(e){
    const elm = e.target;
    switch(e.keyCode) {
        case 38: posY--; break; // up
        case 40: posY++; break; // dn
        case 37: posX--; break; // l
        case 39: posX++; break; // r
        case 32: e.preventDefault(); mode=1; fill(posX, posY); mode=-1; break;//space
        default: break;
    }
    if (posX < 0) posX = 0;
    if (cells <= posX) posX = cells -1;
    if (posY < 0) posY = 0;
    if (cells <= posY) posY = cells -1;
    showCursor();
}


function paletteClicked(e) {
  let x = Math.floor(e.offsetX/colorWidth);
  let y = Math.floor(e.offsetY/colorHeight);
  paletteSelect.style.left = x * colorWidth;
  paletteSelect.style.top = y * colorHeight;
  paletteNo = y*8+x;
  paletteSelected();
  hueDispRefresh();
  showColorSelectStat();
}

function drawEracer(bCvs, bctx) {
  bCvs.height = colorHeight;
  bCvs.width = colorWidth;
  drawBack(bCvs, bctx);
}

function penClicked() {
  toolNo = "pen";
  toolSelect.style.left = 0;
}
function eracerClicked() {
  toolNo = "eracer";
  toolSelect.style.left = 40;
}
function bucketClicked() {
  toolNo = "bucket";
  toolSelect.style.left = 80;
}

function hsl2rgb(h, s, l) {
  let max;
  let min;
  if (l < 50) {
    max = 2.55 * (l + l * (s/100));
    min = 2.55 * (l - l * (s/100));
  } else {
    max = 2.55 * (l + (100 - l) * (s/100));
    min = 2.55 * (l - (100 - l) * (s/100));
  }
  return hmm2rgb(h, max, min);
}

function rgb2hsl(r, g, b) {
  let h;
  const max = Math.max(r,g,b);
  const min = Math.min(r,g,b)
  if (r == g && r == b) h = 0;
  else if (r >= g && r >= b) h = 60 * ((g - b) / (max - min));
  else if (g >= r && g >= b) h = 60 * ((b - r) / (max - min)) + 120;
  else h = 60 * ((r - g) / (max - min)) + 240;
  if (h < 0) h += 360;
  let cnt = (max + min)/2;
  let s;
  if (cnt < 128) {
    s = (max - min) / (max + min) * 100;
  } else {
    s = (max - min) / (510 - max - min) * 100;
  }
  let l = cnt / 255 * 100;
  let hsl = new Object();
  hsl.h = Math.floor(h);
  hsl.s = Math.floor(s);
  hsl.l = Math.floor(l);
  return hsl;
}

function rgb2hsv(r, g, b) {
  let h;
  const max = Math.max(r,g,b);
  const min = Math.min(r,g,b)
  if (r == g && r == b) h = 0;
  else if (r >= g && r >= b) h = 60 * ((g - b) / (max - min));
  else if (g >= r && g >= b) h = 60 * ((b - r) / (max - min)) + 120;
  else h = 60 * ((r - g) / (max - min)) + 240;
  if (h < 0) h += 360;
  const s = (max == 0 ? 0 : (max - min) / max * 100);
  const v = max / 255 * 100
  let hsv = new Object();
  hsv.h = Math.floor(h);
  hsv.s = Math.floor(s);
  hsv.v = Math.floor(v);
  return hsv;
}

function hsv2rgb(h, s, v) {
  const max = v/100 * 255;
  const min = max - ((s/100) * max);
  return hmm2rgb(h, max, min);
}

function hmm2rgb(h, max, min) {
  let r;
  let g;
  let b;
  switch (Math.floor((h%360)/60)) {
    case 0:
      r = max;
      g = (h/60) * (max-min) + min;
      b = min;
      break;
    case 1:
      r = ((120-h)/60) * (max-min) + min;
      g = max;
      b = min;
      break;
    case 2:
      r = min;
      g = max;
      b = ((h-120)/60) * (max-min) + min;
      break;
    case 3:
      r = min;
      g = ((240-h)/60) * (max-min) + min;
      b = max;
      break;
    case 4:
      r = ((h-240)/60) * (max-min) + min;
      g = min;
      b = max;
      break;
    case 5:
      r = max;
      g = min;
      b = ((360-h)/60) * (max-min) + min;
      break;
  }
  let rgb = new Object();
  rgb.r = Math.floor(r);
  rgb.g = Math.floor(g);
  rgb.b = Math.floor(b);
  return rgb;
}
function hsl2hsv(h, s, l) {
  const rgb = hsl2rgb(h, s, l);
  return rgb2hsv(rgb.r, rgb.g, rgb.b);
}
function hsv2hsl(h, s, v) {
  const rgb = hsv2rgb(h, s, v);
  return rgb2hsl(rgb.r, rgb.g, rgb.b);
}

function save() {
  const png = vCanvas.toDataURL('image/png');
  let json = '{';
  json += '"palette":' + JSON.stringify(colors);
  let pictureString = "";
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      if (field[y][x] == -1) {
        pictureString += "_";
      } else {
        pictureString += field[y][x].toString(16);
      }
    }
    pictureString += "";
  }
  json += ', "pict":"' + pictureString + '"';
  json += '}';
  console.log(json);
  document.getElementById('json').value = json;
  document.cookie = "data=" + json;
}

function loadFromJsonString(jsonString) {
  const json = JSON.parse(jsonString);
  colors = json.palette;
  for (let p = 0; p < 16; p++) {
    paletteNo = p;
    paletteSelected();
    showColorSelectStat();
  }
  mode = 1;
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      if (json.pict.charAt(y*cells+x) == "_") {
        paletteNo = -1;
      } else {
        paletteNo = parseInt(json.pict.charAt(y*cells+x), 16);
      }
      fill(x, y);
    }
  }
  mode = -1;
  paletteNo = 0;
  paletteSelected();
  hueDispRefresh();
  showColorSelectStat();
}

function load() {
  if (document.getElementById('json').value == '') {
    document.getElementById('json').value = document.cookie.split('; ').find(row => row.startsWith('data')).split('=')[1];
  }
  loadFromJsonString(document.getElementById('json').value);
}
