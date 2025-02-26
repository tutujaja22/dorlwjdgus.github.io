const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menu = document.getElementById("menu");
const easyBtn = document.getElementById("easyBtn");
const normalBtn = document.getElementById("normalBtn");
const hardBtn = document.getElementById("hardBtn");

// 캔버스 설정
const gridSize = 25;
canvas.width = Math.min(window.innerWidth, 400);
canvas.height = canvas.width;
const tileCount = canvas.width / gridSize;

// 게임 변수
let snake = [{ x: 10, y: 10 }];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
};
let dx = 0;
let dy = 0;
let score = 0;
let speed;
let gameLoop;

// 난이도 설정 함수
function startGame(difficulty) {
    menu.style.display = "none"; // 메뉴 숨기기
    canvas.style.display = "block"; // 캔버스 보이기

    // 난이도별 설정
    if (difficulty === "easy") {
        speed = 4; // 느린 속도
        swipeThreshold = 40; // 덜 민감한 터치
    } else if (difficulty === "normal") {
        speed = 6; // 중간 속도
        swipeThreshold = 30;
    } else if (difficulty === "hard") {
        speed = 8; // 빠른 속도
        swipeThreshold = 20; // 민감한 터치
    }

    // 게임 시작
    gameLoop = setInterval(drawGame, 1000 / speed);
}

// 버튼 이벤트 연결
easyBtn.addEventListener("click", () => startGame("easy"));
normalBtn.addEventListener("click", () => startGame("normal"));
hardBtn.addEventListener("click", () => startGame("hard"));

// 키보드 입력 처리
document.addEventListener("keydown", changeDirection);

// 터치 입력 처리
let touchStartX = 0;
let touchStartY = 0;
let swipeThreshold; // 난이도에 따라 바뀜

canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

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
});

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

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
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
        const speedIncrease = speed * 0.05; // 속도 증가를 더 완만하게 (5%)
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
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    canvas.style.display = "none"; // 캔버스 숨기기
    menu.style.display = "block"; // 메뉴 다시 보이기
}
