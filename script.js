//const cellSize = 40;

const cellHeight = 40; 
const cellWidth = 60; 
const gridSize = 16;

const DOOR_WIDTH = 5;
const door_AI_color = 0x0000FF; // Blue color in hex
const door_human_color = 0xFF0000; // Red color in hex

const grid_width = 960;

const players = {
    'Human': {
        id: 0,
        color: 0xff0000,  // red
        tokensCollected: 0
    },
    'AI': {
        id: 1,
        color: 0x0000ff,  // blue
        tokensCollected: 0
    }
};


let doorAICoords = [];
let doorAIadjusted = [];
let doorHumanCoords = [];
let doorHumanadjusted = [];
let allDoors = [];
let usedGrids = [];
let isDoorRotating = false;
let doorSwitch = false;

let player1TrapTimeStart;
let player2TrapTimeStart;
let currentTime = 0; // Start time in seconds
let gameDuration = 60; // Game lasts for 60 seconds

let playerOneTrapped = false;
let playerTwoTrapped = false;

let rescueStartTime = null;

let trappedDoors = null;

let lastAIUpdate = 0;
const AIUpdateInterval = 500;
let aiStartX = 15;
let aiStartY = 15;

let pathIndex = 0;

let tokenInfo = {
    locations: [],
    subgrid: null
  };

let config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 640,
    backgroundColor: '#D2B48C',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true // set this to true
        }
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

const initialGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

const subGrid = [
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1]
]

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

//console.log(pointsDict);

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

//console.log("door_movements:", door_movements);


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
        const startX = (start[0] - 1) * cellWidth;
        const startY = (start[1] - 1) * cellHeight;
        const endX = end[0] * cellWidth;
        const endY = end[1] * cellHeight;

        // Draw the outer grid wall
        graphics.strokeRect(startX, startY, endX - startX, endY - startY);
    });

    graphics.strokePath();
}

function drawDoor(door, scene) {

    if (isDoorRotating) return; 

    const doorX = door.coord[0] * cellWidth;
    const doorY = door.coord[1] * cellHeight;

    let doorColor;

    // Using a function to find if the door exists in AI or Human coords
    const isDoorInList = (door, list) => {
        return list.some(d => d.coord[0] === door.coord[0] && d.coord[1] === door.coord[1]);
    };

    if (isDoorInList(door, doorAICoords)) {
        doorColor = door_AI_color;

        //console.log("AI door");
    } else if (isDoorInList(door, doorHumanCoords)) {
        doorColor = door_human_color;
        //console.log("Human door");
    } else {
        doorColor = 0xFF00FF;
        //console.log("debug door");  // bright purple for debug
    }

    //const doorGraphics = this.add.graphics({ fillStyle: { color: doorColor } });
    const doorGraphics = scene.add.graphics({ fillStyle: { color: doorColor } });

    if(door.orientation === "V") {
        doorGraphics.fillRect((doorX - DOOR_WIDTH / 2) - cellWidth, doorY - cellHeight, DOOR_WIDTH, cellHeight);
    } else {
        doorGraphics.fillRect(doorX - cellWidth / 2, doorY - DOOR_WIDTH / 2, cellWidth, DOOR_WIDTH);
    }
    
    //this.doorSprites.push(doorGraphics);
    scene.doorSprites.push({graphics: doorGraphics, coord: door.coord});
}

const coverDoor = (doorCoord, scene) => {
  
    // Calculate doorX and doorY based on doorCoord
    const doorX = doorCoord[0] * cellWidth;
    const doorY = doorCoord[1] * cellHeight;
  
    // Create a new Graphics object for the cover
    const coverGraphics = scene.add.graphics();
    
    // Set the fill style to the background color (replace with your background color)
    coverGraphics.fillStyle(0xD2B48C);
  
    // Draw the rectangle at the door's position
    coverGraphics.fillRect((doorX - DOOR_WIDTH / 2) - cellWidth, doorY - cellHeight, DOOR_WIDTH, cellHeight);
    console.log("generate covered door");
  
    // Make the cover disappear after a set time (e.g., 1 second)
    scene.time.delayedCall(300, () => {
      coverGraphics.clear();
      console.log("clear covered door");
    });
  };
  

// When you want to find a particular door
function findDoorSprite(coord, doorSprites) {
    for (let i = 0; i < doorSprites.length; i++) {

        if (arraysEqual(doorSprites[i].coord, coord)) {
            return doorSprites[i].graphics; // Return the corresponding doorGraphics object
        }
    }
    return null; // Return null if no match is found
}

