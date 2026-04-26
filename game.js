const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 400;

// ===================== GAME STATE =====================
let worldX = 0;
let speed = 5;

let gravity = 0.6;
let gravityDir = 1;

let practiceMode = false;
let checkpoint = null;

// ===================== PLAYER =====================
let player = {
  x: 120,
  y: 300,
  size: 30,
  velY: 0,
  color: "white"
};

// ===================== COINS & SKINS =====================
let coins = parseInt(localStorage.getItem("coins")) || 0;
let skin = localStorage.getItem("skin") || "white";

document.getElementById("coinDisplay").innerText = coins;

// ===================== LEVEL OBJECTS =====================
let objects = [
  {type:"block", x:300, y:350, w:50, h:50},

  // PORTAL (gravity flip)
  {type:"portal-gravity", x:600, y:300},

  // SPEED PORTAL
  {type:"portal-speed", x:900, y:300},

  {type:"block", x:1100, y:320, w:50, h:80},

  {type:"checkpoint", x:1300, y:300}
];

// ===================== INPUT =====================
document.addEventListener("keydown", jump);
document.addEventListener("mousedown", jump);

function jump() {
  if (player.y >= 300 || gravityDir === -1 && player.y <= 100) {
    player.velY = -12 * gravityDir;
  }
}

// ===================== GAME LOOP =====================
function update() {

  // physics
  player.velY += gravity * gravityDir;
  player.y += player.velY;

  // ground depending on gravity
  if (gravityDir === 1 && player.y > 300) {
    player.y = 300;
    player.velY = 0;
  }

  if (gravityDir === -1 && player.y < 100) {
    player.y = 100;
    player.velY = 0;
  }

  worldX -= speed;

  // COLLISIONS
  for (let o of objects) {
    let ox = o.x + worldX;

    // BLOCKS
    if (o.type === "block") {
      if (
        player.x < ox + o.w &&
        player.x + player.size > ox &&
        player.y < o.y &&
        player.y + player.size > o.y - o.h
      ) {
        die();
      }
    }

    // GRAVITY PORTAL
    if (o.type === "portal-gravity") {
      if (Math.abs(player.x - ox) < 30) {
        gravityDir *= -1;
      }
    }

    // SPEED PORTAL
    if (o.type === "portal-speed") {
      if (Math.abs(player.x - ox) < 30) {
        speed = 9;
      }
    }

    // CHECKPOINT
    if (o.type === "checkpoint") {
      if (Math.abs(player.x - ox) < 30) {
        checkpoint = worldX;
      }
    }
  }
}

// ===================== DEATH =====================
function die() {
  if (practiceMode && checkpoint !== null) {
    worldX = checkpoint;
    player.y = 300;
    player.velY = 0;
  } else {
    alert("You died!");
    location.reload();
  }
}

// ===================== DRAW =====================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 330, canvas.width, 70);

  // player
  ctx.fillStyle = skin;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // objects
  for (let o of objects) {
    let ox = o.x + worldX;

    if (o.type === "block") {
      ctx.fillStyle = "#00eaff";
      ctx.fillRect(ox, o.y - o.h, o.w, o.h);
    }

    if (o.type === "portal-gravity") {
      ctx.fillStyle = "purple";
      ctx.fillRect(ox, o.y - 40, 20, 40);
    }

    if (o.type === "portal-speed") {
      ctx.fillStyle = "orange";
      ctx.fillRect(ox, o.y - 40, 20, 40);
    }

    if (o.type === "checkpoint") {
      ctx.fillStyle = "lime";
      ctx.fillRect(ox, o.y - 40, 20, 40);
    }
  }
}

// ===================== LOOP =====================
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ===================== MENU =====================
function startGame() {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";
  loop();
}

function togglePractice() {
  practiceMode = !practiceMode;
  alert("Practice Mode: " + (practiceMode ? "ON" : "OFF"));
}

// ===================== SHOP =====================
function openShop() {
  document.getElementById("shop").classList.remove("hidden");
  document.getElementById("menu").classList.add("hidden");
}

function closeShop() {
  document.getElementById("shop").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

function buySkin(color, price) {
  if (coins >= price) {
    coins -= price;
    skin = color;

    localStorage.setItem("coins", coins);
    localStorage.setItem("skin", skin);

    document.getElementById("coinDisplay").innerText = coins;
  } else {
    alert("Not enough coins!");
  }
}
