let positionsX = [],
    positionsY = [],
    velocitiesX = [],
    velocitiesY = [];
    bodyColors = [],
    noiseOffsets = [],
    pupilOffsetsX = [],
    pupilOffsetsY = [];
    numCreatures = 7;
    planets = []; // Array to store planet information
    stars = []; // Array to manage multiple falling stars
    numStars = 100; // Number of falling stars
    colorState = 0;
    backgroundColors = [
    [0, 0, 0],       // Black
    [0, 0, 139],     // Darker Blue
    [148, 0, 211],   // Purple
    [255, 140, 0],   // Orange
];

function setup() {
    let canvas = createCanvas(1800, 800);

    // Initialize creatures
    for (let i = 0; i < numCreatures; i++) {
        positionsX.push(random(width));
        positionsY.push(random(height));
        velocitiesX.push(random(-2, 2));
        velocitiesY.push(random(-2, 2));
        bodyColors.push(color(255));
        noiseOffsets.push(random(1000));
        pupilOffsetsX.push(0);
        pupilOffsetsY.push(0);
    }

    // Initialize planets
    planets.push({ x: 1000, y: 100, size: 280, color: [255, 100, 100] });
    planets.push({ x: 1500, y: 300, size: 200, color: [100, 255, 100] });
    planets.push({ x: 400, y: 500, size: 250, color: [100, 100, 255] });
    planets.push({ x: 500, y: 50, size: 70, color: [255, 255, 100] });

    // Initialize falling stars
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: random(width),
            y: random(-50, -300), // Start off-screen for a falling effect
            speedX: random(-3, 3),
            speedY: random(1, 5)
        });
    }
}

function draw() {
    let currentColor = backgroundColors[colorState];
    background(currentColor[0], currentColor[1], currentColor[2]);

    planets.forEach((planet, index) => {
        let isCloseToCreature = false;

        // Check each creature for proximity to the current planet
        for (let i = 0; i < numCreatures; i++) {
            if (dist(positionsX[i], positionsY[i], planet.x, planet.y) < planet.size + 20) { // Threshold for proximity
                isCloseToCreature = true;
              
            }
        }
        drawTexturedPlanet(planet.x, planet.y, planet.size, planet.color, isCloseToCreature);
    });

    // Draw and update falling stars
    stroke(255); // White color for the stars
    stars.forEach(star => {
        line(star.x, star.y, star.x + star.speedX, star.y + star.speedY);
        star.x += star.speedX;
        star.y += star.speedY;
        // Wrap star position if it goes off-screen
        if (star.x < 0) star.x = width;
        else if (star.x > width) star.x = 0;
        if (star.y > height) star.y = random(-50, -300);
    });

    // Draw creatures
    for (let i = 0; i < numCreatures; i++) {
        updateCreature(i);
        drawCreature(i);
    }
}

function keyPressed() {
    colorState = (colorState + 1) % backgroundColors.length; // Cycle through the color states
}

function updateCreature(index) {
    // Update position with velocity
    positionsX[index] += velocitiesX[index];
    positionsY[index] += velocitiesY[index];
    // Bounce off walls
    if (positionsX[index] > width || positionsX[index] < 0) velocitiesX[index] *= -1;
    if (positionsY[index] > height || positionsY[index] < 0) velocitiesY[index] *= -1;
    // Update pupil position
    pupilOffsetsX[index] = map(noise(frameCount * 0.1), 0, 1, -5, 5);
    pupilOffsetsY[index] = map(noise(frameCount * 0.1 + 100), 0, 1, -5, 5);
}

function drawCreature(index) {
    push();
    translate(positionsX[index], positionsY[index]);

    // Wings
    let wingAngle = sin(frameCount * 0.1) * PI / 6;
    drawWing(index, -30, -10, wingAngle);
    drawWing(index, 30, -10, -wingAngle);

    // Body
    fill(bodyColors[index]);
    noStroke();
    beginShape();
    let numVertices = 100;
    for (let j = 0; j < numVertices; j++) {
        let angle = map(j, 0, numVertices, 0, TWO_PI);
        let radius = map(noise(cos(angle) * 0.5 + noiseOffsets[index], sin(angle) * 0.5 + noiseOffsets[index]), 0, 1, 20, 40);
        vertex(radius * cos(angle), radius * sin(angle));
    }
    endShape(CLOSE);

    // Eye
    fill(255); // White part of the eye
    ellipse(0, -10, 20, 30); // Eye shape
    fill(0); // Black part of the eye (pupil)
    ellipse(pupilOffsetsX[index], pupilOffsetsY[index] - 10, 10, 10);

    pop();
}

function drawWing(index, xOffset, yOffset, flapAngle) {
    push();
    noStroke();
    translate(xOffset, yOffset);
    rotate(flapAngle);
    fill(bodyColors[index]); // Use the body color for the wings
    ellipse(0, 0, 90, 20); // Wing shape and size
    pop();
}

function mousePressed() {
    // Change creature color if clicked
    for (let i = 0; i < numCreatures; i++) {
        if (dist(mouseX, mouseY, positionsX[i], positionsY[i]) < 50) {
            bodyColors[i] = color(random(255), random(255), random(255));
        }
    }
}

function drawTexturedPlanet(x, y, size, color, isShining) {
    push();
    translate(x, y);
    noStroke();
    fill(color);
    ellipse(0, 0, size, size); // Base planet shape

    if (isShining) {
        fill(255, 255, 255, 50);
        ellipse(0, 0, size * 2, size * 2);
    }

    // Overlay with rough, moon-like texture
    for (let i = 0; i < 100; i++) {
        let angle = random(TWO_PI);
        let r = size * 0.5 * sqrt(random()); // Random distance from center
        let tx = r * cos(angle);
        let ty = r * sin(angle);
        let noiseVal = noise(tx * 0.1, ty * 0.1);
        let gray = map(noiseVal, 0, 1, 0, 255);
        fill(gray, 150); // Semi-transparent for texture overlay
        ellipse(tx, ty, size / 20, size / 20);
    }
    pop();
}