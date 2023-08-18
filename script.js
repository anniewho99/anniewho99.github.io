let gridSize = 16;
let grid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));

let player1 = {
    symbol: "P1",
    position: { x: 0, y: 0 },
    keys: {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
    }
};

let player2 = {
    symbol: "P2",
    position: { x: gridSize - 1, y: gridSize - 1 },
    keys: {
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
    }
};

grid[player1.position.y][player1.position.x] = player1.symbol;
grid[player2.position.y][player2.position.x] = player2.symbol;

let two = new Two({
    width: gridSize * (cellSize + cellGap) - cellGap,
    height: gridSize * (cellSize + cellGap) - cellGap,
    autostart: true
}).appendTo(document.body);

const cellSize = 30;
const cellGap = 2;
let gridGroup = two.makeGroup();

two.bind('update', function(frameCount) {
    renderGrid();
});

function movePlayer(player, direction) {
    grid[player.position.y][player.position.x] = null;
    player.position.x = Math.min(gridSize - 1, Math.max(0, player.position.x + direction.x));
    player.position.y = Math.min(gridSize - 1, Math.max(0, player.position.y + direction.y));
    grid[player.position.y][player.position.x] = player.symbol;
}

document.addEventListener("keydown", (event) => {
    if (player1.keys[event.key]) {
        movePlayer(player1, player1.keys[event.key]);
    } else if (player2.keys[event.key]) {
        movePlayer(player2, player2.keys[event.key]);
    }
});

function renderGrid() {
    gridGroup.remove(gridGroup.children);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const xPos = x * (cellSize + cellGap);
            const yPos = y * (cellSize + cellGap);
            
            // Create a cell
            let cell = two.makeRectangle(xPos + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize);
            cell.noStroke();
            cell.fill = 'none'; // Transparent by default

            if (grid[y][x] === player1.symbol) {
                cell.fill = new Two.Texture('p1.png');
            } else if (grid[y][x] === player2.symbol) {
                cell.fill = new Two.Texture('p2.png');
            } else {
                // Draw the cell with a background and white border
                let background = two.makeRectangle(xPos + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize);
                background.noStroke();
                background.fill = '#D2B48C';
                gridGroup.add(background);
            }

            gridGroup.add(cell);
        }
    }
}

two.play();
