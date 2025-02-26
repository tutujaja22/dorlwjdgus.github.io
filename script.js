const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const easyBtn = document.getElementById("easyBtn");
const normalBtn = document.getElementById("normalBtn");
const hardBtn = document.getElementById("hardBtn");

// 게임 변수
const gridSize = 25;
let snake, food, dx, dy, score, speed, gameLoop, swipeThreshold, tileCount;

function initGame() {
    canvas.width = Math.min(window.innerWidth - 20, 400);
    canvas.height = canvas.width;
    tileCount = canvas.width / gridSize;

    snake = [{ x: 10, y: 10 }];
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
    };
    dx = 1; // 시작 시 오른쪽으로 움직임
    dy = 0;
    score = 0;
}

function startGame(difficulty) {
    menu.style.display = "none";
    canvas.style.display = "block";

    initGame();

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

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, 1000 / speed);
}

easyBtn.addEventListener("click", () => startGame("easy"));
normalBtn.addEventListener("click", () => startGame("normal"));
hardBtn.addEventListener("click", () => startGame("hard"));

// 키보드 입력
document.addEventListener("keydown", changeDirection);

// 터치 입력
let touchStartX = 0;
let touchStartY = 0;

// 터치 이벤트 리스너를 함수로 분리
function setupTouchListeners() {
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        console.log("Touch started at:", touchStartX, touchStartY);
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;

        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        console.log("Touch moved:", diffX, diffY);

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > swipeThreshold && dx !== -1) {
                dx = 1;
                dy = 0;
                console.log("Moving right");
            } else if (diffX < -swipeThreshold && dx !== 1) {
                dx = -1;
                dy = 0;
                console.log("Moving left");
            }
        } else {
            if (diffY > swipeThreshold && dy !== -1) {
                dx = 0;
                dy = 1;
                console.log("Moving down");
            } else if (diffY < -swipeThreshold && dy !== 1) {
                dx = 0;
                dy = -1;
                console.log("Moving up");
            }
        }

        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }, { passive: false });

    canvas.addEventListener("touchend", (e) => {
        console.log("Touch ended");
    }, { passive: false });
}

// 게임 시작 시 터치 리스너 설정
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
    menu.style.display = "block";
}
