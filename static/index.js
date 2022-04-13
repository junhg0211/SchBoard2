const FPS = 60;

const BACKGROUND_COLOR = "#163b2d";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// input
let keys = [];
let mouseX, mouseY;
let mouseScroll = 0;
let mouseDowns = [], mouseUps = [], mousePresseds = [];
let mouseClickedX, mouseClickedY;

function isPressed(key) {
  return keys.indexOf(key) !== -1;
}

function isClicked(button) {
  return mousePresseds.indexOf(button) !== -1;
}

function isMouseDown(button) {
  return mouseDowns.indexOf(button) !== -1;
}

function isMouseUp(button) {
  return mouseUps.indexOf(button) !== -1;
}

function tickMouse() {
  mouseDowns = [];
  mouseUps = [];
}

// objects
let camera = new Camera(0, 0, 10);
let centerIndicator = new PositionIndicator(0, 0, 'white', 1, camera);
let grid = new Grid(camera);

let socket1 = new Socket(0, 0, camera);
let socket2 = new Socket(0, 0, camera);
let socket3 = new Socket(0, 0, camera);

let gameObjects = [
  new Component(0, 0, "TEST", camera, [socket1, socket2], [socket3]),
  new Wire(socket3, socket2, camera)
];

// work mode
const WM_ARRANGE = 'arrange';
const WM_WIRE = 'wire';
const WM_WIRE_ARRANGE = 'wire_arrange';

function getWorkMode() {
  return document.querySelector("input[name='work_mode']:checked").value;
}

function setWorkMode(workMode) {
  document.querySelector(`input[name='work_mode'][value='${workMode}']`).checked = true;
}

let floatingObject = null;
let floatingObjectOriginalX = 0;
let floatingObjectOriginalY = 0;

/*
 * work mode keyboard shortcuts
 */
function tickWorkMode() {
  let workMode = getWorkMode();

  if (workMode === WM_ARRANGE) {
    let inGameX = camera.getBoardX(mouseX), inGameY = camera.getBoardY(mouseY);
    if (isMouseDown(0)) {
      for (let i in gameObjects) {
        let object = gameObjects[i];
        if (object.x <= inGameX && inGameX <= object.x + object.size
          && object.y <= inGameY && inGameY <= object.y + object.size) {
          floatingObject = object;
          floatingObjectOriginalX = object.x;
          floatingObjectOriginalY = object.y;
        }
      }
    } else if (isMouseUp(0)) {
      if (floatingObject !== null && floatingObject !== undefined) {
        let x = Math.round(floatingObject.x);
        let y = Math.round(floatingObject.y);
        floatingObject.setPos(x, y);
        floatingObject = null;
      }
    }
    if (floatingObject !== null && floatingObject !== undefined && isClicked(0)) {
      let x = Math.round(floatingObjectOriginalX + inGameX - camera.getBoardX(mouseClickedX));
      let y = Math.round(floatingObjectOriginalY + inGameY - camera.getBoardY(mouseClickedY));
      floatingObject.setPos(x, y);
    }
  } else if (workMode === WM_WIRE) {
  } else if (workMode === WM_WIRE_ARRANGE) {
  }

  if (isPressed('v')) {
    setWorkMode(WM_ARRANGE);
  } else if (isPressed('e')) {
    setWorkMode(WM_WIRE);
  } else if (isPressed('q')) {
    setWorkMode(WM_WIRE_ARRANGE);
  }
}

// game logic
function tick() {
  camera.tick();

  centerIndicator.render();
  gameObjects.forEach(object => {
    object.tick();
  });

  tickWorkMode();
  tickMouse();
}

function render() {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  grid.render();

  centerIndicator.render();
  gameObjects.forEach(object => {
    object.render();
  });
}

/*
 * called when program starts
 */
function init() {
  resize();
}

// event handlers
function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

function keyDown(event) {
  keys.push(event.key);
}

function keyUp(event) {
  keys = keys.filter(key => key !== event.key);
}

function mouseMove(event) {
  mouseX = event.clientX - canvas.offsetLeft;
  mouseY = event.clientY - canvas.offsetTop;
}

function mouseDown(event) {
  mouseDowns.push(event.button);
  mousePresseds.push(event.button);
  mouseClickedX = mouseX;
  mouseClickedY = mouseY;
}

function mouseUp(event) {
  mouseUps.push(event.button);
  mousePresseds = mousePresseds.filter(button => button !== event.button);
}

function wheel(event) {
  mouseScroll = event.wheelDelta;
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);
window.addEventListener("mousemove", mouseMove);
window.addEventListener("mousedown", mouseDown)
window.addEventListener("mouseup", mouseUp);
window.addEventListener("wheel", wheel);

// main loop
init();
setInterval(() => {
  tick();
  render();
}, 1000 / FPS)