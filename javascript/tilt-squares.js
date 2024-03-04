let Engine = Matter.Engine,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body;
let engine;
let world;
let boxes = [];
let numBoxes = 40;
let boxSize = 50;
let permissionGranted = false;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    DeviceOrientationEvent.requestPermission()
      .catch(() => {
        let button = createButton("Click to give access to sensors");
        button.center();
        button.mousePressed(requestAccess);
        throw error;
      })
      .then(() => {
        permissionGranted = true;
      });
  } else {
    textAlign(CENTER, CENTER);
    text("Non-iOS Device", window.innerWidth / 2, window.innerHeight / 2);
  }

  engine = Matter.Engine.create();
  engine.timing.timeScale = 0.2;

  engine.positionIterations = 10;
  engine.velocityIterations = 10;
  engine.constraintIterations = 10; 

  world = engine.world;
  Matter.Runner.run(engine);
  // Create boxes as physics bodies
  for (let i = 0; i < numBoxes; i++) {
    let box = Bodies.rectangle(
      random(100, window.innerWidth - 100),
      random(100, window.innerHeight - 100),
      boxSize,
      boxSize,
      { restitution: 0.1 }
    );
    boxes.push(box);
    World.add(world, box);
  }
  addBoundaries();
}
function requestAccess() {
  DeviceOrientationEvent.requestPermission()
    .then((response) => {
      if (response == "granted") {
        permissionGranted = true;
      } else {
        permissionGranted = false;
      }
    })
    .catch(console.error);
  button.remove();
}

function draw() {
  if (!permissionGranted) return;

  background(255);
  blendMode(DIFFERENCE);
  fill(255);
  noStroke();
  Engine.update(engine);

  let forceMagnitude = 0.001;
  boxes.forEach((box) => {
    let forceX = forceMagnitude * rotationY;
    let forceY = forceMagnitude * rotationX;
    Body.applyForce(
      box,
      { x: box.position.x, y: box.position.y },
      { x: forceX, y: forceY }
    );

    Body.setVelocity(box, {
      x: Math.min(Math.max(box.velocity.x, -10), 10),
      y: Math.min(Math.max(box.velocity.y, -10), 10),
    });
  });

  boxes.forEach((box) => {
    push();
    translate(box.position.x, box.position.y);
    rotate(box.angle);
    rectMode(CENTER);
    rect(0, 0, boxSize, boxSize);
    pop();
  });

  blendMode(BLEND);
}

function addBoundaries() {
  let thickness = 100; 
  let options = { isStatic: true, restitution: 0.1 }; 

  let ground = Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight + thickness / 2,
    window.innerWidth,
    thickness,
    options
  );
  let ceiling = Bodies.rectangle(
    window.innerWidth / 2,
    -thickness / 2,
    window.innerWidth,
    thickness,
    options
  );
  let leftWall = Bodies.rectangle(
    -thickness / 2,
    window.innerHeight / 2,
    thickness,
    window.innerHeight,
    options
  );
  let rightWall = Bodies.rectangle(
    window.innerWidth + thickness / 2,
    window.innerHeight / 2,
    thickness,
    window.innerHeight,
    options
  );

  World.add(world, [ground, ceiling, leftWall, rightWall]);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  addBoundaries();
}
