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
