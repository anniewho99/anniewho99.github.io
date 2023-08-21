const cellSize = 40;
const gridSize = 16;

const DOOR_WIDTH = 5;
const door_AI_color = 0x0000FF; // Blue color in hex
const door_human_color = 0xFF0000; // Red color in hex

let doorAICoords = [];
let doorAIadjusted = [];
let doorHumanCoords = [];
let doorHumanadjusted = [];
let allDoors = [];

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
    {start: [4, 4], end: [6, 6]},
    {start: [4, 11], end: [6, 13]},
    {start: [11, 4], end: [13, 6]},
    {start: [11, 11], end: [13, 13]}
];  

const DIRECTIONS = [
    [0, 1],   // up
    [0, -1],  // down
    [-1, 0],  // left
    [1, 0]    // right
];

let pointsDict = {};

for (let grid of GRIDS) {
    let startX = grid.start[0];
    let startY = grid.start[1];
    let endX = grid.end[0];
    let endY = grid.end[1];

    let points = [];
    for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
            points.push([x, y]);
        }
    }

    let key = [grid.start, grid.end];
    pointsDict[JSON.stringify(key)] = points;
}

console.log(pointsDict);

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

let door_movements = [];

for (let grid of GRIDS) {
    let top_middle = [grid['start'][0], grid['start'][1] + 1];
    let bottom_middle = [grid['end'][0], grid['end'][1] - 1];
    let left_middle = [grid['start'][0] + 1, grid['start'][1]];
    let right_middle = [grid['end'][0] - 1, grid['end'][1]];

    // top middle entering and exiting
    door_movements.push([[top_middle[0] - 1, top_middle[1]], top_middle]);
    door_movements.push([top_middle, [top_middle[0] - 1, top_middle[1]]]);

    // bottom middle entering and exiting
    door_movements.push([[bottom_middle[0] + 1, bottom_middle[1]], bottom_middle]);
    door_movements.push([bottom_middle, [bottom_middle[0] + 1, bottom_middle[1]]]);

    // left middle entering and exiting
    door_movements.push([[left_middle[0], left_middle[1] - 1], left_middle]);
    door_movements.push([left_middle, [left_middle[0], left_middle[1] - 1]]);

    // right middle entering and exiting
    door_movements.push([[right_middle[0], right_middle[1] + 1], right_middle]);
    door_movements.push([right_middle, [right_middle[0], right_middle[1] + 1]]);
}

console.log("door_movements:", door_movements);


function isMoveForbidden(currX, currY, nextX, nextY) {
    // Convert positions to strings for easier matching.
    let moveString = [currX, currY, nextX, nextY].toString();
    return forbidden_moves.includes(moveString);
}

function adjustCoord(coord) {
    return [
        coord[0] === 7 ? 6 : (coord[0] === 14 ? 13 : coord[0]),
        coord[1] === 7 ? 6 : (coord[1] === 14 ? 13 : coord[1])
    ];
}

function createSubGrids() {
    // Initialize graphics object for the walls
    const graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x8B4513 } }); // Dark brown color

    // Iterate over each grid
    GRIDS.forEach(grid => {
        const { start, end } = grid;
        const startX = (start[0] - 1) * cellSize;
        const startY = (start[1] - 1) * cellSize;
        const endX = end[0] * cellSize;
        const endY = end[1] * cellSize;

        // Draw the outer grid wall
        graphics.strokeRect(startX, startY, endX - startX, endY - startY);
    });

    graphics.strokePath();
}

function drawDoor(door, scene) {
    const doorX = door.coord[0] * cellSize;
    const doorY = door.coord[1] * cellSize;

    let doorColor;

    // Using a function to find if the door exists in AI or Human coords
    const isDoorInList = (door, list) => {
        return list.some(d => d.coord[0] === door.coord[0] && d.coord[1] === door.coord[1]);
    };

    if (isDoorInList(door, doorAICoords)) {
        doorColor = door_AI_color;

        console.log("AI door");
    } else if (isDoorInList(door, doorHumanCoords)) {
        doorColor = door_human_color;
        console.log("Human door");
    } else {
        doorColor = 0xFF00FF;
        console.log("debug door");  // bright purple for debug
    }

    //const doorGraphics = this.add.graphics({ fillStyle: { color: doorColor } });
    const doorGraphics = scene.add.graphics({ fillStyle: { color: doorColor } });

    if(door.orientation === "V") {
        doorGraphics.fillRect((doorX - DOOR_WIDTH / 2) - cellSize, doorY - cellSize, DOOR_WIDTH, cellSize);
    } else {
        doorGraphics.fillRect(doorX - cellSize / 2, doorY - DOOR_WIDTH / 2, cellSize, DOOR_WIDTH);
    }
    
    //this.doorSprites.push(doorGraphics);
    scene.doorSprites.push(doorGraphics);
}

