const canvas = document.querySelector("canvas");

const score = document.getElementById("score");
const params = new URLSearchParams(window.location.search);
const level = params.get("level");

const c = canvas.getContext("2d");
let count = 0;

canvas.width = window.innerWidth - 10;
canvas.height = window.innerHeight - 10;

const shooter = new Image();
shooter.src = "./shooter.png";
const zombie = new Image();
zombie.src = "./zombie.png";

let gunsound = new Audio("./pistol.mp3");

class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 25;
  }
  draw() {
    c.beginPath();
    c.drawImage(shooter, this.position.x, this.position.y);
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
  }
}

class Projectiles {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }

  draw() {
    c.beginPath();
    c.moveTo(this.position.x, this.position.y);
    c.lineTo(this.position.x + 2.5, this.position.y + 5);
    c.lineTo(this.position.x - 2.5, this.position.y + 5);
    c.rect(this.position.x - 2.5, this.position.y + 5, 5, 12.5);
    c.closePath();
    c.fillStyle = "black";
    c.fill();
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
  }
}

class Zombies {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 25;
  }

  draw() {
    c.beginPath();
    c.drawImage(zombie, this.position.x, this.position.y);
    c.closePath();
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
  }
}

const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height - 200 },
  velocity: { x: 0, y: 0 },
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const projectiles = [];
const zombies = [];

let speed = 2000;
let rspeed = 1;
if (level === "easy") {
  speed = 2000;
  rspeed = 1;
} else if (level === "medium") {
  speed = 1700;
  rspeed = 2;
} else {
  speed = 1500;
  rspeed = 2.5;
}

window.setInterval(() => {
  speed = speed - 0.1 * speed;
}, 10000);

window.setInterval(() => {
  let x = Math.random() * (canvas.width - 100);
  let y = 20;
  let vy = Math.floor(Math.random() * 2 + rspeed);
  zombies.push(
    new Zombies({
      position: { x: x, y: y },
      velocity: { x: 0, y: vy },
    })
  );
}, speed);

function circleCollision(circle1, circle2) {
  const xDifference = circle2.position.x - 45 - circle1.position.x;
  const yDifference = circle2.position.y - circle1.position.y;

  const distance = Math.sqrt(
    xDifference * xDifference + yDifference * yDifference
  );

  if (distance <= circle1.radius + circle2.radius) {
    return true;
  }
  return false;
}

function animate() {
  const animateID = window.requestAnimationFrame(animate);
  c.fillStyle = "rgba(11,156,49,0.8)";
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.update();

    if (projectile.position.y < 0) {
      projectiles.splice(i, 1);
    }
  }

  for (let i = zombies.length - 1; i >= 0; i--) {
    const zombie = zombies[i];
    zombie.update();

    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j];
      if (circleCollision(zombie, projectile)) {
        zombies.splice(i, 1);
        projectiles.splice(j, 1);
        count += 1;
        score.innerText = `Score: ${count}`;
      }
    }

    if (zombie.position.y > canvas.height - 100) {
      window.cancelAnimationFrame(animateID);
      window.location.assign(`./gameover.html?score=${count}`);
    }
  }

  if (keys.a.pressed) {
    player.velocity.x = -5;
  } else if (keys.d.pressed) {
    player.velocity.x = 5;
  } else {
    player.velocity.x = 0;
  }
}

animate();

window.addEventListener("keydown", (event) => {
  switch (event.code) {
    case "KeyA":
      keys.a.pressed = true;
      break;
    case "KeyD":
      keys.d.pressed = true;
      break;
    case "Space":
      gunsound.play();
      projectiles.push(
        new Projectiles({
          position: {
            x: player.position.x + 80,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -10,
          },
        })
      );
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyD":
      keys.d.pressed = false;
      break;
  }
});

const leftb = document.getElementById("left");
leftb.addEventListener("touchstart", () => {
  keys.a.pressed = true;
});
leftb.addEventListener("touchend", () => {
  keys.a.pressed = false;
});

const rightb = document.getElementById("right");
rightb.addEventListener("touchstart", () => {
  keys.d.pressed = true;
});
rightb.addEventListener("touchend", () => {
  keys.d.pressed = false;
});

const spaceb = document.getElementById("shoot");
spaceb.addEventListener("mousedown", () => {
  gunsound.play();
  projectiles.push(
    new Projectiles({
      position: {
        x: player.position.x + 80,
        y: player.position.y,
      },
      velocity: {
        x: 0,
        y: -10,
      },
    })
  );
});

let music = new Audio("main_music.mp3");
music.volume = 0.4;
music.loop = true;
window.onload(music.play());
