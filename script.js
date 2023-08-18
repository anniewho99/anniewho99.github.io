const gridSize = 16;
const player1 = { 
    x: 0, 
    y: 0, 
    symbol: "P1", 
    keys: { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" } 
};

const player2 = { 
    x: gridSize - 1, 
    y: gridSize - 1, 
    symbol: "P2", 
    keys: { up: "W", down: "S", left: "A", right: "D" } 
};

let grid = [];

function createGrid() {
    for (let y = 0; y < gridSize; y++) {
        let row = [];
        for (let x = 0; x < gridSize; x++) {
            row.push("");
        }
        grid.push(row);
    }

    grid[player1.y][player1.x] = player1.symbol;
    grid[player2.y][player2.x] = player2.symbol;

    renderGrid();
}

function renderGrid() {
    const gridElement = document.getElementById("grid");
    gridElement.innerHTML = '';

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.innerText = grid[y][x];
            gridElement.appendChild(cell);
        }
    }
}

function movePlayer(player, dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
        grid[player.y][player.x] = "";
        player.x = newX;
        player.y = newY;
        grid[newY][newX] = player.symbol;
        renderGrid();
    }
}

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case player1.keys.up:
            movePlayer(player1, 0, -1);
            break;
        case player1.keys.down:
            movePlayer(player1, 0, 1);
            break;
        case player1.keys.left:
            movePlayer(player1, -1, 0);
            break;
        case player1.keys.right:
            movePlayer(player1, 1, 0);
            break;
        case player2.keys.up:
            movePlayer(player2, 0, -1);
            break;
        case player2.keys.down:
            movePlayer(player2, 0, 1);
            break;
        case player2.keys.left:
            movePlayer(player2, -1, 0);
            break;
        case player2.keys.right:
            movePlayer(player2, 1, 0);
            break;
    }
});

createGrid();
