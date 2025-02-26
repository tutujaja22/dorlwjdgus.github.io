const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const easyBtn = document.getElementById("easyBtn");
const normalBtn = document.getElementById("normalBtn");
const hardBtn = document.getElementById("hardBtn");

// 터치 오버레이 추가 (피드백용)
const touchOverlay = document.createElement("div");
touchOverlay.id = "touchOverlay";
document.body.appendChild(touchOverlay);

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
    dx = 1; // 시작 시 오른쪽으로
    dy = 0;
    score = 0;

    // 오버레이 위치 조정
    touchOverlay.style.top = canvas.offsetTop + "px";
    touchOverlay.style.left = canvas.offsetLeft + "px";
}

function startGame(difficulty) {
    menu.style.display = "none";
    canvas.style.display = "block";
    touchOverlay.style.display = "block";

    initGame();

    if (difficulty === "easy") {
        speed = 3; // 더 느리게
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

// 터치 입력 (위치 기반)
function setupTouchListeners() {
    document.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handleTouch(e.touches[0]);
    }, { passive: false });

    document.addEventListener("touchmove", (e) => {
        e.preventDefault();
        handleTouch(e.touches[0]);
    }, { passive: false });

    document.addEventListener("touchend", (e) => {
        touchOverlay.style.background = "transparent"; // 터치 끝나면 피드백 제거
    }, { passive: false });
}

function handleTouch(touch) {
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    console.log("Touch at:", touchX, touchY);

    // 캔버스 내 터치인지 확인
    if (touchX >= 0 && touchX <= canvas.width && touchY >= 0 && touchY <= canvas.height) {
        const halfWidth = canvas.width / 2;
        const halfHeight = canvas.height / 2;

        // 터치 위치에 따라 방향 결정
        if (touchX < halfWidth && touchY < halfHeight && dx !== 1) { // 좌상단: 왼쪽
            dx = -1;
            dy = 0;
            touchOverlay.style.background = "rgba(255, 0, 0, 0.2)"; // 빨간 피드백
        } else if (touchX >= halfWidth && touchY < halfHeight && dx !== -1) { // 우상단: 오른쪽
            dx = 1;
            dy = 0;
            touchOverlay.style.background = "rgba(0, 255, 0, 0.2)"; // 초록 피드백
        } else if (touchX < halfWidth && touchY >= halfHeight && dy !== -1) { // 좌하단: 아래
            dx = 0;
            dy = 1;
            touchOverlay.style.background = "rgba(0, 0, 255, 0.2)"; // 파란 피드백
        } else if (touchX >= halfWidth && touchY >= halfHeight && dy !== 1) { // 우하단: 위
            dx = 0;
            dy = -1;
            touchOverlay.style.background = "rgba(255, 255, 0, 0.2)"; // 노란 피드백
        }
    }
}

setupTouchListeners();

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
    touchOverlay.style.display = "none";
    menu.style.display = "block";
}
