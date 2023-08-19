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

const DIRECTIONS = [
    [0, 1],   // up
    [0, -1],  // down
    [-1, 0],  // left
    [1, 0]    // right
];

let forbidden_moves = [];

GRIDS.forEach(grid => {
    let corners = [
        grid.start,
        [grid.start[0], grid.end[1]],
        [grid.end[0], grid.start[1]],
        grid.end
    ];
    corners.forEach(corner => {
        DIRECTIONS.forEach(direction => {
            let next_pos = [corner[0] + direction[0], corner[1] + direction[1]];
            if (next_pos[0] < grid.start[0] || next_pos[0] > grid.end[0] || 
                next_pos[1] < grid.start[1] || next_pos[1] > grid.end[1]) {
                forbidden_moves.push([corner, next_pos].toString());
                forbidden_moves.push([next_pos, corner].toString());
            }
        });
    });
});

// Deduplicate forbidden moves
forbidden_moves = Array.from(new Set(forbidden_moves));

function isMoveForbidden(currX, currY, nextX, nextY) {
    // Convert positions to strings for easier matching.
    let moveString = [currX, currY, nextX, nextY].toString();
    return forbidden_moves.includes(moveString);
}

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

let game = new Phaser.Game(config);

let player1, player2;
const cellSize = 40;
const gridSize = 16;

function preload() {
    this.load.image('player1', 'p1.png'); // Replace with the correct path
    this.load.image('player2', 'p2.png');
}


function create() {
    // Create grid graphics
    let graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF } });
    for (let i = 0; i <= gridSize; i++) {
        graphics.moveTo(i * cellSize, 0);
        graphics.lineTo(i * cellSize, gridSize * cellSize);
        graphics.moveTo(0, i * cellSize);
        graphics.lineTo(gridSize * cellSize, i * cellSize);
    }
    graphics.strokePath();

    createSubGrids.call(this);

    player1 = this.add.sprite(cellSize / 2, cellSize / 2, 'player1').setScale(0.05); // Assuming your original image is twice the size of the cell.
    player2 = this.add.sprite(this.sys.game.config.width - cellSize / 2, this.sys.game.config.height - cellSize / 2, 'player2').setScale(0.05);

    // Keyboard controls
    this.input.keyboard.on('keydown', handleKeyDown, this);
}

function update() {
    // Any continual game logic goes here
}

function handleMovement(player, dx, dy) {
    let potentialX = player.x + dx;
    let potentialY = player.y + dy;

    let currentGridX = Math.round(player.x / cellSize);
    let currentGridY = Math.round(player.y / cellSize);
    let nextGridX = Math.round(potentialX / cellSize);
    let nextGridY = Math.round(potentialY / cellSize);

    if (!isMoveForbidden(currentGridX, currentGridY, nextGridX, nextGridY) && !isWall(nextGridX, nextGridY)) {
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