function areArraysEquivalent(a, b) {
    //console.log('A:', a, 'B:', b); // This will help you see what's being passed to the function

    if (!Array.isArray(a) || !Array.isArray(b)) {
        return false;
    }
    return a.length === b.length && a.every((v, i) => v === b[i]);
}

function existsInArray(array, element) {
    return array.some(item => 
        areArraysEquivalent(item.coord, element.coord) && 
        item.orientation === element.orientation
    );
}


function update_doors(A, B) {
    for (const elem of A) {
        if (existsInArray(B, elem)) {
            //console.log('Removing from B:', JSON.stringify(elem));
            B = B.filter(bElem => !areArraysEquivalent(bElem.coord, elem.coord) || bElem.orientation !== elem.orientation); // remove from B
        } else {
            //console.log('Adding to B:', JSON.stringify(elem));
            B.push(elem); // add to B
        }
    }
    //console.log('Final B:', JSON.stringify(B));
    return B;
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
    const startExists = validAdjustedDoors.find(door => arraysEqual(door, start));
    const endExists = validAdjustedDoors.find(door => arraysEqual(door, end));
    
    if (startExists) {
        //console.log("Entering the start door they own");
        startExists[0] = startExists[0] === 6 ? 7 : startExists[0];
        startExists[0] = startExists[0] === 13 ? 14 : startExists[0];
        //let door = { coord: startExists, orientation: "V" };
        return startExists;
    } else if (endExists) {
        //console.log("Entering the end door they own");
        endExists[0] = endExists[0] === 6 ? 7 : endExists[0];
        endExists[0] = endExists[0] === 13 ? 14 : endExists[0];
        //let door = { coord: endExists, orientation: "V" };
        return endExists;
    } else {
        //console.log('Entering a door they don\'t own');
        return false;
    }    
    
}

