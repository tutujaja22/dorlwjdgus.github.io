const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const easyBtn = document.getElementById("easyBtn");
const normalBtn = document.getElementById("normalBtn");
const hardBtn = document.getElementById("hardBtn");
const joystickContainer = document.getElementById("joystickContainer");
const joystickKnob = document.getElementById("joystickKnob");

// 게임 변수
const gridSize = 25;
let snake, food, dx, dy, score, speed, gameLoop, tileCount;

function initGame() {
    canvas.width = Math.min(window.innerWidth - 20, 400);
    canvas.height = canvas.width;
    tileCount = canvas.width / gridSize;

    snake = [{ x: 10, y: 10 }];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
    };
    dx = 1;
    dy = 0;
    score = 0;

    // 조이스틱을 캔버스 우측 하단에 배치 (정확히 계산)
    const canvasRect = canvas.getBoundingClientRect();
    const joystickWidth = 120;
    const joystickHeight = 120;
    const offset = 10;

    // body 기준으로 조이스틱 위치 계산 (절대 좌표 사용)
    const bodyRect = document.body.getBoundingClientRect();
    const canvasLeft = canvasRect.left - bodyRect.left;
    const canvasBottom = canvasRect.bottom - bodyRect.top;

    joystickContainer.style.left = (canvasLeft + canvas.width - joystickWidth - offset) + "px"; // 캔버스 우측 끝에서 여백
    joystickContainer.style.top = (canvasBottom - joystickHeight - offset) + "px"; // 캔버스 하단에서 여백
    console.log("Joystick positioned at:", joystickContainer.style.left, joystickContainer.style.top);
}

function startGame(difficulty) {
    menu.style.display = "none";
    canvas.style.display = "block";
    joystickContainer.style.display = "block";
    console.log("Joystick display set to block");

    initGame();

    if (difficulty === "easy") {
        speed = 3;
    } else if (difficulty === "normal") {
        speed = 5;
    } else if (difficulty === "hard") {
        speed = 7;
    }

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, 1000 / speed);
}

easyBtn.addEventListener("click", () => startGame("easy"));
normalBtn.addEventListener("click", () => startGame("normal"));
hardBtn.addEventListener("click", () => startGame("hard"));

// 키보드 입력
document.addEventListener("keydown", changeDirection);

// 조이스틱 입력
let isDragging = false;
const joystickCenterX = 60;
const joystickCenterY = 60;
const maxDistance = 40;

function setupJoystickListeners() {
    joystickContainer.addEventListener("touchstart", (e) => {
        e.preventDefault();
        isDragging = true;
        handleJoystick(e.touches[0]);
    }, { passive: false });

    joystickContainer.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (isDragging) {
            handleJoystick(e.touches[0]);
        }
    }, { passive: false });

    joystickContainer.addEventListener("touchend", (e) => {
        isDragging = false;
        joystickKnob.style.left = "35px";
        joystickKnob.style.top = "35px";
    }, { passive: false });
}

function handleJoystick(touch) {
    const rect = joystickContainer.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    let deltaX = touchX - joystickCenterX;
    let deltaY = touchY - joystickCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
    }

    joystickKnob.style.left = (35 + deltaX) + "px";
    joystickKnob.style.top = (35 + deltaY) + "px";

    const threshold = 10;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold && dx !== -1) {
            dx = 1;
            dy = 0;
        } else if (deltaX < -threshold && dx !== 1) {
            dx = -1;
            dy = 0;
        }
    } else {
        if (deltaY > threshold && dy !== -1) {
            dx = 0;
            dy = 1;
        } else if (deltaY < -threshold && dy !== 1) {
            dx = 0;
            dy = -1;
        }
    }
}

setupJoystickListeners();

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) { dx = -1; dy = 0; }
    if (keyPressed === UP_KEY && !goingDown) { dx = 0; dy = -1; }
    if (keyPressed === RIGHT_KEY && !goingLeft) { dx = 1; dy = 0; }
    if (keyPressed === DOWN_KEY && !goingUp) { dx = 0; dy = 1; }
}

function drawGame() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
        };
        const speedIncrease = speed * 0.05;
        speed += speedIncrease;
        clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, 1000 / speed);
    } else {
        snake.pop();
    }

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "green";
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    ctx.fillStyle = "red";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);
}

function gameOver() {
    clearInterval(gameLoop);
    alert("Game Over! Score: " + score);
    canvas.style.display = "none";
    joystickContainer.style.display = "none";
    menu.style.display = "block";
}
