//const cellSize = 40;

const cellHeight = 40; 
const cellWidth = 60; 
const gridSize = 13;

const DOOR_WIDTH = 5;
const door_AI_color = 0x0000FF; // Blue color in hex
const door_human_color = 0xFF0000; // Red color in hex

const grid_width = 780;

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

const params = new URLSearchParams(window.location.search);
const trapHumanFirst = params.get('tHFirst') === 'true';
const trapAIFirst = params.get('tAFirst') === 'true';  

console.log('trapHumanFirst:', trapHumanFirst);
console.log('trapAIFirst:', trapAIFirst);

let trapTimeForEachRound = {};

let player1TrapTimeStart;
let player2TrapTimeStart;

if (trapHumanFirst) {
    trapTimeForEachRound = {
        0: { human: 200, AI: 200 },
        1: { human: 20, AI: 200 },
        2: { human: 200, AI: 20 },
        3: { human: 20, AI: 60 },
      };
  }
  
  if (trapAIFirst) {
    trapTimeForEachRound = {
        0: { human: 200, AI: 200 },
        1: { human: 200, AI: 20 },
        2: { human: 20, AI: 200 },
        3: { human: 60, AI: 20 },
      };
  }
let doorAICoords = [];
let doorAIadjusted = [];
let doorHumanCoords = [];
let doorHumanadjusted = [];
let allDoors = [];
let usedGrids = [];
let isDoorRotating = false;
let doorSwitch = false;

let currentTime = 0; // Start time in seconds
let gameDuration = 10; 

let playerOneTrapped = false;
let playerTwoTrapped = false;

let rescueStartTime = null;

let trappedDoors = null;

let lastAIUpdate = 0;
// const AIUpdateInterval = 500;

let AIUpdateInterval = 500;

const SLOW_UPDATE_INTERVAL = 800;
const NORMAL_UPDATE_INTERVAL = 500;
let aiStartX = 12;
let aiStartY = 12;

let pathIndex = 0;

let currentTargetIndex = 0;

let isPathBeingFollowed = false;
let currentPath = null; // You can store the current path here

let aiState = "NAVIGATING_TO_SUBGRID";

let localTargets = [];

let otherPlayerinSubgrid = false;

let tokenInfo = {
    locations: [],
    subgrid: null
  };

let trappedAIStartGrid = [];

let aiDoorToLeave = null;

let allTokeninOldGridGone = false;

let timeToSaveTrappedHuman = false;

let oldGrid = [];

let newTokenPlacedForAI = false;

let aiExitStart = [];

let humanTrappedGrid = [];

let humanDoortoLeave = [];

let localAIx = null;

let localAIy = null;

let subgridAI = null;

let runUpdateLogic = null;

let currentRound = 1;

let isTimeoutScheduled = false;

let autoProceedTimeout;

let nextRoundButton;

let startTimer = false;

let config = {
    type: Phaser.AUTO,
    width: 1050,
    height: 520,
    backgroundColor: '#D2B48C',
    // scale: {
    //     mode: Phaser.Scale.NONE, // We will handle the scaling ourselves
    //     autoCenter: Phaser.Scale.CENTER_BOTH,
    // },
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
    {start: [3, 3], end: [5, 5]},
    {start: [3, 9], end: [5, 11]},
    {start: [9, 3], end: [11, 5]},
    {start: [9, 9], end: [11, 11]}
];  