function playerEntersSubgrid(currentX, currentY, newX, newY) {
    let currentPositionInSubgrid = playerInSubgrid(currentX, currentY);
    //console.log("current positioin in subgrid", currentPositionInSubgrid)
    let newPositionInSubgrid = playerInSubgrid(newX, newY);
    //console.log("new positioin in subgrid", newPositionInSubgrid)

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


function onTokenCollected(playerName, scene) {
    let playerData = players[playerName];
    if (playerData.tokensCollected % 3 === 0) {
        addStarTokens(scene, playerData.id);  
    }
}

function addStarTokens(scene, playerID) {
    // Find the player object
    let player = Object.values(players).find(p => p.id === playerID);

    // Exclude the grids that are already used
    let availableGrids = GRIDS.filter(grid => !usedGrids.some(usedGrid => usedGrid.coordinates === grid));

    // Shuffle the availableGrids array to pick a random subgrid
    let shuffledGrids = availableGrids.sort(() => 0.5 - Math.random());

    // If all grids are used, reset usedGrids
    if (shuffledGrids.length === 0) {
        usedGrids = [];
        shuffledGrids = GRIDS.sort(() => 0.5 - Math.random());
    }

    let chosenGrid = shuffledGrids[0];

    if (playerID === 1){

        tokenInfo.locations = [];
        tokenInfo.subgrid = chosenGrid;
        console.log("update tokenInfo");
        console.log(tokenInfo.subgrid);
    }
    
    if (usedGrids.length > 0) {
        //console.log("resetting used grids");
        //console.log(usedGrids);
        usedGrids = usedGrids.filter(usedGrid => usedGrid.playerId !== playerID);
    }

    // Add the chosenGrid along with the player's ID to the usedGrids array
    usedGrids.push({ coordinates: chosenGrid, playerId: playerID });
    
    // Function to add star tokens in the specified grid for a player
    function placeTokens(grid, color) {
        let startX = grid.start[0];
        let startY = grid.start[1];
        let endX = grid.end[0];
        let endY = grid.end[1];

        let count = 0;
        let addedCoordinates = [];

        while (count < 3) {
            let x = Math.floor(Math.random() * (endX - startX + 1) + startX);
            let y = Math.floor(Math.random() * (endY - startY + 1) + startY);

            // Check if the token already exists in the chosen position
            if (!addedCoordinates.some(coord => coord[0] === x && coord[1] === y)) {
                let star = scene.physics.add.sprite((x * cellWidth) - 30, (y * cellHeight) - 20, 'star').setTint(color);
                star.setScale(0.03);
                star.color = color;  
                scene.tokenGroup.add(star);
                
                if (playerID === 1){

                    tokenInfo.locations.push({x, y});
                    console.log(tokenInfo.locations);
                }

                addedCoordinates.push([x, y]);
                count++;
            }
        }
    }

    // Place tokens for the player
    placeTokens(chosenGrid, player.color);
}

function onTokenHit(player, token) {
    let playerName = (player === player1) ? 'Human' : 'AI';
    
    // Check if the player's color matches the token's color
    if (players[playerName].color === token.color) {
        //console.log('Token hit detected.');
        token.destroy();
        
        // Update player's token count
        players[playerName].tokensCollected += 1;
        
        // Call any other necessary functions, e.g., to place more tokens or update score
        onTokenCollected(playerName, this);
    }
}

//let playersMet = false;  // Flag variable, initialized outside of the update loop

function isPlayerinSameCell(player1, player2) {
    const player1CellX = Math.floor(player1.x / cellWidth);
    const player1CellY = Math.floor(player1.y / cellHeight);
    const player2CellX = Math.floor(player2.x / cellWidth);
    const player2CellY = Math.floor(player2.y / cellHeight);
    
    if (player1CellX === player2CellX && player1CellY === player2CellY) {
        return true;
    } else {
        return false;
    }
}

function cellToPixel(cellX) {
    return cellX * cellWidth + cellWidth / 2;
  }

function generateRandomTimeframe() {
    // Generate random start and end time for trapping, between 0 and 60 seconds
    player1TrapTimeStart = Math.floor(Math.random() * 30);
    //player1TrapTimeEnd = player1TrapTimeStart + 5; // 5 seconds trap window
    
    player2TrapTimeStart = Math.floor(Math.random() * 30);
    //player2TrapTimeEnd = player2TrapTimeStart + 5; // 5 seconds trap window
}

// Increment current time and check for game end
function updateGameTime() {
  currentTime++;
  if (currentTime >= gameDuration) {
    // End the game
  }
}
  
function isCloseToDoor(player, nexToDoorPos) {
    let doorStart = nexToDoorPos[0];
    let doorEnd = nexToDoorPos[1];

    const playerCellX = Math.floor(player.x / cellWidth) + 1;
    const playerCellY = Math.floor(player.y / cellHeight) + 1;

    return (playerCellX === doorStart[0] && playerCellY === doorStart[1]) || 
           (playerCellX === doorEnd[0] && playerCellY === doorEnd[1]);
}

function findEndCoordinates(chosenGrid, aiDoors) {
    // Calculate the average y-coordinate of the chosenGrid
    const avgY = (chosenGrid.start[1] + chosenGrid.end[1]) / 2;
    
    // Search through doorAIadjusted to find a door with the same x-coordinate
    // as either the start or end x-coordinate of the chosenGrid and a y-coordinate close to avgY.
    const matchingDoor = aiDoors.find(door => {
      return (door[0] === chosenGrid.start[0] || door[0] === chosenGrid.end[0]) &&
             Math.abs(door[1] - avgY) < 1e-6;  // The '1e-6' is a small tolerance value
    });
  
    console.log("matchingDoor");
    console.log(matchingDoor);
    console.log(doorAIadjusted);

    let endX, endY;
  
    if (matchingDoor) {
      if (matchingDoor[0] === chosenGrid.start[0]) {
        endX = matchingDoor[0] - 2;
      } else if (matchingDoor[0] === chosenGrid.end[0]) {
        endX = matchingDoor[0];
      }
      endY = matchingDoor[1] - 1;
    } else {
      // Handle case where no matching door is found if needed
    }

    console.log(endX, endY);

  
    return [ endX, endY ];
  }


let game = new Phaser.Game(config);

let player1, player2;

function preload() {
    this.load.image('player1', 'p1.png'); 
    this.load.image('player2', 'p2.png');

    this.load.image('star', 'star.png');
}


function create() {
    // Create grid graphics
    let graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF } });
    // Draw vertical lines
    for (let i = 0; i <= gridSize; i++) {
        graphics.moveTo(i * cellWidth, 0);
        graphics.lineTo(i * cellWidth, gridSize * cellHeight);
    }

    // Draw horizontal lines
    for (let i = 0; i <= gridSize; i++) {
        graphics.moveTo(0, i * cellHeight);
        graphics.lineTo(gridSize * cellWidth, i * cellHeight);
    }

    graphics.strokePath();

    this.doorSprites = [];

    // Initialize at the start of the game
    generateRandomTimeframe();

    console.log("player 1 timeframe");

    console.log(player1TrapTimeStart);

    console.log("player 2 timeframe");

    console.log(player2TrapTimeStart);

    // Call this function every second
    setInterval(updateGameTime, 1000);

    calculateDoors();

    createSubGrids.call(this);
    //allDoors.forEach(drawDoor.bind(this));
    allDoors.forEach(door => drawDoor(door, this));

    player1 = this.physics.add.sprite(cellWidth / 2, cellHeight / 2, 'player1').setScale(0.04);
    player1.setCollideWorldBounds(true); 
    player1.name = 'Human'; 
    player1.data = players['Human']; 


    player2 = this.physics.add.sprite(grid_width - cellWidth / 2, this.sys.game.config.height - cellHeight / 2, 'player2').setScale(0.05);
    player2.setCollideWorldBounds(true); 
    player2.name = 'AI'; 
    player2.data = players['AI']; 

    //player ghost for when in the same cell  
    this.player1Ghost = this.add.sprite(cellWidth / 2, cellHeight / 2, 'player1').setScale(0.04);
    this.player2Ghost = this.add.sprite(grid_width - cellWidth / 2, this.sys.game.config.height - cellHeight / 2, 'player2').setScale(0.05);
    this.player1Ghost.setVisible(false);
    this.player2Ghost.setVisible(false);

    easystar = new EasyStar.js();
    easystar.setGrid(initialGrid);
    easystar.setAcceptableTiles([0]); 


    //star token groups
    this.tokenGroup = this.physics.add.group();

    addStarTokens(this, players['Human'].id);
    addStarTokens(this, players['AI'].id);

    this.physics.world.debugGraphic = this.add.graphics().setAlpha(0);

    timeText = this.add.text(970, 10, '', { fontSize: '16px', fill: '#000' });

    // Keyboard controls
    this.input.keyboard.on('keydown', handleKeyDown.bind(this));

    this.physics.add.overlap(player1, this.tokenGroup, onTokenHit.bind(this), null, this);
    this.physics.add.overlap(player2, this.tokenGroup, onTokenHit.bind(this), null, this);

}