function update_doors(A, B) {
    let common_elements = A.filter(value => B.includes(value));
    let unique_in_A = A.filter(value => !common_elements.includes(value));
    let unique_in_B = B.filter(value => !common_elements.includes(value));
    return [...unique_in_A, ...unique_in_B];
}

function findGridForPoint(point, pointsDict) {
    for (let key in pointsDict) {
        let points = pointsDict[key];
        for (let i = 0; i < points.length; i++) {
            if (point[0] === points[i][0] && point[1] === points[i][1]) {
                return key;
            }
        }
    }
    return null;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function calculateDoors() {
    for (let grid of GRIDS) {
        const [startX, startY] = grid.start;
        const [endX, endY] = grid.end;

        // Calculate door positions
        const doors = [
            { coord: [startX, Math.floor((endY + startY) / 2)], orientation: "V" },
            { coord: [endX + 1, Math.floor((endY + startY) / 2)], orientation: "V" },
            // Commented out horizontal doors for now
            // { coord: [Math.floor((endX + startX) / 2), endY + 1], orientation: "H" },
            // { coord: [Math.floor((endX + startX) / 2), startY], orientation: "H" }
        ];

        shuffle(doors);

        doorAICoords.push({ ...doors[0]});
        doorHumanCoords.push({ ...doors[1]});

        doorAIadjusted = doorAICoords.map(door => adjustCoord(door.coord));
        doorHumanadjusted = doorHumanCoords.map(door => adjustCoord(door.coord));
        allDoors.push(...doors);
    }

    console.log("door for movement AI:", doorAIadjusted);
    console.log("door for movement Human:", doorHumanadjusted);
    console.log("all_doors:", allDoors);
}

function arraysEqual(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }

    return true;
}

function crossesDoor(start, end, playerID) {
    let validAdjustedDoors;
    if (playerID === "Human") {
        validAdjustedDoors = doorHumanadjusted;
    } else if (playerID === "AI") {
        validAdjustedDoors = doorAIadjusted;
    } else {
        return false; // Invalid player type
    }

    console.log(playerID, validAdjustedDoors)
    console.log(start, end)

    const startExists = validAdjustedDoors.some(door => arraysEqual(door, start));
    const endExists = validAdjustedDoors.some(door => arraysEqual(door, end));

    if (startExists || endExists){
        console.log("Entering the door they own")
        return true
    }else{
        console.log('Entering a door they dont own')
        return false
    }

}

function playerEntersSubgrid(currentX, currentY, newX, newY) {
    let currentPositionInSubgrid = playerInSubgrid(currentX, currentY);
    console.log("current positioin in subgrid", currentPositionInSubgrid)
    let newPositionInSubgrid = playerInSubgrid(newX, newY);
    console.log("new positioin in subgrid", newPositionInSubgrid)

    return (!currentPositionInSubgrid && newPositionInSubgrid);
}

function playerInSubgrid(playerX, playerY) {
    for (let key in pointsDict) {
        let points = pointsDict[key];
        for (let point of points) {
            if (playerX === point[0] && playerY === point[1]) {
                return true;
            }
        }
    }
    return false;
}

function calculateDoorsForSubgrid(startX, startY, endX, endY) {
    const middleY = Math.floor((endY + startY) / 2);
    return [
        { coord: [startX, middleY], orientation: "V" },
        { coord: [endX + 1, middleY], orientation: "V" }
    ];
}


let game = new Phaser.Game(config);

