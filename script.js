document.addEventListener("DOMContentLoaded", function() {
    const gridSize = 16;
    const cellSize = 40;
    let grid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));

    // Player Definitions
    let player1 = {
        symbol: "P1",
        position: { x: 0, y: 0 },
        keys: {
            ArrowUp: { x: 0, y: -1 },
            ArrowRight: { x: 1, y: 0 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
        },
    };

    let player2 = {
        symbol: "P2",
        position: { x: gridSize - 1, y: gridSize - 1 },
        keys: {
            w: { x: 0, y: -1 },
            d: { x: 1, y: 0 },
            s: { x: 0, y: 1 },
            a: { x: -1, y: 0 },
        },
    };

    // Set initial positions for players
    grid[player1.position.y][player1.position.x] = player1.symbol;
    grid[player2.position.y][player2.position.x] = player2.symbol;

    // Create Two.js instance
    let two = new Two({
        width: gridSize * cellSize,
        height: gridSize * cellSize,
        autostart: true
    }).appendTo(document.body);

    // Load the images
    let player1Image = new Image();
    player1Image.onload = function() {
        player2Image.onload = function() {
            two.bind('update', function(frameCount) {
                renderGrid();
            }).play();
        };
        player2Image.src = 'p2.png'; 
    };
    player1Image.src = 'p1.png';

    function renderGrid() {
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const xPos = x * cellSize;
                const yPos = y * cellSize;

                let rectangle = two.makeRectangle(xPos + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize);
                rectangle.fill = '#D2B48C';
                rectangle.stroke = 'white';
                rectangle.linewidth = 2;

                if (grid[y][x] === "P1") {
                    let texture = new Two.Texture(player1Image);
                    let sprite = two.makeRectangle(xPos + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize);
                    sprite.fill = texture;
                } else if (grid[y][x] === "P2") {
                    let texture = new Two.Texture(player2Image);
                    let sprite = two.makeRectangle(xPos + cellSize / 2, yPos + cellSize / 2, cellSize, cellSize);
                    sprite.fill = texture;
                }
            }
        }
    }

    document.addEventListener("keydown", function(event) {
        let move = null;
        if (player1.keys[event.key]) {
            move = player1.keys[event.key];
            movePlayer(player1, move);
        } else if (player2.keys[event.key]) {
            move = player2.keys[event.key];
            movePlayer(player2, move);
        }
    });

    function movePlayer(player, { x, y }) {
        let newX = player.position.x + x;
        let newY = player.position.y + y;

        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            grid[player.position.y][player.position.x] = null;
            player.position.x = newX;
            player.position.y = newY;
            grid[newY][newX] = player.symbol;
        }
    }
});