function update(time) {

    if (time - lastAIUpdate > AIUpdateInterval) {
        handleAIMovement();
        lastAIUpdate = time;
    }

    if (isPlayerinSameCell(player1, player2)) {
        console.log("Players are in the same cell");

        // Update the position of the ghost sprites to match the real players
        this.player1Ghost.x = player1.x - 7;
        this.player2Ghost.x = player2.x + 7;
        this.player1Ghost.y = player1.y;
        this.player2Ghost.y = player2.y;

        // Hide the real players and show the ghosts
        player1.setVisible(false);
        player2.setVisible(false);
        this.player1Ghost.setVisible(true);
        this.player2Ghost.setVisible(true);
    } else {
        // Show the real players and hide the ghosts
        player1.setVisible(true);
        player2.setVisible(true);
        this.player1Ghost.setVisible(false);
        this.player2Ghost.setVisible(false);
    }

    timeText.setText(`Current Time: ${currentTime}\nPlayer1 Trap Start: ${player1TrapTimeStart}\nPlayer2 Trap Start: ${player2TrapTimeStart}`);

    if(playerOneTrapped === true) {
        if (trappedDoors != null){
            //console.log("trapped door updated");
            if(isCloseToDoor(player2, trappedDoors)) {
                // if(rescueStartTime === null) {
                //     console.log("start counting down");
                //     rescueStartTime = new Date().getTime();
                // }
                // const currentTime = new Date().getTime();
                // if(currentTime - rescueStartTime >= 5000) { // 5000 milliseconds = 5 seconds
                    
                    doorToAdd = doorAICoords.pop();
                    doorHumanCoords.push(doorToAdd);

                    console.log("new human door");
                    console.log(doorHumanCoords);

                    console.log("new AI door");
                    console.log(doorAICoords);

                    doorAIadjusted = doorAICoords.map(door => adjustCoord(door.coord));
                    doorHumanadjusted = doorHumanCoords.map(door => adjustCoord(door.coord));

                    this.doorSprites = [];

                    allDoors.forEach(door => drawDoor(door, this));

                    rescueStartTime = null; // Reset the start time
                    playerOneTrapped = 'red';
                    console.log("saved trapped player");
                }
            // } else {
            // rescueStartTime = null; // Reset the start time
            // }
      }
    }

    if(playerTwoTrapped === true) {
        if (trappedDoors != null){
            //console.log("trapped door updated");
            if(isCloseToDoor(player1, trappedDoors)) {
                // if(rescueStartTime === null) {
                //     console.log("start counting down");
                //     rescueStartTime = new Date().getTime();
                // }
                // const currentTime = new Date().getTime();
                // if(currentTime - rescueStartTime >= 5000) { // 5000 milliseconds = 5 seconds
                    
                    doorToAdd = doorHumanCoords.pop();
                    doorAICoords.push(doorToAdd);

                    console.log("new human door");
                    console.log(doorHumanCoords);

                    console.log("new AI door");
                    console.log(doorAICoords);

                    doorAIadjusted = doorAICoords.map(door => adjustCoord(door.coord));
                    doorHumanadjusted = doorHumanCoords.map(door => adjustCoord(door.coord));

                    this.doorSprites = [];
                    allDoors.forEach(door => drawDoor(door, this));

                    rescueStartTime = null; // Reset the start time
                    playerTwoTrapped = 'blue';
                    console.log("saved trapped player");
                }
            // } else {
            // rescueStartTime = null; // Reset the start time
            // }
      }
    }
}