const DIRECTIONS = [
    [0, 1],   // up
    [0, -1],  // down
    [-1, 0],  // left
    [1, 0]    // right
];

  const initialGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
        coord[0] === 6 ? 5 : (coord[0] === 12 ? 11 : coord[0]),
        coord[1] === 6 ? 5 : (coord[1] === 12 ? 11 : coord[1])
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
        startExists[0] = startExists[0] === 5 ? 6 : startExists[0];
        startExists[0] = startExists[0] === 11 ? 12 : startExists[0];
        //let door = { coord: startExists, orientation: "V" };
        return startExists;
    } else if (endExists) {
        //console.log("Entering the end door they own");
        endExists[0] = endExists[0] === 5 ? 6 : endExists[0];
        endExists[0] = endExists[0] === 11 ? 12 : endExists[0];
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

    console.log("playerID for addStarToken");
    console.log(playerID);
    // Find the player object
    let player = Object.values(players).find(p => p.id === playerID);

    // Exclude the grids that are already used
    let availableGrids = GRIDS.filter(grid => 
        !usedGrids.some(usedGrid => arraysEqual(usedGrid.coordinates.start, grid.start)) &&
        (humanTrappedGrid.length === 0 || !arraysEqual(grid.start, humanTrappedGrid)) &&
        (trappedAIStartGrid.length === 0 || !arraysEqual(grid.start, trappedAIStartGrid))
    );

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

                if (playerID === 0){
                    let star = scene.physics.add.sprite((x * cellWidth) - 30, (y * cellHeight) - 20, 'flower').setTint(color).setDepth(0);
                    star.setScale(0.06);
                    star.color = color;  
                    scene.tokenGroup.add(star);
                }else{
                    let star = scene.physics.add.sprite((x * cellWidth) - 30, (y * cellHeight) - 20, 'butterfly').setTint(color).setDepth(0);
                    star.setScale(0.09);
                    star.color = color;  
                    star.index = count;
                    scene.tokenGroup.add(star);
                }
                
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

        // if(playerName === 'AI'){
        //     localTargets[token.index] = [0, 0];
        // }
        
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
    // player1TrapTimeStart = Math.floor(Math.random() * 30);
    //player1TrapTimeEnd = player1TrapTimeStart + 5; // 5 seconds trap window
    
    //player2TrapTimeStart = Math.floor(Math.random() * 30);
    player1TrapTimeStart = 120;
    player2TrapTimeStart = 180;
    //player2TrapTimeEnd = player2TrapTimeStart + 5; // 5 seconds trap window
}

// Increment current time and check for game end
function updateGameTime(scene) {
    currentTime++;
    if (currentTime >= gameDuration && !isTimeoutScheduled) {

        currentRound++;

        if(currentRound > 1){
            gameDuration = 10;
        }
  
        if (currentRound > 4) {
            console.log("Game Over");
            isTimeoutScheduled = true;
        
            // End the game and show post-game content
            endGame(scene);
            return;
        }
  
      isTimeoutScheduled = true;
      scene.overlay.setVisible(true);
      if(scene.messageText) scene.messageText.destroy();
      scene.messageText = scene.add.text(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2, `Welcome to Round ${currentRound}!`, { fontSize: '28px', fill: '#FFF' }).setOrigin(0.5, 0.5).setDepth(1001);
      scene.messageText.setVisible(true);
      scene.instructionText = scene.add.text(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2 + 30, 
                                               "Please use the arrow key to move your player at the top-left corner", 
                                               { fontSize: '20px', fill: '#FFF' })
                                      .setOrigin(0.5, 0.5)
                                      .setDepth(1001)
                                      .setVisible(true);
      scene.instructionText.setVisible(true);
      runUpdateLogic = false;

      nextRoundButton = scene.add.text(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2 + 60, 'Click here to continue', { fontSize: '20px', fill: '#FFF' })
          .setOrigin(0.5, 0.5)
          .setDepth(1001)
          .setInteractive();
      
      nextRoundButton.on('pointerdown', () => {
          proceedToNextRound(scene);
      });
      
      autoProceedTimeout = setTimeout(() => {
          proceedToNextRound(scene);
      }, 60000); // 60 seconds
    }
  }  

function proceedToNextRound(scene) {

    clearTimeout(autoProceedTimeout); // clear the timeout to avoid executing it after user interaction
    
    player1TrapTimeStart = trapTimeForEachRound[currentRound - 1].human;
    player2TrapTimeStart = trapTimeForEachRound[currentRound - 1].AI;
  
    doorAICoords = [];
    doorAIadjusted = [];
    doorHumanCoords = [];
    doorHumanadjusted = [];
    allDoors = [];
    usedGrids = [];
    isDoorRotating = false;
    doorSwitch = false;
  
    playerOneTrapped = false;
    playerTwoTrapped = false;
  
    trappedDoors = null;
  
    pathIndex = 0;
  
    currentTargetIndex = 0;
  
    currentPath = null; 
  
    localTargets = [];
  
    otherPlayerinSubgrid = false;
  
    tokenInfo = {
        locations: [],
        subgrid: null
    };
  
    trappedAIStartGrid = [];
  
    aiDoorToLeave = null;
  
    allTokeninOldGridGone = false;
  
    timeToSaveTrappedHuman = false;
  
    oldGrid = [];
  
    newTokenPlacedForAI = false;
  
    aiExitStart = [];
  
    humanTrappedGrid = [];
  
    humanDoortoLeave = [];
          
    scene.overlay.setVisible(false);
    scene.messageText.setVisible(false);
    scene.instructionText.setVisible(false);
    runUpdateLogic = true;
    currentTime = 0;
  
    player1.x = cellWidth/2;
    player1.y = cellHeight/2;
  
    player2.x = grid_width - cellWidth / 2;
    player2.y = scene.sys.game.config.height - cellHeight / 2;
  
    aiStartX =  12;
    aiStartY = 12;

    localAIx = null;
    localAIy = null;
    subgridAI = null;
  
    players.AI.tokensCollected = 0;
    players.Human.tokensCollected = 0;
  
    scene.doorSprites = [];
    calculateDoors();
    allDoors.forEach(door => drawDoor(door, scene));
  
    scene.tokenGroup.clear(true, true); // This will remove all the tokens from the group and also destroy them
      
    // // Add new tokens for each player
    addStarTokens(scene, players['Human'].id);
    addStarTokens(scene, players['AI'].id);
  
    isPathBeingFollowed = false;
  
    aiState = "NAVIGATING_TO_SUBGRID";
  
    isTimeoutScheduled = false;

    if(nextRoundButton) nextRoundButton.destroy(); 
}

