const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const finalScoreElement = document.getElementById('final-score');
const speedElement = document.getElementById('speed');
const gameOverElement = document.getElementById('game-over');
const gameStartElement = document.getElementById('game-start');

let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameSpeed = 150; // milliseconds
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameLoop;
let gridSize = 20;
let gridWidth = canvas.width / gridSize;
let gridHeight = canvas.height / gridSize;

highScoreElement.textContent = highScore;

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const startGameBtn = document.getElementById('start-game-btn');
const playAgainBtn = document.getElementById('play-again-btn');


const slowSpeedBtn = document.getElementById('slow-speed');
const normalSpeedBtn = document.getElementById('normal-speed');
const fastSpeedBtn = document.getElementById('fast-speed');

const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');


function initGame() {
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    

    createFood();
    

    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    speedElement.textContent = 'Normal';

    gameOverElement.style.display = 'none';
    gameStartElement.style.display = 'none';
    

    draw();
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            return createFood();
        }
    }
}
function draw() {
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawGrid();
    
    for (let i = 0; i < snake.length; i++) {

        if (i === 0) {
            ctx.fillStyle = '#00b894';
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
            
            ctx.fillStyle = '#000';
            let eyeSize = gridSize / 5;
            
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
            
            if (direction === 'right') {
                leftEyeX = snake[i].x * gridSize + gridSize - eyeSize * 2;
                leftEyeY = snake[i].y * gridSize + eyeSize * 2;
                rightEyeX = snake[i].x * gridSize + gridSize - eyeSize * 2;
                rightEyeY = snake[i].y * gridSize + gridSize - eyeSize * 3;
            } else if (direction === 'left') {
                leftEyeX = snake[i].x * gridSize + eyeSize;
                leftEyeY = snake[i].y * gridSize + eyeSize * 2;
                rightEyeX = snake[i].x * gridSize + eyeSize;
                rightEyeY = snake[i].y * gridSize + gridSize - eyeSize * 3;
            } else if (direction === 'up') {
                leftEyeX = snake[i].x * gridSize + eyeSize * 2;
                leftEyeY = snake[i].y * gridSize + eyeSize;
                rightEyeX = snake[i].x * gridSize + gridSize - eyeSize * 3;
                rightEyeY = snake[i].y * gridSize + eyeSize;
            } else { 
                leftEyeX = snake[i].x * gridSize + eyeSize * 2;
                leftEyeY = snake[i].y * gridSize + gridSize - eyeSize * 2;
                rightEyeX = snake[i].x * gridSize + gridSize - eyeSize * 3;
                rightEyeY = snake[i].y * gridSize + gridSize - eyeSize * 2;
            }
            
            ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
            ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
        } 
        else {
            let colorValue = 150 - (i * 10);
            if (colorValue < 50) colorValue = 50;
            ctx.fillStyle = `rgb(0, ${colorValue}, 100)`;
            ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
            
            ctx.fillStyle = `rgba(0, ${colorValue + 30}, 130, 0.5)`;
            ctx.fillRect(snake[i].x * gridSize + 3, snake[i].y * gridSize + 3, gridSize - 6, gridSize - 6);
        }
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }
    
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.fillStyle = '#ff9f9f';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 3,
        food.y * gridSize + gridSize / 3,
        gridSize / 6,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function update() {
    direction = nextDirection;

    let head = {...snake[0]};
    
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        gameOver();
        return;
    }
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        createFood();
        
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 20;
            clearInterval(gameLoop);
            gameLoop = setInterval(gameStep, gameSpeed);
            speedElement.textContent = 'Fast';
        } else if (score % 50 === 0 && gameSpeed <= 50) {
            speedElement.textContent = 'Very Fast';
        }
    } else {
        snake.pop();
    }
    
    draw();
}

function gameStep() {
    update();
}

function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    initGame();
    gameLoop = setInterval(gameStep, gameSpeed);
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
}

function pauseGame() {
    if (!gameRunning) return;
    
    gameRunning = false;
    clearInterval(gameLoop);
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetGame() {
    pauseGame();
    initGame();
    gameStartElement.style.display = 'flex';
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    finalScoreElement.textContent = score;
    
    gameOverElement.style.display = 'flex';
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function changeSpeed(speed) {
    slowSpeedBtn.classList.remove('active');
    normalSpeedBtn.classList.remove('active');
    fastSpeedBtn.classList.remove('active');
    
    if (speed === 'slow') {
        gameSpeed = 200;
        slowSpeedBtn.classList.add('active');
        speedElement.textContent = 'Slow';
    } else if (speed === 'fast') {
        gameSpeed = 100;
        fastSpeedBtn.classList.add('active');
        speedElement.textContent = 'Fast';
    } else {
        gameSpeed = 150;
        normalSpeedBtn.classList.add('active');
        speedElement.textContent = 'Normal';
    }
    
    if (gameRunning) {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, gameSpeed);
    }
}

function handleKeyDown(e) {
    // Prevent default behavior for arrow keys
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
    
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            if (gameRunning) {
                pauseGame();
            } else {
                startGame();
            }
            break;
    }
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGame);
startGameBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);


slowSpeedBtn.addEventListener('click', () => changeSpeed('slow'));
normalSpeedBtn.addEventListener('click', () => changeSpeed('normal'));
fastSpeedBtn.addEventListener('click', () => changeSpeed('fast'));


upBtn.addEventListener('click', () => { if (direction !== 'down') nextDirection = 'up'; });
downBtn.addEventListener('click', () => { if (direction !== 'up') nextDirection = 'down'; });
leftBtn.addEventListener('click', () => { if (direction !== 'right') nextDirection = 'left'; });
rightBtn.addEventListener('click', () => { if (direction !== 'left') nextDirection = 'right'; });

document.addEventListener('keydown', handleKeyDown);

window.addEventListener('load', () => {
    initGame();
    gameStartElement.style.display = 'flex';
});

document.querySelectorAll('.control-btn').forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        button.click();
    });
});