function handleMovement(player, dx, dy, playerID, scene) {
    let potentialX = player.x + dx;
    let potentialY = player.y + dy;

    let currentGridX = Math.round(player.x / cellWidth);
    let currentGridY = Math.round(player.y / cellHeight);
    let nextGridX = Math.round(potentialX / cellWidth);
    let nextGridY = Math.round(potentialY / cellHeight);

    if (playerID == "Human"){
        doorColor = 0xFF0000;
        doorColorOther = 0x0000FF;
    }else{
        doorColor = 0x0000FF;
        doorColorOther = 0xFF0000;
    }

    // First, check for forbidden moves. If forbidden, we immediately return.
    if (isMoveForbidden(currentGridX, currentGridY, nextGridX, nextGridY)) {
        console.log("Move is forbidden.");
        return;
    }

    if (potentialX > grid_width || potentialX < 0 || potentialY < 0 || potentialY > game.config.height) {
        console.log("Attempt to move out of board detected.");
        return;
    }    

    movement = [[currentGridX, currentGridY], [nextGridX, nextGridY]];
    const cross_door = door_movements.some(door_movement => arraysEqual(door_movement[0], movement[0]) && arraysEqual(door_movement[1], movement[1]));

    if (cross_door != false){
            // Next, check for door crossings
            door_coord = crossesDoor([currentGridX, currentGridY], [nextGridX, nextGridY], playerID);
        if (door_coord) {
            // Movement across the door is allowed
            console.log("door allowed to cross");
            //const targetDoorGraphics = findDoorSprite(door_coord, scene.doorSprites);
            coverDoor(door_coord, scene);
            //console.log("door graphics is");
            //console.log(door_coord);

            if (playerEntersSubgrid(currentGridX, currentGridY, nextGridX, nextGridY)) {
                let whichGrid = findGridForPoint([nextGridX, nextGridY], pointsDict);
                //console.log("which grid", whichGrid);
                if (whichGrid) {
                    let grids = JSON.parse(whichGrid);
                    startGrid = grids[0];
                    endGrid = grids[1];
                }

                let doors = calculateDoorsForSubgrid(startGrid[0], startGrid[1], endGrid[0], endGrid[1]);

                let startDoor = doors[0].coord;
                let endDoor = doors[1].coord;

                trappedDoors = [[startDoor[0], startDoor[1]], [endDoor[0] -1, endDoor[1]]];

                if (playerID === "Human" && currentTime >= player1TrapTimeStart && playerOneTrapped === false && playerTwoTrapped !== true) {

                    // Change both doors to player2's color
                    doorColor = 0x0000FF;
                    console.log("Human trapped");

                    doorTrappedPlayer = { coord: door_coord, orientation: "V" };

                    console.log(doorTrappedPlayer);

                    doorAICoords.push(doorTrappedPlayer);
                    console.log("new AI door", doorAICoords); 

                    let index = -1;
                    for (let i = 0; i < doorHumanCoords.length; i++) {
                    if (arraysEqual(doorHumanCoords[i].coord, doorTrappedPlayer.coord)) {
                        index = i;
                        break;
                    }
                    }

                    if (index > -1) {
                    doorHumanCoords.splice(index, 1);
                    }

                    console.log(index);
                    
                    console.log("new Human door", doorHumanCoords); 

                    console.log("next to trapped door positions");
                    console.log(trappedDoors);

                    doorAIadjusted = doorAICoords.map(door => adjustCoord(door.coord));
                    doorHumanadjusted = doorHumanCoords.map(door => adjustCoord(door.coord));

                    scene.doorSprites = [];
                    allDoors.forEach(door => drawDoor(door, scene));

                    playerOneTrapped = true;

                }

                // Check if within trap timeframe for player2
                if (playerID === "AI" && currentTime >= player2TrapTimeStart && playerTwoTrapped === false && playerOneTrapped !== true) {

                    playerTwoTrapped = true;
                    // Change both doors to player1's color
                    doorColor = 0xFF0000;
                    console.log("AI trapped");

                    doorTrappedPlayer = { coord: door_coord, orientation: "V" };
                    //console.log(doorTrappedPlayer);
                    doorHumanCoords.push(doorTrappedPlayer);
                    console.log("new Human door", doorHumanCoords); 

                    let index = -1;
                    for (let i = 0; i < doorAICoords.length; i++) {
                        if (arraysEqual(doorAICoords[i].coord, doorTrappedPlayer.coord)) {
                            index = i;
                            break;
                        }
                    }

                    if (index > -1) {
                        doorAICoords.splice(index, 1);
                    }
                    console.log(index);
                    
                    console.log("new AI door", doorAICoords); 

                    doorAIadjusted = doorAICoords.map(door => adjustCoord(door.coord));
                    doorHumanadjusted = doorHumanCoords.map(door => adjustCoord(door.coord));

                    scene.doorSprites = [];
                    allDoors.forEach(door => drawDoor(door, scene));
                }

                if (playerOneTrapped !== true && playerTwoTrapped !== true){

                    doorAICoords = update_doors(doors, doorAICoords)
                    doorHumanCoords = update_doors(doors, doorHumanCoords)

                    console.log("new AI door", doorAICoords);
                    console.log("new Human door", doorHumanCoords);

                    doorAIadjusted = doorAICoords.map(door => adjustCoord(door.coord));
                    doorHumanadjusted = doorHumanCoords.map(door => adjustCoord(door.coord));

                    doorSwitch = true;
                    scene.time.delayedCall(300, () => {
                        scene.doorSprites = [];
                        allDoors.forEach(door => drawDoor(door, scene));
                        console.log('entering a subgrid. shuffle door');
                    });
                }

            }

        } else {
            console.log("door not allowed to cross");
            return;
        }
    }else{
        console.log("not door movement");
    }

    player.x = potentialX;
    player.y = potentialY;

}