function endGame(scene) {
    // Hide Phaser canvas
    scene.game.canvas.style.display = 'none';

    // Display the post-game content
    document.getElementById('postGameContent').style.display = 'block';
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
  
    // console.log("matchingDoor");
    // console.log(matchingDoor);
    // console.log(doorAIadjusted);

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

    //console.log(endX, endY);
    return [ endX, endY ];
  }

function getLocalCoordinates(globalX, globalY, subgridStartX, subgridStartY) {
    return [globalX - subgridStartX, globalY - subgridStartY];
  }

function getTargetsInLocalCoordinates() {
    localTargets = [];
  
    const [subgridStartX, subgridStartY] = tokenInfo.subgrid.start;
    let [currentX, currentY] = getLocalCoordinates(aiStartX, aiStartY, subgridStartX, subgridStartY);

    currentX = currentX + 2;
    currentY = currentY + 1;
  
    for (const location of tokenInfo.locations) {
        const globalX = location.x + 1;
        const globalY = location.y;
        localTargets.push(getLocalCoordinates(globalX, globalY, subgridStartX, subgridStartY));
    }
  
    // Adding either (0, 1) or (4, 0) based on the AI's current position in the subgrid
    if (currentX === 0 && currentY === 1) {
      localTargets.push([4, 1]);
    } else if (currentX === 4 && currentY === 1) {
      localTargets.push([0, 1]);
    }
  
    return localTargets;
  }
  
let game = new Phaser.Game(config);

let player1, player2;

function preload() {
    this.load.image('player1', 'p1.png'); 
    this.load.image('player2', 'p2.png');

    this.load.image('star', 'star.png');
    this.load.image('flower', 'flower.png');
    this.load.image('butterfly', 'butterfly.png');
}


function create() {

    let messages = [
        ' Thank you for participating in this study. \nPress any key to continue',
        ' Here you are going to play a simple game with a robot player. \n The primary task of the game is to collect tokens \n that has the same color as your avatar. \n Press any key to continue',
        ' There are 5 short rounds of game.\n Each lasts around 90 seconds. \n Press any key to continue',
        ' We will first start with a demo! \n Press any key to continue',
        ' Please use the arrow keys to move your player at the top-left corner. \n Have fun! Press any key to start the demo'
    ];
    let currentMessageIndex = 0;
    
    function displayNextMessage(scene) {
        // If there's another message to show
        if (currentMessageIndex < messages.length) {
            scene.messageText.setText(messages[currentMessageIndex]);
            currentMessageIndex++;
        } else {
            // All messages have been shown, proceed with the game setup
            scene.overlay.setVisible(false);
            scene.messageText.setVisible(false);
            // runUpdateLogic = true;
            setupGameElements(scene);
            // Remove the event listener to avoid further unnecessary executions
            scene.input.keyboard.off('keydown', keyboardCallback);
        }
    }
    
    // Create an overlay and welcome message
    this.overlay = this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0x8B4513).setOrigin(0, 0).setDepth(1000);
    this.overlay.setAlpha(1); // Adjust the alpha for desired transparency
    this.messageText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, '', { fontSize: '24px', fill: '#FFF' }).setOrigin(0.5, 0.5).setDepth(1001);
    
    runUpdateLogic = false;
    
    // Initial display
    displayNextMessage(this);
    
    // Add an event listener for keyboard input
    let keyboardCallback = (event) => {
        displayNextMessage(this);
    };
    this.input.keyboard.on('keydown', keyboardCallback);
    
}

