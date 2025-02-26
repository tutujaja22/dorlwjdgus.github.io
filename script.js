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
    dx = 1; // 시작 시 오른쪽
    dy = 0;
    score = 0;

    // 조이스틱 위치 조정
    joystickContainer.style.left = (canvas.offsetLeft + canvas.width / 2 - 50) + "px";
}

function startGame(difficulty) {
    menu.style.display = "none";
    canvas.style.display = "block";
    joystickContainer.style.display = "block";

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
const joystickCenterX = 50; // 조이스틱 컨테이너 중심
const joystickCenterY = 50;
const maxDistance = 30; // 조이스틱 이동 범위

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
        joystickKnob.style.left = "30px";
        joystickKnob.style.top = "30px";
        // 방향 유지 (터치 끝나도 현재 방향으로 계속 감)
    }, { passive: false });
}

function handleJoystick(touch) {
    const rect = joystickContainer.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    // 조이스틱 중심으로부터의 거리 계산
    let deltaX = touchX - joystickCenterX;
    let deltaY = touchY - joystickCenterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 이동 범위 제한
    if (distance > maxDistance) {
        deltaX = (deltaX / distance) * maxDistance;
        deltaY = (deltaY / distance) * maxDistance;
    }

    // 조이스틱 노브 이동
    joystickKnob.style.left = (30 + deltaX) + "px";
    joystickKnob.style.top = (30 + deltaY) + "px";

    // 뱀 방향 설정
    const threshold = 10; // 방향 전환 민감도
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
