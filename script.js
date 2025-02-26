const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const easyBtn = document.getElementById("easyBtn");
const normalBtn = document.getElementById("normalBtn");
const hardBtn = document.getElementById("hardBtn");

// 게임 변수
const gridSize = 25;
let snake, food, dx, dy, score, speed, gameLoop, swipeThreshold;

function initGame() {
    // 캔버스 크기 설정 (게임 시작 시마다 초기화)
    canvas.width = Math.min(window.innerWidth - 20, 400); // 여백 고려
    canvas.height = canvas.width;
    const tileCount = canvas.width / gridSize;

    // 게임 초기화
    snake = [{ x: 10, y: 10 }];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
    };
    dx = 0;
    dy = 0;
    score = 0;

    return tileCount;
}

// 난이도 설정 및 게임 시작
function startGame(difficulty) {
    menu.style.display = "none";
    canvas.style.display = "block";

    const tileCount = initGame();

    if (difficulty === "easy") {
        speed = 4;
        swipeThreshold = 40;
    } else if (difficulty === "normal") {
        speed = 6;
        swipeThreshold = 30;
    } else if (difficulty === "hard") {
        speed = 8;
        swipeThreshold = 20;
    }

    if (gameLoop) clearInterval(gameLoop); // 기존 루프 제거
    gameLoop = setInterval(() => drawGame(tileCount), 1000 / speed);
}

// 버튼 이벤트
easyBtn.addEventListener("click", () => startGame("easy"));
normalBtn.addEventListener("click", () => startGame("normal"));
hardBtn.addEventListener("click", () => startGame("hard"));

// 키보드 입력
document.addEventListener("keydown", changeDirection);

// 터치 입력
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > swipeThreshold && dx !== -1) {
            dx = 1;
            dy = 0;
        } else if (diffX < -swipeThreshold && dx !== 1) {
            dx = -1;
            dy = 0;
        }
    } else {
        if (diffY > swipeThreshold && dy !== -1) {
            dx = 0;
            dy = 1;
        } else if (diffY < -swipeThreshold && dy !== 1) {
            dx = 0;
            dy = -1;
        }
    }

    touchStartX = touchEndX;
    touchStartY = touchEndY;
}, { passive: false });

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

function drawGame(tileCount) {
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
        gameLoop = setInterval(() => drawGame(tileCount), 1000 / speed);
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
    menu.style.display = "block";
}
