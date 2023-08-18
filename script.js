document.addEventListener("DOMContentLoaded", function() {
    const gridSize = 16;
    const cellSize = 40;
    let grid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(null));

    // Load the images
    let player1Image = new Image();
    player1Image.src = 'p1.png';  // Path to player 1's image

    let player2Image = new Image();
    player2Image.src = 'p2.png'; 

    grid[player1.position.y][player1.position.x] = player1.symbol;
    grid[player2.position.y][player2.position.x] = player2.symbol;

    let two = new Two({
        width: gridSize * cellSize,
        height: gridSize * cellSize,
        autostart: true
    }).appendTo(document.body);

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

    two.bind('update', function(frameCount) {
        renderGrid();
    });

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
