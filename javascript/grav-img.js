const isMobile = window.innerWidth < 768;
const minBoxSize = 30; 
const maxGridSize = 15;
const minGridSize = 10; 
const collisionCategoryBox = 0x0001;
const collisionCategoryMouse = 0x0002;
const collisionCategoryBorder = 0x0004;
const collisionCategoryDisabled = 0x0008;
const reassemblyDuration = 1500; // Duration in milliseconds

let engine,
  boxes = [],
  img,
  imgPieces = [],
  isReassembling = false;
let mouseBody,
  targetPositions = [],
  targetRotations = [];
let reassemblyStartTime;
let sqAmt = isMobile ? minGridSize : maxGridSize; 
let imgW, imgH, boxSize; // Declare imgW, imgH, and boxSize without initial values

let images = [], originalImages = [];
const numImages = 14; // Total number of images

let mainX, mainY, mainWidth, mainHeight; // New variables for main dimensions

function preload() {
  for (let i = 0; i < numImages; i++) {
    originalImages[i] = loadImage(`/images/${i}.jpg`); // Load and store original images
    images[i] = originalImages[i]; // Store the reference to the original image
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Matter.Engine.create();
  engine.world.gravity.y = 0;

  calculateImageDimensions(); // Call this function to calculate and resize images

  createBoxes();
  divideImage();
  createMouseBody();
  createBorders();

  Matter.Events.on(engine, 'collisionStart', handleCollisions);
}

function draw() {
  background(255);
  Matter.Engine.update(engine);
  Matter.Body.setPosition(mouseBody, {x: mouseX, y: mouseY});

  drawBoxes();
  populateBoxesWithImages();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  isMobile = window.innerWidth < 768;
  calculateImageDimensions(); // Update dimensions on window resize
  divideImage();
  rearrangeSquares();
}

function calculateImageDimensions() {
  sqAmt = isMobile ? minGridSize : maxGridSize; 
  imgW = roundToNearestMultiple(windowWidth * 0.5, sqAmt);
  imgH = imgW;
  boxSize = Math.max(imgW / sqAmt, minBoxSize); // Ensure boxSize is not below minBoxSize

  for (let i = 0; i < numImages; i++) {
    images[i] = originalImages[i].get(); // Get a copy of the original image
    images[i].resize(imgW, imgH); // Resize the copy for display
  }
  
  img = images[0]; // Set the initial image from resized images
}

function roundToNearestMultiple(number, multiple) {
  return Math.round(number / multiple) * multiple;
}

function createBoxes() {
  for (let i = 0; i < sqAmt * sqAmt; i++) {
    const box = Matter.Bodies.rectangle(random(width), random(height), boxSize, boxSize, {
      restitution: 0.8,
      friction: 0.01,
      frictionAir: 0.006,
      inertia: Infinity,
      collisionFilter: {
        category: collisionCategoryBox,
        mask: collisionCategoryMouse | collisionCategoryBorder
      },
      angularDamping: 10
    });
    boxes.push(box);
  }
  Matter.World.add(engine.world, boxes);
}

function divideImage() {
  imgPieces = [];
  for (let y = 0; y < sqAmt; y++) {
    for (let x = 0; x < sqAmt; x++) {
      imgPieces.push(img.get(x * boxSize, y * boxSize, boxSize, boxSize));
    }
  }
}

function createMouseBody() {
  mouseBody = Matter.Bodies.circle(0, 0, 25, {
    isSensor: false,
    render: {visible: true},
    collisionFilter: {
      category: collisionCategoryMouse,
      mask: collisionCategoryBox
    }
  });
  Matter.World.add(engine.world, mouseBody);
}

function createBorders() {
  const borders = [
    Matter.Bodies.rectangle(width / 2, height, width, 50, {
      isStatic: true,
      collisionFilter: {category: collisionCategoryBorder}
    }),
    Matter.Bodies.rectangle(width / 2, 0, width, 50, {
      isStatic: true,
      collisionFilter: {category: collisionCategoryBorder}
    }),
    Matter.Bodies.rectangle(0, height / 2, 50, height, {
      isStatic: true,
      collisionFilter: {category: collisionCategoryBorder}
    }),
    Matter.Bodies.rectangle(width, height / 2, 50, height, {
      isStatic: true,
      collisionFilter: {category: collisionCategoryBorder}
    })
  ];
  Matter.World.add(engine.world, borders);
}

function handleCollisions(event) {
  const pairs = event.pairs;
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if (pair.bodyA === mouseBody || pair.bodyB === mouseBody) {
      const otherBody = pair.bodyA === mouseBody ? pair.bodyB : pair.bodyA;
      const direction = Math.random() < 0.5 ? -1 : 1;
      const angularVelocity = direction * Math.random() * 0.1;
      Matter.Body.setAngularVelocity(otherBody, angularVelocity);

      const forceMagnitude = 0.005 * otherBody.mass;
      const angle = Math.random() * Math.PI * 2;
      const force = {
        x: forceMagnitude * Math.cos(angle),
        y: forceMagnitude * Math.sin(angle)
      };
      Matter.Body.applyForce(otherBody, otherBody.position, force);
    }
  }
}

