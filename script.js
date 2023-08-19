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
    const graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x8B4513} });
    for (let grid of GRIDS) {
        for (let y = grid.start[1]; y <= grid.end[1]; y++) {
            for (let x = grid.start[0]; x <= grid.end[0]; x++) {
                if (y === grid.start[1] || y === grid.end[1] || x === grid.start[0] || x === grid.end[0]) {
                    graphics.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
    }
    graphics.strokePath();
}

function isWall(x, y) {
    for (let grid of GRIDS) {
        if (x >= grid.start[0] && x <= grid.end[0] && y >= grid.start[1] && y <= grid.end[1]) {
            if ((x === grid.start[0] || x === grid.end[0] || y === grid.start[1] || y === grid.end[1])) {
                // Check if the position is a door. If x, y is a door location, return false.
                if ((x === grid.start[0] + 1 && y === grid.start[1]) || 
                    (x === grid.start[0] + 1 && y === grid.end[1])) {
                    return false; // This would make two doors on the top and bottom middle of the subgrid.
                }
                return true; // This position is a wall.
            }
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

function handleKeyDown(event) {
    switch (event.code) {
        // Player 1
        case 'ArrowUp':
            player1.y = Phaser.Math.Clamp(player1.y - cellSize, cellSize / 2, game.config.height - cellSize / 2);
            break;
        case 'ArrowDown':
            player1.y = Phaser.Math.Clamp(player1.y + cellSize, cellSize / 2, game.config.height - cellSize / 2);
            break;
        case 'ArrowLeft':
            player1.x = Phaser.Math.Clamp(player1.x - cellSize, cellSize / 2, game.config.width - cellSize / 2);
            break;
        case 'ArrowRight':
            player1.x = Phaser.Math.Clamp(player1.x + cellSize, cellSize / 2, game.config.width - cellSize / 2);
            break;

        // Player 2
        case 'KeyW':
            player2.y = Phaser.Math.Clamp(player2.y - cellSize, cellSize / 2, game.config.height - cellSize / 2);
            break;
        case 'KeyS':
            player2.y = Phaser.Math.Clamp(player2.y + cellSize, cellSize / 2, game.config.height - cellSize / 2);
            break;
        case 'KeyA':
            player2.x = Phaser.Math.Clamp(player2.x - cellSize, cellSize / 2, game.config.width - cellSize / 2);
            break;
        case 'KeyD':
            player2.x = Phaser.Math.Clamp(player2.x + cellSize, cellSize / 2, game.config.width - cellSize / 2);
            break;
    }

    if (!isWall(potentialX / cellSize, potentialY / cellSize)) {
        player1.x = potentialX;
        player1.y = potentialY;
    }

}