function update(time) {

    if (!runUpdateLogic) return;

    handleAIStateandDecision();

    if(isPathBeingFollowed){
        AIUpdateInterval = handleAIInterval();
    }else{
        AIUpdateInterval = 500;
    }

    if (time - lastAIUpdate > AIUpdateInterval) {
        // If currently following a path, continue moving along it
        if(isPathBeingFollowed){

            if(currentPath !== null){

                if(playerTwoTrapped === true){

                    console.log("AI trapped in which grid");
                    console.log(trappedAIStartGrid);
            
                    moveAIWhenTrapped(trappedAIStartGrid);
            
                }else{
                    moveAIAlongPath(currentPath, this);
                }
            }
        }
        lastAIUpdate = time;
    }
    
    if (otherPlayerinSubgrid === true) {

        console.log("recalculate AI path");

        if(aiState === "COLLECTING"){
            updateDoorWhenInSubgrid(localTargets);
            currentTargetIndex = currentTargetIndex - 1;
            pathIndex = 0;
            otherPlayerinSubgrid = false;
            moveToNextTarget(localTargets);
        }else if(aiState === "NAVIGATING_TO_SUBGRID"){ 
            otherPlayerinSubgrid = false;
            handleAIMovement();
        }

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

    // timeText.setText(`Current Time: ${currentTime}\nPlayer1 Trap Start: ${player1TrapTimeStart}\nPlayer2 Trap Start: ${player2TrapTimeStart}`);

    let totalToken = players.AI.tokensCollected + players.Human.tokensCollected;

    timeText.setText(`Current Time: ${currentTime}\nTotal tokens collected: ${totalToken}`);

    if(playerOneTrapped === true) {
        if (trappedDoors != null){
            //console.log("trapped door updated");
            if(isCloseToDoor(player2, trappedDoors)) {

                console.log("doors in trapped grid");
                console.log(trappedDoors);
                // if(rescueStartTime === null) {
                //     console.log("start counting down");
                //     rescueStartTime = new Date().getTime();
                // }
                // const currentTime = new Date().getTime();
                // if(currentTime - rescueStartTime >= 5000) { // 5000 milliseconds = 5 seconds
                    
                doorToAddHuman = { coord: humanDoortoLeave, orientation: "V" };
                
                doorHumanCoords.push(doorToAddHuman);

                let index = -1;
                for (let i = 0; i < doorAICoords.length; i++) {
                if (arraysEqual(doorAICoords[i].coord, humanDoortoLeave)) {
                    index = i;
                    break;
                }
                }

                if (index > -1) {
                    doorAICoords.splice(index, 1);
                }

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
                console.log("saved trapped human player");
                humanTrappedGrid = [];
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
                console.log("doors in trapped grid");
                console.log(trappedDoors);

                doorToAddAI = { coord: aiDoorToLeave, orientation: "V" };
                doorAICoords.push(doorToAddAI);

                let index = -1;
                for (let i = 0; i < doorHumanCoords.length; i++) {
                if (arraysEqual(doorHumanCoords[i].coord, aiDoorToLeave)) {
                    index = i;
                    break;
                }
                }

                if (index > -1) {
                    doorHumanCoords.splice(index, 1);
                }

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
                console.log("saved trapped AI player");
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

                if (playerID === "Human" && currentTime >= player1TrapTimeStart && playerOneTrapped === false && playerTwoTrapped !== true) {

                    // Change both doors to player2's color
                    doorColor = 0x0000FF;
                    console.log("Human trapped");

                    humanTrappedGrid = startGrid;

                    setTimeout(() => {
                        timeToSaveTrappedHuman = true;
                        console.log('C is set to true');
                      }, 5 * 1000);  // 2 minutes in milliseconds  2 * 60 * 1000

                    doorTrappedPlayer = { coord: door_coord, orientation: "V" };

                    console.log(doorTrappedPlayer);

                    doorAICoords.push(doorTrappedPlayer);
                    console.log("new AI door", doorAICoords); 

                    humanDoortoLeave = doorTrappedPlayer.coord;

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
                    trappedDoors = [[startDoor[0], startDoor[1]], [endDoor[0] -1, endDoor[1]]];

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

                    trappedAIStartGrid = startGrid;
                    trappedDoors = [[startDoor[0], startDoor[1]], [endDoor[0] -1, endDoor[1]]];


                    doorTrappedPlayer = { coord: door_coord, orientation: "V" };
                    aiDoorToLeave = doorTrappedPlayer.coord;
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

                if ((arraysEqual(startGrid, trappedAIStartGrid) !== true) && (arraysEqual(humanTrappedGrid, startGrid)!== true)){

                    if(runUpdateLogic){
                        if(playerID === "Human"){

                            let  currentAIX = Math.round(player2.x / cellWidth) - 1;
                            let currentAIY = Math.round(player2.y / cellHeight) - 1;
    
                            if (arraysEqual(tokenInfo.subgrid.end, endGrid) && aiState === "NAVIGATING_TO_SUBGRID"){
                                console.log("human player enters AI target grid");
                                otherPlayerinSubgrid = true;
                                oldGrid = startGrid;
                                newTokenPlacedForAI = true;
                            }else if ((startGrid[0] - 2 < currentAIX && currentAIX < endGrid[0]) &&
                            (startGrid[1] - 2 < currentAIY && currentAIY < endGrid[1])) {
                                console.log("human player enters the grid AI is in");
                                otherPlayerinSubgrid = true;
                                newTokenPlacedForAI = true;
                                oldGrid = startGrid;
                            }
                        }

                    }

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

//Handle subgrid door navigation
function handleAIMovement() {

    console.log("current token info");
    console.log(tokenInfo);

    console.log("current aiPosition");
    console.log(aiStartX, aiStartY);

   
    const [endX, endY] = findEndCoordinates(tokenInfo.subgrid, doorAIadjusted);
    easystar.findPath(aiStartX, aiStartY, endX, endY, function(path) {
        if (path === null) {
            console.log("Path was not found.");
            isPathBeingFollowed = false; // No path to follow
        } else {
            currentPath = path; // Store the new path
            pathIndex = 0; // Reset the index for the new path
            console.log("the path");
            console.log(currentPath);
            isPathBeingFollowed = true;
        }
    });
    easystar.calculate();

}

//navigate to collect tokens
function moveToNextTarget(localTargets) {

    if (currentTargetIndex < localTargets.length) {

        // while (arraysEqual(localTargets[currentTargetIndex], [0,0])) {
        //     currentTargetIndex++;
        //     if (currentTargetIndex >= localTargets.length) {
        //         break;
        //     }
        // }

        const nextTarget = localTargets[currentTargetIndex];

        console.log("start point for subgrid");
        console.log(localAIx, localAIy);
        easystarSubgrid.findPath(localAIx, localAIy, nextTarget[0], nextTarget[1], function(path) {
            if (path !== null) {
                currentPath = path;
                isPathBeingFollowed = true; // Set this flag to start following this path
                console.log("path to collect tokens");
                console.log(currentPath);
            } else {
                console.error("No path found to target");
            }
        });
        easystarSubgrid.calculate(); // Don't forget to calculate
        currentTargetIndex++;
    } else {
        // Reset index and do something now that all targets have been reached
        currentTargetIndex = 0;
        aiState = "NAVIGATING_TO_SUBGRID";
        isPathBeingFollowed = false; 
        console.log("finished collecting all tokens");
        console.log(aiState);
        aiStartX =  Math.round(player2.x / cellWidth) - 1;
        aiStartY = Math.round(player2.y / cellHeight) -  1;
        console.log("current AI position");
        console.log(aiStartX , aiStartY);
        localAIx = null;
        localAIy = null;
        subgridAI = null;

    }
}

function moveAIAlongPath(path, scene) {

    if (pathIndex < path.length - 1) {
        const nextPoint = path[pathIndex + 1];
        const currentPoint = path[pathIndex];

        if(aiState === "NAVIGATING_TO_SUBGRID" || aiState === "SAVING_STAGE_ONE"){
            aiStartX = nextPoint.x;
            aiStartY = nextPoint.y;
        }else if(aiState == "COLLECTING"){

            localAIx = nextPoint.x;
            localAIy = nextPoint.y;
            console.log("AI position when in collecting mode");
            console.log(localAIx, localAIy);
        }else if(aiState === "SAVING_STAGE_TWO"){
            localAIx = nextPoint.x;
            localAIy = nextPoint.y;
            console.log("AI position when in collecting mode");
            console.log(localAIx, localAIy);
        }

        const dx = nextPoint.x - currentPoint.x;
        const dy = nextPoint.y - currentPoint.y;
        console.log("current point");
        console.log(currentPoint);

        console.log("movement");
        console.log(dx, dy);

        if (dx > 0) {
            handleMovement(player2, cellWidth, 0, "AI", scene);
        } else if (dx < 0) {
            handleMovement(player2, -cellWidth, 0, "AI", scene);
        } else if (dy > 0) {
            handleMovement(player2, 0, cellHeight, "AI", scene);
        } else if (dy < 0) {
            handleMovement(player2, 0, -cellHeight, "AI", scene);
        }

        pathIndex++;

        console.log("pathIndex");
        console.log(pathIndex);

        console.log("this is the next point");
        console.log(aiStartX, aiStartY);

        console.log("current path is");
        console.log(path);
    }

    if (pathIndex === path.length - 1){

        if(aiState === "NAVIGATING_TO_SUBGRID"){
            isPathBeingFollowed = false; 
            pathIndex = 0;
            aiState = "COLLECTING";
        }else if (aiState === "COLLECTING"){
            onComplete();
        }else if (aiState === "SAVING_STAGE_ONE"){
            aiState = "SAVING_STAGE_TWO";
            isPathBeingFollowed = false; 
            pathIndex = 0;
        }else if(aiState === "SAVING_STAGE_TWO"){
            aiState = "NAVIGATING_TO_SUBGRID";
            isPathBeingFollowed = false; 
            pathIndex = 0;

            aiStartX =  Math.round(player2.x / cellWidth) - 1;
            aiStartY = Math.round(player2.y / cellHeight) -  1;

            localAIx = null;
            localAIy = null;
            subgridAI = null;
        }
    }
}

function onComplete() {
    // // Reset any variables or flags that need to be reset
    // isPathBeingFollowed = false;
    pathIndex = 0;
  
    // Start moving to the next target
    moveToNextTarget(localTargets);
}

function updateDoorWhenInSubgrid(arr) {
    // Check if the array is empty
    if (arr.length === 0) {
      return;
    }
  
    // Get the last element
    const lastElement = arr[arr.length - 1];
  
    // Check its value and toggle it
    if (lastElement[0] === 4 && lastElement[1] === 1) {
      arr[arr.length - 1] = [0, 1];
    } else if (lastElement[0] === 0 && lastElement[1] === 1) {
      arr[arr.length - 1] = [4, 1];
    }
  }

function moveAIWhenTrapped(trappedGridStart) {

    console.log("move AI when it is trapped");

    // Pick a random direction
    const randomIndex = Math.floor(Math.random() * 4);
    const [dx, dy] = DIRECTIONS[randomIndex];

    console.log(`AI position (${localAIx}, ${localAIy})`);
    console.log(`Grid start (${trappedGridStart[0]}, ${trappedGridStart[1]})`);

    console.log(`AI position in grid (${localAIx}, ${localAIy})`);
    console.log(`moving direction (${dx}, ${dy})`);

    // Calculate the new proposed position
    const newX = localAIx + dx;
    const newY = localAIy + dy;

    // Check if the new position is within the 3x3 grid
    if (newX >= 1 && newX <= 3 && newY >= 0 && newY <= 2) {
        // Update the AI position
        localAIx = localAIx + dx;
        localAIy = localAIy + dy;

        // Assuming aiSprite is your AI's Phaser sprite and cellSize is the size of each grid cell
        player2.x = player2.x + dx * cellWidth;
        player2.y = player2.y + dy * cellHeight;

        // Debugging output
        console.log(`AI moved to (${localAIy}, ${localAIy})`);
    }
}

function handleSavingStageOne() {
    console.log("current trapped doors");
    console.log(trappedDoors);

    console.log("current aiPosition");
    console.log(aiStartX, aiStartY);

    let path1 = null;
    let path2 = null;

    let [endX1, endY1] = trappedDoors[0];
    let [endX2, endY2] = trappedDoors[1];

    endX1 = endX1 - 2;
    endX2 = endX2;

    endY1 = endY1 - 1;
    endY2 = endY2 - 1;

    // Callback to handle path results
    function handlePathResults() {
        if (path1 && path2) {
            if (path1.length < path2.length) {
                currentPath = path1;
                aiExitStart = [0, 1];
            } else {
                currentPath = path2;
                aiExitStart = [4, 1];
            }
            pathIndex = 0;
            console.log("the path");
            console.log(currentPath);
            isPathBeingFollowed = true;
        }
    }

    // Calculate the first path
    easystar.findPath(aiStartX, aiStartY, endX1, endY1, function (path) {
        path1 = path;
        handlePathResults();
    });

    // Calculate the second path
    easystar.findPath(aiStartX, aiStartY, endX2, endY2, function (path) {
        path2 = path;
        handlePathResults();
    });

    // Make sure to call calculate() to process the pathfinding
    easystar.calculate();
}

function handleSavingStageTwo(){

    localAIx = aiStartX - humanTrappedGrid[0] + 2;
    localAIy = aiStartY - humanTrappedGrid[1] + 1;

    let aiExitEnd = [];

    if (humanDoortoLeave[0] - humanTrappedGrid[0] < 2){
        aiExitEnd = [4, 1];
    }else{
        aiExitEnd = [0, 1];
    }

    if (arraysEqual(aiExitEnd, aiExitStart)){

        if(aiExitStart[0] === 0){

            currentPath = [{ x: 1, y: 1 },{ x: 2, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
            isPathBeingFollowed = true; 

        }else{
            currentPath = [{ x: 3, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }];
            isPathBeingFollowed = true; 
        }
    }else{

        easystarSubgrid.findPath(localAIx, localAIy, aiExitEnd[0], aiExitEnd[1], function(path) {
            if (path !== null) {
                currentPath = path;
                isPathBeingFollowed = true; // Set this flag to start following this path
                console.log("path to exit after saving human agent");
                console.log(currentPath);
            } else {
                console.error("No path found to target");
            }
        });
        easystarSubgrid.calculate(); 

    }

}

function handleAIStateandDecision(){

    if (!isPathBeingFollowed) {
        // If not currently following a path, calculate a new one
        if (aiState === "NAVIGATING_TO_SUBGRID"){
            console.log("NAVIGATING_TO_SUBGRID");
            handleAIMovement();
        }else if(aiState === "COLLECTING"){
            console.log("COLLECTING");
            console.log("local targets");
            localTargets = getTargetsInLocalCoordinates();
            console.log(localTargets);
            subgridAI = tokenInfo.subgrid.start;
            localAIx = aiStartX - subgridAI[0] + 2;
            localAIy = aiStartY - subgridAI[1] + 1;
            moveToNextTarget(localTargets);
        }else if (aiState === "SAVING_STAGE_ONE"){
            console.log("SAVING_STAGE_ONE");
            handleSavingStageOne();
        }else if (aiState === "SAVING_STAGE_TWO"){
            console.log("SAVING_STAGE_TWO");
            handleSavingStageTwo();
        }
    }else if(playerTwoTrapped === 'blue'){

        console.log("AI was saved by human");
        if (arraysEqual(trappedAIStartGrid, tokenInfo.subgrid.start)){
            // currentTargetIndex = players['AI'].tokensCollected % 3;
            currentTargetIndex = 0;
            pathIndex = 0;

            localTargets.sort((a, b) => {
                const aIsZero = arraysEqual(a, [0,0]);
                const bIsZero = arraysEqual(b, [0,0]);
            
                if (aIsZero && !bIsZero) {
                    return -1;
                }
                if (!aIsZero && bIsZero) {
                    return 1;
                }
                return 0;
            });

            console.log("finishing collecting tokens");
            console.log(currentTargetIndex);

            if (aiDoorToLeave[0] - trappedAIStartGrid[0] < 2){
                localTargets[localTargets.length - 1] = [0, 1];
            }else{
                localTargets[localTargets.length - 1] = [4, 1];
            }

            console.log(localTargets);
            moveToNextTarget(localTargets);

            trappedAIStartGrid = [];
        }else{
            currentTargetIndex = 3;
            pathIndex = 0;
            console.log("no tokens to collect, let's get out of here");
            console.log(currentTargetIndex);

            if (aiDoorToLeave[0] - trappedAIStartGrid[0] < 2){
                localTargets[localTargets.length - 1] = [0, 1];
            }else{
                localTargets[localTargets.length - 1] = [4, 1];
            }

            console.log(localTargets);

            allTokeninOldGridGone = true;
            moveToNextTarget(localTargets);
            trappedAIStartGrid = [];
        }

        playerTwoTrapped = 'saving completed';
    }else if (timeToSaveTrappedHuman && aiState === "NAVIGATING_TO_SUBGRID" && playerOneTrapped === true){

        isPathBeingFollowed = false;
        timeToSaveTrappedHuman = false;
        aiState = "SAVING_STAGE_ONE";
        
    }
}

function calculateDirection(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return [dx, dy];
}

function handleAIInterval(){

    if (pathIndex - 1 == -1){
        AIUpdateInterval = SLOW_UPDATE_INTERVAL; 
        return AIUpdateInterval;
    }
    let currentDirection = calculateDirection(currentPath[pathIndex - 1], currentPath[pathIndex]);
    let upcomingDirection = calculateDirection(currentPath[pathIndex], currentPath[pathIndex + 1]);
    
    if (!arraysEqual(currentDirection, upcomingDirection)) {
      AIUpdateInterval = SLOW_UPDATE_INTERVAL; // Adjust interval if direction changed
    } else {
      AIUpdateInterval = NORMAL_UPDATE_INTERVAL;
    }

    return AIUpdateInterval;
    
}

function setupGameElements(scene) {
    initializeDemo(scene);
}

function initializeDemo(scene) {
    // Your initial setup: showing only player 1's sprite and the first instruction.
    // Create grid graphics
    let graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF } });
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
 
    scene.doorSprites = [];

    calculateDoors();
    createSubGrids.call(scene);
    //allDoors.forEach(drawDoor.bind(this));
    allDoors.forEach(door => drawDoor(door, scene));

    player1 = scene.physics.add.sprite(cellWidth / 2, cellHeight / 2, 'player1').setScale(0.04).setDepth(1);
    player1.setCollideWorldBounds(true); 
    player1.name = 'Human'; 
    player1.data = players['Human']; 

    //star token groups
    scene.tokenGroup = scene.physics.add.group();

    addStarTokens(scene, players['Human'].id);

    scene.physics.world.debugGraphic = scene.add.graphics().setAlpha(0);

    // Keyboard controls
    scene.input.keyboard.on('keyup', handleKeyDown.bind(scene));

    scene.physics.add.overlap(player1, scene.tokenGroup, onTokenHit.bind(scene), null, scene);

    scene.messageText.destroy(); 

    scene.messageText = scene.add.text(550, 10, 'In this game, you can see four \nsubgrid on the grid. Press L to continue', { fontSize: '16px', fill: '#000' });
    let LKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    LKey.on('down', function() {
        console.log('L key pressed!');
        displayNextInstruction(scene);
    });
}

let instructions = [
    " You can only go through red doors when entering a subgrid. \n Now try to go through a red door\n Press L when you finish the action",
    " You can only collect red flowers. \n When you finish collecting all red flowers in a subgrid, \n a new group of flowers will appear in another subgrid. \n Press L to continue",
    " Now we will add the robot player to the game. \n It will only collect blue butterflies. \n Press L to start Round 1. \n Have fun!"
];
let currentInstructionIndex = 0;


function displayNextInstruction(scene) {

    currentInstructionIndex++;

    if (currentInstructionIndex < instructions.length) {
        scene.messageText.setText(instructions[currentInstructionIndex]);
    } 
    else {
        // All instructions shown, remove L key listener and proceed with game setup
        scene.input.keyboard.removeKey(Phaser.Input.Keyboard.KeyCodes.L);
        completeSetup(scene);
    }
}

function completeSetup(scene) {
    // Complete the game setup by including everything else you didn't show during the demo.
    // This includes setting up collisions, tokens, keyboard controls, etc.
    // Essentially, everything else from your original `setupGameElements` function.
    scene.messageText.destroy(); 

    setInterval(() => {
        updateGameTime(scene);
    }, 1000);


    player1TrapTimeStart = trapTimeForEachRound[currentRound - 1].human;
    player2TrapTimeStart = trapTimeForEachRound[currentRound - 1].AI;

    player1.x = cellWidth/2;
    player1.y = cellHeight/2;
  
    timeText = scene.add.text(790, 10, '', { fontSize: '16px', fill: '#000' });

    player2 = scene.physics.add.sprite(grid_width - cellWidth / 2, scene.sys.game.config.height - cellHeight / 2, 'player2').setScale(0.05).setDepth(1);
    player2.setCollideWorldBounds(true); 
    player2.name = 'AI'; 
    player2.data = players['AI'];

    easystar = new EasyStar.js();
    easystar.setGrid(initialGrid);
    easystar.setAcceptableTiles([0]); 

    easystarSubgrid = new EasyStar.js();
    easystarSubgrid.setGrid(subGrid);
    easystarSubgrid.setAcceptableTiles([0]);

    scene.player1Ghost = scene.add.sprite(cellWidth / 2, cellHeight / 2, 'player1').setScale(0.04).setDepth(1);
    scene.player2Ghost = scene.add.sprite(grid_width - cellWidth / 2, scene.sys.game.config.height - cellHeight / 2, 'player2').setScale(0.05).setDepth(1);
    scene.player1Ghost.setVisible(false);
    scene.player2Ghost.setVisible(false);

    players.Human.tokensCollected = 0;

    scene.tokenGroup.clear(true, true); // This will remove all the tokens from the group and also destroy them
      
    // // Add new tokens for each player
    addStarTokens(scene, players['Human'].id);
    addStarTokens(scene, players['AI'].id);

    runUpdateLogic = true;

}