function handleKeyDown(event) {
    const scene = this;

    switch (event.code) {
        // Player 1
        case 'ArrowUp':
            handleMovement(player1, 0, -cellHeight, "Human", scene);
            break;
        case 'ArrowDown':
            handleMovement(player1, 0, cellHeight, "Human", scene);
            break;
        case 'ArrowLeft':
            handleMovement(player1, -cellWidth, 0, "Human", scene);
            break;
        case 'ArrowRight':
            handleMovement(player1, cellWidth, 0, "Human", scene);
            break;

    }
}

function handleAIMovement() {

    const [endX, endY] = findEndCoordinates(tokenInfo.subgrid, doorAIadjusted);

    easystar.findPath(aiStartX, aiStartY, endX, endY, function(path) {
        if (path === null) {
            console.log("Path was not found.");
        } else {
            moveAIAlongPath(path);
        }
    });
    easystar.calculate(); // Important to run calculations
}

function moveAIAlongPath(path) {

    if (pathIndex < path.length - 1) {
        const nextPoint = path[pathIndex + 1];
        const currentPoint = path[pathIndex];

        aiStartX = nextPoint.x;
        aiStartY = nextPoint.y;

        const dx = nextPoint.x - currentPoint.x;
        const dy = nextPoint.y - currentPoint.y;

        if (dx > 0) {
            handleMovement(player2, cellWidth, 0, "AI", this);
        } else if (dx < 0) {
            handleMovement(player2, -cellWidth, 0, "AI", this);
        } else if (dy > 0) {
            handleMovement(player2, 0, cellHeight, "AI", this);
        } else if (dy < 0) {
            handleMovement(player2, 0, -cellHeight, "AI", this);
        }

        pathIndex++;
    }
}
  


