const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 캔버스 크기를 동적으로 설정
const gridSize = 20;
canvas.width = Math.min(window.innerWidth, 400); // 모바일 화면 너비에 맞춤
canvas.height = canvas.width; // 정사각형 유지
const tileCount = canvas.width / gridSize;

// 뱀과 먹이 초기화
let snake = [{ x: 10, y: 10 }];
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
};
let dx = 0;
let dy = 0;
let score = 0;

// 게임 루프 설정
let speed = 7;
let gameLoop = setInterval(drawGame, 1000 / speed);

// 키보드 입력 처리
document.addEventListener("keydown", changeDirection);

// 터치 입력 처리
let touchStartX = 0;
let touchStartY = 0;

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

    // 스와이프 방향 감지
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // 좌우 스와이프
        if (diffX > 0 && dx !== -1) { // 오른쪽
            dx = 1;
            dy = 0;
        } else if (diffX < 0 && dx !== 1) { // 왼쪽
            dx = -1;
            dy = 0;
        }
    } else {
        // 상하 스와이프
        if (diffY > 0 && dy !== -1) { // 아래
            dx = 0;
            dy = 1;
        } else if (diffY < 0 && dy !== 1) { // 위
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
        speed += 0.5;
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
    speed = 7;
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
    };
    gameLoop = setInterval(drawGame, 1000 / speed);
}