let player1, player2;

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

    this.doorSprites = [];

    calculateDoors();

    createSubGrids.call(this);
    //allDoors.forEach(drawDoor.bind(this));
    allDoors.forEach(door => drawDoor(door, this));

    player1 = this.add.sprite(cellSize / 2, cellSize / 2, 'player1').setScale(0.05); // Assuming your original image is twice the size of the cell.
    player2 = this.add.sprite(this.sys.game.config.width - cellSize / 2, this.sys.game.config.height - cellSize / 2, 'player2').setScale(0.05);

    // Keyboard controls
    this.input.keyboard.on('keydown', handleKeyDown, this.bind(this));
}

function update() {
    // Any continual game logic goes here
}

function handleMovement(player, dx, dy, playerID, scene) {
    let potentialX = player.x + dx;
    let potentialY = player.y + dy;

    let currentGridX = Math.round(player.x / cellSize);
    let currentGridY = Math.round(player.y / cellSize);
    let nextGridX = Math.round(potentialX / cellSize);
    let nextGridY = Math.round(potentialY / cellSize);

    // First, check for forbidden moves. If forbidden, we immediately return.
    if (isMoveForbidden(currentGridX, currentGridY, nextGridX, nextGridY)) {
        console.log("Move is forbidden.");
        return;
    }

    movement = [[currentGridX, currentGridY], [nextGridX, nextGridY]];
    const cross_door = door_movements.some(door_movement => arraysEqual(door_movement[0], movement[0]) && arraysEqual(door_movement[1], movement[1]));

    if (cross_door == true){
            // Next, check for door crossings
        if (crossesDoor([currentGridX, currentGridY], [nextGridX, nextGridY], playerID)) {
            // Movement across the door is allowed
            console.log("door allowed to cross")
            if (playerEntersSubgrid(currentGridX, currentGridY, nextGridX, nextGridY)) {
                // Player has entered a sub-grid, so shuffle doors or perform other required actions.
                console.log('entering a subgrid. shuffle door');
                whichGrid = findGridForPoint([nextGridX, nextGridY], pointsDict);
                console.log("which grid", whichGrid);
                startGrid = whichGrid[0];
                endGrid = whichGrid[1];
                
                doors = calculateDoorsForSubgrid(startGrid[0], startGrid[1], endGrid[0], endGrid[1]);
                console.log(doors);

                doorAICoords = update_doors(doors, doorAICoords)
                doorHumanCoords = update_doors(doors, doorHumanCoords)

                console.log("new AI door", doorAICoords);

                doorAIadjusted = doorAICoords.map(door => adjustCoord(door.coord));
                doorHumanadjusted = doorHumanCoords.map(door => adjustCoord(door.coord));

                //redraw door
                //allDoors.forEach(drawDoor.bind(this));
                allDoors.forEach(door => drawDoor(door, scene));


            }
        } else {
            // If the player is trying to cross a door and it's not allowed, then return
            console.log("door not allowed to cross");
            return;
        }
    }else{
        console.log("not door movement");
    }

    // If we reach here, it means the movement is allowed.
    player.x = Phaser.Math.Clamp(potentialX, cellSize / 2, game.config.width - cellSize / 2);
    player.y = Phaser.Math.Clamp(potentialY, cellSize / 2, game.config.height - cellSize / 2);
}

function handleKeyDown(event) {
    const scene = this;

    switch (event.code) {
        // Player 1
        case 'ArrowUp':
            handleMovement(player1, 0, -cellSize, "Human", scene);
            break;
        case 'ArrowDown':
            handleMovement(player1, 0, cellSize, "Human", scene);
            break;
        case 'ArrowLeft':
            handleMovement(player1, -cellSize, 0, "Human", scene);
            break;
        case 'ArrowRight':
            handleMovement(player1, cellSize, 0, "Human", scene);
            break;

        // Player 2
        case 'KeyW':
            handleMovement(player2, 0, -cellSize, "AI", scene);
            break;
        case 'KeyS':
            handleMovement(player2, 0, cellSize, "AI", scene);
            break;
        case 'KeyA':
            handleMovement(player2, -cellSize, 0, "AI", scene);
            break;
        case 'KeyD':
            handleMovement(player2, cellSize, 0, "AI", scene);
            break;
    }
}



