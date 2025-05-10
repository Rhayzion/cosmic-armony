// Configuration
let particles = [];
let pattern = 'harmonic';
let particleCount = 500;
let animationSpeed = 1.0;
let time = 0;
let centerForce = 0.05;
let connectionThreshold = 120;
let maxDistance;
let interfaceVisible = true;

// Color palettes
let palettes = {
    harmonic: ['#7f00ff', '#e100ff', '#ff8a00'],
    fibonacci: ['#00ff87', '#60efff', '#0061ff'],
    prime: ['#ff4d4d', '#f9cb28', '#ff7b00'],
    lissajous: ['#00f2fe', '#4facfe', '#a6c1ee']
};

const patterns = ['harmonic', 'fibonacci', 'prime', 'lissajous'];

// p5.js Setup
function setup() {
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('universe');
    maxDistance = dist(0, 0, width/2, height/2);
    
    createParticles();
    setupEventListeners();
}

// p5.js Draw Loop
function draw() {
    background(0, 20);
    time += 0.01 * animationSpeed;
    
    translate(width/2, height/2);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update(i);
        particles[i].display();
    }
}

// Particle System
class Particle {
    constructor(index) {
        this.index = index;
        this.reset();
        this.hue = random(360);
        this.size = map(index, 0, particleCount, 2, 6);
        this.connectionDistance = connectionThreshold;
        this.baseAngle = random(TWO_PI);
        this.angleSpeed = random(0.005, 0.02);
        this.orbitRadius = 0;
        this.calculateOrbit();
    }
    
    reset() {
        this.pos = p5.Vector.random2D().mult(random(width/4));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
    }
    
    calculateOrbit() {
        switch(pattern) {
            case 'harmonic':
                this.orbitRadius = map(1/(this.index+1), 0, 1, 50, maxDistance * 0.8);
                break;
            case 'fibonacci':
                let fib = fibonacci(this.index % 20 + 1);
                this.orbitRadius = map(fib, 0, 6765, 50, maxDistance * 0.8);
                break;
            case 'prime':
                let prime = isPrime(this.index) ? 1 : 0.3;
                this.orbitRadius = map(this.index, 0, particleCount, 50, maxDistance * prime);
                break;
            case 'lissajous':
                let ratio = (this.index % 10 + 1) / 10;
                this.orbitRadius = map(sin(time * ratio * 2), -1, 1, 50, maxDistance * 0.7);
                break;
        }
    }
    
    update(index) {
        this.index = index;
        this.connectionDistance = connectionThreshold;
        this.calculateOrbit();
        
        let angle = this.baseAngle + time * this.angleSpeed;
        let targetX = cos(angle) * this.orbitRadius;
        let targetY = sin(angle) * this.orbitRadius;
        
        let toTarget = createVector(targetX, targetY).sub(this.pos);
        toTarget.mult(0.01 * animationSpeed);
        this.acc.add(toTarget);
        
        let mouse = createVector(mouseX - width/2, mouseY - height/2);
        let toMouse = p5.Vector.sub(mouse, this.pos);
        if (toMouse.mag() < 200) {
            toMouse.setMag(-0.1);
            this.acc.add(toMouse);
        }
        
        this.vel.add(this.acc);
        this.vel.limit(3 * animationSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
    
    display() {
        let palette = palettes[pattern];
        let col;
        let d = this.pos.mag();
        
        if (d < maxDistance * 0.3) {
            col = lerpColor(color(palette[0]), color(palette[1]), map(d, 0, maxDistance * 0.3, 0, 1));
        } else {
            col = lerpColor(color(palette[1]), color(palette[2]), map(d, maxDistance * 0.3, maxDistance, 0, 1));
        }
        
        noStroke();
        fill(col);
        ellipse(this.pos.x, this.pos.y, this.size);
        
        stroke(red(col), green(col), blue(col), 50);
        strokeWeight(0.8);
        for (let i = this.index + 1; i < min(this.index + 20, particles.length); i++) {
            let other = particles[i];
            let d = p5.Vector.dist(this.pos, other.pos);
            if (d < this.connectionDistance) {
                let alpha = map(d, 0, this.connectionDistance, 100, 0);
                stroke(red(col), green(col), blue(col), alpha);
                line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            }
        }
    }
}

// Helper Functions
function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(i));
    }
    updateMathDisplay();
}

function setPattern(newPattern) {
    pattern = newPattern;
    updateMathDisplay();
}

function randomizePattern() {
    pattern = patterns[floor(random(patterns.length))];
    updateMathDisplay();
}

function randomizeColors() {
    palettes = {
        harmonic: [randomColor(), randomColor(), randomColor()],
        fibonacci: [randomColor(), randomColor(), randomColor()],
        prime: [randomColor(), randomColor(), randomColor()],
        lissajous: [randomColor(), randomColor(), randomColor()]
    };
}

function randomColor() {
    return color(random(255), random(255), random(255));
}

function updateMathDisplay() {
    const patternNames = {
        harmonic: 'Harmonic Series 1/n',
        fibonacci: 'Fibonacci Sequence',
        prime: 'Prime Number Distribution',
        lissajous: 'Lissajous Curves'
    };
    
    const equations = {
        harmonic: 'f(n) = 1/n',
        fibonacci: 'f(n) = f(n-1) + f(n-2)',
        prime: 'f(n) = nth prime',
        lissajous: 'x = A sin(at+δ)<br>y = B sin(bt)'
    };
    
    document.getElementById('current-pattern').innerHTML = 
        `Current pattern: <span class="formula">${patternNames[pattern]}</span>`;
    document.getElementById('equation').innerHTML = 
        `<span class="formula">${equations[pattern]}</span>`;
}

function toggleInterface() {
    interfaceVisible = !interfaceVisible;
    const interface = document.getElementById('interface');
    const toggleBtn = document.getElementById('toggle-interface');
    
    if (interfaceVisible) {
        interface.classList.remove('collapsed');
        toggleBtn.textContent = '▲ Controls ▼';
    } else {
        interface.classList.add('collapsed');
        toggleBtn.textContent = '▲ Show Controls ▲';
    }
}

function takeScreenshot() {
    saveCanvas('cosmic-harmony', 'png');
}

function fibonacci(n) {
    let a = 0, b = 1, temp;
    for (let i = 0; i < n; i++) {
        temp = a;
        a = b;
        b = temp + b;
    }
    return a;
}

function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    maxDistance = dist(0, 0, width/2, height/2);
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('harmonic').addEventListener('click', () => setPattern('harmonic
