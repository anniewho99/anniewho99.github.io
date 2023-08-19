let config = {
    type: Phaser.AUTO,
    width: 640, // 16 cells * 40 pixels/cell
    height: 640,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

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
    this.graphics = this.add.graphics();

    // Draw the grid
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            this.graphics.fillStyle(0xD2B48C, 1); // light brown color
            this.graphics.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            this.graphics.lineStyle(1, 0xFFFFFF, 1); // white border for grid cells
            this.graphics.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }
    //graphics.strokePath();

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
}