function drawBoxes() {
  push();
  blendMode(DIFFERENCE);
  fill(255);
  noStroke();
  boxes.forEach(box => {
    push();
    translate(box.position.x, box.position.y);
    rotate(box.angle);
    rectMode(CENTER);
    rect(0, 0, boxSize, boxSize);
    pop();
  });
  pop();
}

function populateBoxesWithImages() {
  if (isReassembling) {
    updateSquares();
  }
}

function rearrangeSquares() {
  if (isMobile) {
    // Skip reassembly on mobile devices
    console.log("Skipping reassembly on mobile device.");
    return;
  }

  reassemblyStartTime = millis();
  const headerHeight = getHeaderHeight();
  const availableHeight = windowHeight - headerHeight;
  const centerY = headerHeight + availableHeight / 2;

  for (let i = 0; i < boxes.length; i++) {
    const targetX = width / 2 - (sqAmt / 2) * boxSize + (i % sqAmt) * boxSize;
    const targetY = centerY - (sqAmt / 2) * boxSize + Math.floor(i / sqAmt) * boxSize;

    targetPositions[i] = { x: targetX, y: targetY };
    targetRotations[i] = 0;

    if (!isReassembling) {
      Matter.Body.setVelocity(boxes[i], {x: 0, y: 0});
      Matter.Body.setAngularVelocity(boxes[i], 0);
      Matter.Body.setAngle(boxes[i], 0);
    }

    Matter.Body.set(boxes[i], {
      collisionFilter: {category: collisionCategoryDisabled}
    });
  }
  isReassembling = true;
}

function setMainDimensions(x, y, width, height) {
  mainX = x;
  mainY = y;
  mainWidth = width;
  mainHeight = height;
}

window.setMainDimensions = setMainDimensions;

function getHeaderHeight() {
  const header = document.querySelector('header');
  return header ? header.offsetHeight : 0;
}

function updateSquares() {
  if (isMobile) {
    // Skip updates on mobile devices
    return;
  }
  const currentTime = millis();
  const timePerBox = reassemblyDuration / boxes.length;

  boxes.forEach((box, i) => {
    const targetPosition = targetPositions[i];
    const targetRotation = targetRotations[i];
    const imagePopulationTime = reassemblyStartTime + timePerBox * i;

    if (currentTime >= imagePopulationTime) {
      push();
      translate(box.position.x, box.position.y);
      rotate(box.angle);
      imageMode(CENTER);
      image(imgPieces[i], 0, 0, boxSize, boxSize);
      pop();
    }

    const progress = Math.min((currentTime - reassemblyStartTime) / reassemblyDuration, 1);

    if (progress >= 1 && !box.isStatic) {
      Matter.Body.setStatic(box, true);
    } else {
      Matter.Body.setPosition(box, {
        x: lerp(box.position.x, targetPosition.x, progress),
        y: lerp(box.position.y, targetPosition.y, progress)
      });
      const currentAngle = box.angle % (2 * Math.PI);
      Matter.Body.setAngle(box, lerp(currentAngle, targetRotation, progress));
    }
  });
}

function enableCollisions() {
  boxes.forEach(box => {
    Matter.Body.setStatic(box, false);
    Matter.Body.set(box, {
      collisionFilter: {
        category: collisionCategoryBox,
        mask: collisionCategoryMouse | collisionCategoryBorder
      }
    });
  });
}

function disableCollisions() {
  boxes.forEach(box => {
    Matter.Body.set(box, {
      collisionFilter: {
        category: collisionCategoryDisabled,
        mask: collisionCategoryDisabled
      }
    });
  });
}

function handleMouseLeaveDropdown() {
  console.log("handleMouseLeaveDropdown executed");
  if (isReassembling) {
    isReassembling = false;
    enableCollisions();
  }
}
window.handleMouseLeaveDropdown = handleMouseLeaveDropdown;

function changeImage(index) {
  console.log('Changing to image:', index);
  img = images[index];
  divideImage();
  if (!isReassembling) {
    disableCollisions();
    rearrangeSquares();
  }
}
window.changeImage = changeImage;
