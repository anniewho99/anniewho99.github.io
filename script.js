let config = {
    type: Phaser.AUTO,
    width: 640, // 16 cells * 40 pixels/cell
    height: 640,
    backgroundColor: '#D2B48C',
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const GRIDS = [
    {start: [3, 3], end: [5, 5]},
    {start: [3, 10], end: [5, 12]},
    {start: [10, 3], end: [12, 5]},
    {start: [10, 10], end: [12, 12]}
];  

function createSubGrids() {
    const graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x8B4513 } }); // Dark brown color
    
    for (let grid of GRIDS) {
        const startX = grid.start[0] * cellSize;
        const startY = grid.start[1] * cellSize;
        const endX = grid.end[0] * cellSize;
        const endY = grid.end[1] * cellSize;

        // Draw top horizontal wall
        graphics.moveTo(startX, startY);
        graphics.lineTo(endX, startY);

        // Draw bottom horizontal wall
        graphics.moveTo(startX, endY);
        graphics.lineTo(endX, endY);

        // Draw left vertical wall
        graphics.moveTo(startX, startY);
        graphics.lineTo(startX, endY);

        // Draw right vertical wall
        graphics.moveTo(endX, startY);
        graphics.lineTo(endX, endY);
    }
    graphics.strokePath();
}


function isWall(x, y) {
    for (let grid of GRIDS) {
        // If it's on the perimeter
        if ((x === grid.start[0] || x === grid.end[0] || y === grid.start[1] || y === grid.end[1]) &&
            x >= grid.start[0] && x <= grid.end[0] && y >= grid.start[1] && y <= grid.end[1]) {

            // Check if the position is a door. If so, it's not a wall.
            if ((x === grid.start[0] + 1 && y === grid.start[1]) || 
                (x === grid.start[0] + 1 && y === grid.end[1])) {
                return false;
            }

            return true; // Otherwise, it's a wall.
        }
    }
    return false; // Default is not a wall.
}


let game = new Phaser.Game(config);

let player1, player2;
const cellSize = 40;
const gridSize = 16;

function preload() {
    this.load.image('player1', 'p1.png'); // Replace with the correct path
    this.load.image('player2', 'p2.png');
}

function handleMovement(player, dx, dy) {
    let potentialX = player.x + dx;
    let potentialY = player.y + dy;

    if (!isWall(potentialX / cellSize, potentialY / cellSize)) {
        player.x = Phaser.Math.Clamp(potentialX, cellSize / 2, game.config.width - cellSize / 2);
        player.y = Phaser.Math.Clamp(potentialY, cellSize / 2, game.config.height - cellSize / 2);
    }
}

function handleKeyDown(event) {
    switch (event.code) {
        // Player 1
        case 'ArrowUp':
            handleMovement(player1, 0, -cellSize);
            break;
        case 'ArrowDown':
            handleMovement(player1, 0, cellSize);
            break;
        case 'ArrowLeft':
            handleMovement(player1, -cellSize, 0);
            break;
        case 'ArrowRight':
            handleMovement(player1, cellSize, 0);
            break;

        // Player 2
        case 'KeyW':
            handleMovement(player2, 0, -cellSize);
            break;
        case 'KeyS':
            handleMovement(player2, 0, cellSize);
            break;
        case 'KeyA':
            handleMovement(player2, -cellSize, 0);
            break;
        case 'KeyD':
            handleMovement(player2, cellSize, 0);
            break;
    }
}



