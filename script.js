//const cellSize = 40;
import { writeRealtimeDatabase,writeURLParameters,readRealtimeDatabase,
    blockRandomization,finalizeBlockRandomization,firebaseUserId } from "./firebasepsych1.0.js";

// const cellHeight = 40; 
// const cellWidth = 60; 
// const gridHeight = 13;

// const gridWidth = 15;

// const DOOR_WIDTH = 5;

let betwenGridData = [];

let withinGridData = [];

let withinGridPath = [];

let betwenGridPath = [];

let currentPathLength;

let currentPathTime;

let direction = 1;

let isReplay = "AI";

fetch('adjusted_movement.json')
  .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {

    // Process each key in the fetched object
    Object.values(data).forEach(nestedList => {
      // Concatenate all items into betwenGridData
      betwenGridData = betwenGridData.concat(nestedList);
    });

    // At this point, betwenGridData contains all items from every nested list
    console.log(betwenGridData);
    // Example start and end points
    const startExample = [1, 3];
    const endExample = [5, 9];

          // Find and select a random path with the specified start and end
    const randomPath = findAndSelectRandomPath(betwenGridData, startExample, endExample);

    if (randomPath) {
        console.log('Randomly Selected Path:', randomPath);
    } else {
        console.log('No path could be selected.');
        }

    // Now you can use 'betwenGridData' elsewhere in your script
  })
  .catch(error => {
    console.error('There was a problem with your fetch operation:', error);
  });


  fetch('adjusted_within_movement.json')
  .then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {

    // Process each key in the fetched object
    Object.values(data).forEach(nestedList => {
      // Concatenate all items into withinGridData
      withinGridData = withinGridData.concat(nestedList);
    });

    // At this point, withinGridDataa contains all items from every nested list
    console.log(withinGridData);

    // Now you can use 'bwithinGridData' elsewhere in your script
  })
  .catch(error => {
    console.error('There was a problem with your fetch operation:', error);
  });

let door_AI_color = 0xf0e442;  //yellow 
const door_human_color = 0xE66100; // orange color in hex

// const grid_width = 900;

//force a rebuild
let players = {
    'Human': {
        id: 0,
        color: 0xE66100,  // orange
        tokensCollected: 0
    },
    'AI': {
        id: 1,
        color:  0xf0e442,  //yellow 
        tokensCollected: 0
    }
};

let roundOneColor = 0x7F5FBF; //purple

let roundTwoColor = 0xcc79a7; //pink

let roundThreeColor = 0x0D77B7; //blue

let roundFourColor = 0xf0e442; //yellow

let studyId = 'ExpThreeTest';

const paramsHRI = new URLSearchParams(window.location.search);
const writeToTryoutData = paramsHRI.get('notProlific');

if(writeToTryoutData){
    studyId = 'tests';
}

// Show the user id that is provided by the Firebase Psych library.
console.log( "Firebase UserId=" + firebaseUserId );

const maxCompletionTimeMinutes = 60;

const params = new URLSearchParams(window.location.search);
const showQuestionnaireOnly = params.get('questionnaireOnly');

let trapTimeForEachRound;

// Example 1: Assign a random condition for Viewpoint
const TRAPSEQUENCE = 'A1A2'; // a string we use to represent the condition name
let numConditions = 4; // Number of conditions for this variable
let numDraws = 1; // Number of  assignments (mutually exclusive) we want to sample for this participants
let assignedConditionTemp = await blockRandomization(studyId, TRAPSEQUENCE, numConditions,
  maxCompletionTimeMinutes, numDraws); // the await keyword is mandatory

let assignedCondition = assignedConditionTemp[0];

// //A1A1A1A2, A1A1A2A2, A1A2A2A2, A2A2A2A2
if (assignedCondition === 0){
    trapTimeForEachRound = {
        0: { human: 20, AI: 200, Replay: 777},
        1: { human: 20, AI: 200,  Replay: 777},
        2: { human: 20, AI: 200, Replay: 777 },
        3: { human: 200, AI: 777, Replay: 20 },
      };
}else if( assignedCondition === 1){
    trapTimeForEachRound = {
        0: { human: 20, AI: 200, Replay: 777 },
        1: { human: 20, AI: 200, Replay: 777 },
        2: { human: 200, AI: 777, Replay: 20 },
        3: { human: 200, AI: 777, Replay: 20 },
      };

}else if( assignedCondition === 2){
    trapTimeForEachRound = {
        0: { human: 20, AI: 200, Replay: 777 },
        1: { human: 200, AI: 777, Replay: 20 },
        2: { human: 200, AI: 777, Replay: 20 },
        3: { human: 200, AI: 777, Replay: 20 },
      };
}else if( assignedCondition === 3){
    trapTimeForEachRound = {
        0: { human: 200, AI: 777, Replay: 20 },
        1: { human: 200, AI: 777, Replay: 20 },
        2: { human: 200, AI: 777, Replay: 20 },
        3: { human: 200, AI: 777, Replay: 20 },
      };
}

//A1A1A1A2, A1A1A2A2, A1A2A2A2, A2A2A2A2
// if (assignedCondition === 0){
//     trapTimeForEachRound = {
//         0: { human: 20, AI: 200, Replay: 777 },
//         1: { human: 200, AI: 777, Replay: 20 },
//         2: { human: 200, AI: 777, Replay: 20 },
//         3: { human: 200, AI: 777, Replay: 20 },
//       };
// }else if( assignedCondition === 1){
//     trapTimeForEachRound = {
//         0: { human: 20, AI: 200, Replay: 777 },
//         1: { human: 200, AI: 777, Replay: 20 },
//         2: { human: 200, AI: 777, Replay: 20 },
//         3: { human: 200, AI: 777, Replay: 20 },
//       };

// }else if( assignedCondition === 2){
//     trapTimeForEachRound = {
//         0: { human: 20, AI: 200, Replay: 777 },
//         1: { human: 200, AI: 777, Replay: 20 },
//         2: { human: 200, AI: 777, Replay: 20 },
//         3: { human: 200, AI: 777, Replay: 20 },
//       };
// }else if( assignedCondition === 3){
//     trapTimeForEachRound = {
//         0: { human: 20, AI: 200, Replay: 777 },
//         1: { human: 200, AI: 777, Replay: 20 },
//         2: { human: 200, AI: 777, Replay: 20 },
//         3: { human: 200, AI: 777, Replay: 20 },
//       };
// }

function findAndSelectRandomPath(PathData, start, end) {
    // Filter betwenGridData to find paths that match the given start and end
    const matchingPaths = PathData.filter(pathInfo => {
      const startMatch = JSON.stringify(pathInfo.start) === JSON.stringify(start);
      const endMatch = JSON.stringify(pathInfo.end) === JSON.stringify(end);
      return startMatch && endMatch;
    });

    // Check if there are any matching paths
    if (matchingPaths.length === 0) {
      console.error('No paths found for the specified start and end points.');
      return null;
    }

    // Randomly select one of the matching paths
    const randomIndex = Math.floor(Math.random() * matchingPaths.length);
    const selectedPath = matchingPaths[randomIndex];

    return selectedPath;
}

let trapTimeForEachRoundToSave = JSON.parse(JSON.stringify(trapTimeForEachRound));

for (let round in trapTimeForEachRoundToSave ) {
    if (trapTimeForEachRoundToSave[round].human === 200) {
        trapTimeForEachRoundToSave[round].human = -1;
    }
    if (trapTimeForEachRoundToSave[round].AI === 200) {
        trapTimeForEachRoundToSave[round].AI = -1;
    }
}

console.log(trapTimeForEachRound);

let eventNumber = 0;

let aiData = {};
let humanData = {};

let player1TrapTimeStart;
let player2TrapTimeStart;
let doorAICoords = [];
let doorAIadjusted = [];
let doorHumanCoords = [];
let doorHumanadjusted = [];
let allDoors = [];
let usedGrids = [];
let isDoorRotating = false;
let doorSwitch = false;

let currentTime = 0; // Start time in seconds
let gameDuration = 90; 

let playerOneTrapped = false;
let playerTwoTrapped = false;

let rescueStartTime = null;

let trappedDoors = null;

let lastAIUpdate = 0;
// const AIUpdateInterval = 500;

let AIUpdateInterval = 500;

let lastReplayUpdate = 0;

let ReplayUpdateInterval = 300;

let replayState = "NAVIGATING_TO_SUBGRID";

let currentPlayerDataIndex = 0;

let aiStartX = 14;
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

let tokenInfoHuman = {
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

let nextRoundRectangle;

let startTimer = false;

let timeText;

let easystar;

let easystarSubgrid;

let proceedButton;

let startOfGamePlay;

let isClickable = true;

let instructionShown = false;

let startGamePlay = false;

let fontstyle = document.createElement('style');
fontstyle.type = 'text/css';
fontstyle.innerHTML = `
    @font-face {
        font-family: 'Arcade';
        src: url('fonts/ARCADE.TTF') format('truetype');
    }`;

document.head.appendChild(fontstyle);

let dpr = window.devicePixelRatio || 1;

let config = {
    type: Phaser.AUTO,
    width: 1220 * dpr,
    height: 520 * dpr,
    backgroundColor: '#C8E6C9',
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        resolution: window.devicePixelRatio || 1
    },
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

const cellHeight = 40 * dpr; 
const cellWidth = 60 * dpr; 
const gridHeight = 13;

const gridWidth = 15;

const DOOR_WIDTH = 5 * dpr;

const grid_width = 900 * dpr;

const GRIDS = [
    {start: [3, 3], end: [5, 5]},
    {start: [3, 9], end: [5, 11]},
    {start: [11, 3], end: [13, 5]},
    {start: [11, 9], end: [13, 11]}
];  

const DIRECTIONS = [
    [0, 1],   // up
    [0, -1],  // down
    [-1, 0],  // left
    [1, 0]    // right
];

  const initialGrid = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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

function createTextStyle(fontSize, color) {
    return {
        font: fontSize + "px Arcade",
        fill: color
    };
}


function isMoveForbidden(currX, currY, nextX, nextY) {
    // Convert positions to strings for easier matching.
    let moveString = [currX, currY, nextX, nextY].toString();
    return forbidden_moves.includes(moveString);
}

function adjustCoord(coord) {
    return [
        coord[0] === 6 ? 5 : (coord[0] === 14 ? 13 : coord[0]),
        coord[1] === 6 ? 5 : (coord[1] === 14 ? 13 : coord[1])
    ];
}

function createSubGrids() {
    // Initialize graphics object for the walls
    const graphics = this.add.graphics({ lineStyle: { width: 4, color: 0x696969 } }); // Dark gray color

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
    coverGraphics.fillStyle(0xC8E6C9);
  
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
        startExists[0] = startExists[0] === 13 ? 14 : startExists[0];
        //let door = { coord: startExists, orientation: "V" };
        return startExists;
    } else if (endExists) {
        //console.log("Entering the end door they own");
        endExists[0] = endExists[0] === 5 ? 6 : endExists[0];
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

    if (playerID === 0){

        tokenInfoHuman.locations = [];
        tokenInfoHuman.subgrid = chosenGrid;
        console.log("update tokenInfo for human");
        console.log(tokenInfoHuman.subgrid);
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

            if(playerID === 1 && isReplay === "replay"){

                let gridStart = [grid.start[0] - 2, grid.start[1]];
                let gridEnd = [grid.end[0], grid.end[1] -2];

                let pathStart = findEndCoordinates(chosenGrid, doorAIadjusted);
                let pathEnd;
                if(arraysEqual(pathStart, gridStart)){
                    pathEnd = gridEnd;
                }else{
                    pathEnd = gridStart;
                }
                console.log("Grid Start and End");
                console.log(gridStart, gridEnd);
                withinGridPath = findAndSelectRandomPath(withinGridData, pathStart, pathEnd);
                console.log("in grid path:");
                console.log(withinGridPath);

                let selectedPath = withinGridPath.path[0];
                let sampledPositions = selectedPath.slice(1, 4); 

                //print(sampledPositions);

                sampledPositions.forEach((position, index) => {
                    //let [x, y] = position; // Destructure the position into x and y
                    let x = position[0] + 1;
                    let y = position[1] + 1;
                    // Adjust placement logic as needed for your grid's coordinate system
                    let star = scene.physics.add.sprite((x * cellWidth) - 30 * dpr, (y * cellHeight) - 20 * dpr, 'apple')
                        .setTint(color)
                        .setDepth(0)
                        .setScale(0.15 * dpr);
                    star.color = color;  
                    star.index = index; // Use index or any other identifier as needed
                    scene.tokenGroup.add(star);
                    tokenInfo.locations.push({x, y});
                });
                console.log(tokenInfo.locations);
                count = 3;
            }

            let x = Math.floor(Math.random() * (endX - startX + 1) + startX);
            let y = Math.floor(Math.random() * (endY - startY + 1) + startY);

            // Check if the token already exists in the chosen position
            if (!addedCoordinates.some(coord => coord[0] === x && coord[1] === y)) {

                if (playerID === 0){
                    let star = scene.physics.add.sprite((x * cellWidth) - 30 * dpr, (y * cellHeight) - 20 * dpr, 'flower').setTint(color).setDepth(0);
                    star.setScale(0.06 * dpr);
                    star.color = color;  
                    scene.tokenGroup.add(star);
                }else if(isReplay === "AI"){
                    let star = scene.physics.add.sprite((x * cellWidth) - 30 * dpr, (y * cellHeight) - 20 * dpr, 'butterfly').setTint(color).setDepth(0);
                    star.setScale(0.09 * dpr);
                    star.color = color;  
                    star.index = count;
                    scene.tokenGroup.add(star);
                }
                
                if (playerID === 1 && isReplay === "AI"){

                    tokenInfo.locations.push({x, y});
                    console.log(tokenInfo.locations);
                }

                if (playerID === 0){

                    tokenInfoHuman.locations.push({x, y});
                    console.log(tokenInfoHuman.locations);
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

        if(isClickable === false && players['Human'].tokensCollected === 2){
            isClickable = true;
            if (isClickable) {
                proceedButton.setFillStyle(0x007BFF);
            } else {
                proceedButton.setFillStyle(0xCCCCCC);
            }
        }

        if(isClickable === false && players['AI'].tokensCollected === 2){
            isClickable = true;
            runUpdateLogic = false;
            if (isClickable) {
                proceedButton.setFillStyle(0x007BFF);
            } else {
                proceedButton.setFillStyle(0xCCCCCC);
            }
        }


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

// Increment current time and check for game end
function updateGameTime(scene) {
    currentTime++;
    if (currentTime >= gameDuration && !isTimeoutScheduled) {

        // At the end of each round, save the objects to the database
        let pathnow = studyId+'/participantData/'+firebaseUserId+'/Round' + currentRound;
        writeRealtimeDatabase(pathnow + '/AI', aiData);
        writeRealtimeDatabase(pathnow + '/Human', humanData);

        currentRound++;

        if (currentRound > 4) {
            console.log("Game Over");
            isTimeoutScheduled = true;
            // End the game and show post-game content

            runUpdateLogic = false;
            endGame(scene);
            return;
        }
  
      isTimeoutScheduled = true;
      scene.overlay.setVisible(true);
      if(scene.messageText) scene.messageText.destroy();
      let specificSizeStyle = createTextStyle(25 * dpr, '#000');
      let playerName = "AI"; 
      let tokenType = "Gold";

      if(trapTimeForEachRound[currentRound - 1].AI === 777){
        isReplay = "replay";
      }else if(trapTimeForEachRound[currentRound - 1].Replay === 777){
        isReplay = "AI";
      }

      if(isReplay === "AI"){
        playerName =  "a robot player";
        tokenType = "butterflies";
      }else{
        playerName =  "a human player";
        tokenType = "apples";
      }

      scene.messageText = scene.add.text(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2, `We will now start round ${currentRound} of 4.\nPlease use the arrow keys to move your orange player. \nYou are playing with ${playerName} who collects ${tokenType} this round.`, specificSizeStyle).setOrigin(0.5, 0.5).setDepth(1001);
      scene.messageText.setVisible(true);

      runUpdateLogic = false;

      specificSizeStyle = createTextStyle(20 * dpr, '#FFF');
      nextRoundButton = scene.add.text(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2 + 80 * dpr, 'Proceed', specificSizeStyle)
          .setOrigin(0.5, 0.5)
          .setDepth(1002)
          .setInteractive();
      nextRoundRectangle = scene.add.rectangle(scene.sys.game.config.width / 2, scene.sys.game.config.height / 2 + 80 * dpr, 100 * dpr, 30 * dpr, 0x007BFF).setOrigin(0.5, 0.5).setDepth(1001);

      nextRoundButton.on('pointerdown', () => {
          proceedToNextRound(scene);
      });
      
    //   autoProceedTimeout = setTimeout(() => {
    //       proceedToNextRound(scene);
    //   }, 60000); // 60 seconds
    }
  }  

function proceedToNextRound(scene) {

    // clearTimeout(autoProceedTimeout); // clear the timeout to avoid executing it after user interaction
    
    player1TrapTimeStart = trapTimeForEachRound[currentRound - 1].human;

    if(trapTimeForEachRound[currentRound - 1].AI === 777){
        player2TrapTimeStart = trapTimeForEachRound[currentRound - 1].Replay;
        isReplay = "replay";
    }else if(trapTimeForEachRound[currentRound - 1].Replay === 777){
        player2TrapTimeStart = trapTimeForEachRound[currentRound - 1].AI;
        isReplay = "AI";
    }

    eventNumber = 0;
  
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

    scene.blinkTimer = 0;
    scene.blinkCounter = 0; 
    scene.shouldBlink = false; 
          
    scene.overlay.setVisible(false);
    scene.messageText.setVisible(false);

    runUpdateLogic = true;
    currentTime = 0;

    if(isReplay === "AI"){
        player1.x = cellWidth/2;
        player1.y = cellHeight/2;
      
        player2.x = grid_width - cellWidth / 2;
        player2.y = scene.sys.game.config.height - cellHeight / 2;
    }else if(isReplay === "replay"){
        player2.x = cellWidth/2;
        player2.y = cellHeight/2;
      
        player1.x = grid_width - cellWidth / 2;
        player1.y = scene.sys.game.config.height - cellHeight / 2;
    }

    if(isReplay === "replay"){
        // door_AI_color = 0xcc79a7;
        // players['AI'].color = 0xcc79a7;
        player2.setTexture('player1').setScale(0.04 * dpr).setDepth(1);
        scene.player2Ghost.setTexture('player1').setScale(0.04 * dpr).setDepth(1);
    }

    if(currentRound === 2){
        door_AI_color = roundTwoColor;
        players['AI'].color = roundTwoColor;
    }else if(currentRound === 3){
        door_AI_color = roundThreeColor;
        players['AI'].color = roundThreeColor;
    }else if(currentRound === 4){
        door_AI_color = roundFourColor;
        players['AI'].color = roundFourColor;
    }

    player2.setTint(players['AI'].color);
    scene.player2Ghost.setTint(players['AI'].color);
  
    aiStartX =  14;
    aiStartY = 12;

    localAIx = null;
    localAIy = null;
    subgridAI = null;
  
    players.AI.tokensCollected = 0;
    players.Human.tokensCollected = 0;

    aiData = {};
    humanData = {};
  
    scene.doorSprites = [];
    calculateDoors();
    allDoors.forEach(door => drawDoor(door, scene));
  
    scene.tokenGroup.clear(true, true); // This will remove all the tokens from the group and also destroy them
      
    // // Add new tokens for each player
    addStarTokens(scene, players['Human'].id);
    addStarTokens(scene, players['AI'].id);
  
    isPathBeingFollowed = false;
  
    aiState = "NAVIGATING_TO_SUBGRID";

    replayState = "NAVIGATING_TO_SUBGRID";
  
    isTimeoutScheduled = false;

    if(nextRoundButton) nextRoundButton.destroy(); 

    if(nextRoundRectangle) nextRoundRectangle.destroy();
}

function redirectToProlific() {
    const prolificCompletionUrl = 'https://app.prolific.com/submissions/complete?cc=CBTKA62X';
    window.location.replace(prolificCompletionUrl);
}

function endGame(scene) {
    // Hide Phaser canvas
    scene.game.canvas.style.display = 'none';
    scene.scene.pause();
    // Display the post-game content
    document.getElementById('postGameContent').style.display = 'block';

    // const iconGroups = [
    //     ['icon1', 'p2 copy.png', 'icon5', 'robotyellow.png'],
    //     ['icon2', 'robot2.png', 'icon6', 'robot2yellow.png'],
    //     ['icon3', 'robot3.png', 'icon7', 'robot3yellow.png'],
    //     ['icon4', 'robot4.png', 'icon8', 'robot4yellow.png']
    // ];

    // const humanIconGroups = [
    //     ['humanicon1', 'p1 copy.png', 'humanicon5', 'human1pink.png'],
    //     ['humanicon2', 'human2.png', 'humanicon6', 'human2pink.png'],
    //     ['humanicon3', 'human3.png', 'humanicon7', 'human3pink.png'],
    //     ['humanicon4', 'human4.png', 'humanicon8', 'human4pink.png']
    // ];

    // // Shuffle the groups
    // shuffleArray(iconGroups);

    // shuffleArray(humanIconGroups);

    // // Function to shuffle an array
    // function shuffleArray(array) {
    //     for (let i = array.length - 1; i > 0; i--) {
    //         const j = Math.floor(Math.random() * (i + 1));
    //         [array[i], array[j]] = [array[j], array[i]];
    //     }
    // }

    // // Generate HTML for the shuffled groups
    // const container = document.querySelector('.icon-selection-container');
    // container.innerHTML = ''; // Clear existing content
    // iconGroups.forEach(group => {
    //     group.forEach((icon, index) => {
    //         if (index % 2 === 0) {
    //             const label = document.createElement('label');
    //             label.htmlFor = group[index];
    //             label.innerHTML = `
    //                 <input type="radio" id="${group[index]}" name="robotIcon" value="${group[index]}">
    //                 <img src="${group[index+1]}" alt="Icon ${index / 2 + 1}">
    //             `;
    //             container.appendChild(label);
    //         }
    //     });
    // });

    // const containerHumanIcon = document.querySelector('.human-icon-selection-container');
    // containerHumanIcon.innerHTML = ''; // Clear existing content
    // humanIconGroups.forEach(group => {
    //     group.forEach((icon, index) => {
    //         if (index % 2 === 0) {
    //             const label = document.createElement('label');
    //             label.htmlFor = group[index];
    //             label.innerHTML = `
    //                 <input type="radio" id="${group[index]}" name="humanIcon" value="${group[index]}">
    //                 <img src="${group[index+1]}" alt="Iconhuman ${index / 2 + 1}">
    //             `;
    //             containerHumanIcon.appendChild(label); // Append to containerHumanIcon
    //         }
    //     });
    // });
    

    postGameContent.scrollIntoView();  

    const postGameForm = document.getElementById('feedbackForm');

    postGameForm.addEventListener('submit', function(event) {
        // Prevent the form from submitting in the traditional manner
        event.preventDefault();

        let isExplainFilledCorrectly = true; 

        // let robotIconSelected = document.querySelector('input[name="robotIcon"]:checked') !== null;
        // let humanIconSelected = document.querySelector('input[name="humanIcon"]:checked') !== null;


        let isHelpfulnessRatingFilled = document.querySelector('input[name="helpfulnessRating"]:checked') !== null;
        let isStrategyFilled = document.getElementById('strategy').value.trim() !== ''; 
        let isGameTypeSelected = document.querySelector('input[name="gameType"]:checked') !== null;
        let isGeneralGameTypeSelected = document.querySelector('input[name="generalGameType"]:checked') !== null;
        let isRobotStuckSelected = document.querySelector('input[name="robotStuck"]:checked') !== null;
        let isHelpedRobotSelected = document.querySelector('input[name="helpedRobot"]:checked');

        // Checking the 'helpedRobot' field and the appropriate textarea
        let helpedRobotValue = isHelpedRobotSelected ? isHelpedRobotSelected.value : '';
        let isWhyHelpedFilledCorrectly = false;

        if (helpedRobotValue === 'yes') {
            isWhyHelpedFilledCorrectly = document.getElementById('whyHelped').value.trim() !== '';  
        } else if (helpedRobotValue === 'no') {
            isWhyHelpedFilledCorrectly = document.getElementById('whyNotHelped').value.trim() !== '';
        }

        let isNeitherSelected = document.querySelector('input[name="gameType"]:checked') ? document.querySelector('input[name="gameType"]:checked').value === 'neither': false;

        // Validate 'explain' if 'neither' is selected
        if (isNeitherSelected) {
            isExplainFilledCorrectly = document.getElementById('explainGame').value.trim() !== ''; // Ensure it's non-empty
        }

        const gameTypeValue = document.querySelector('input[name="gameType"]:checked') ? document.querySelector('input[name="gameType"]:checked').value : null;
        const explainValue = gameTypeValue === "neither" && document.getElementById('explain') ? document.getElementById('explain').value : '';

        // Gather data from the form
        if (
            isHelpfulnessRatingFilled &&
            isStrategyFilled &&
            isGameTypeSelected &&
            isGeneralGameTypeSelected &&
            isRobotStuckSelected &&
            isHelpedRobotSelected &&
            isWhyHelpedFilledCorrectly &&
            isExplainFilledCorrectly 
            //&& robotIconSelected && humanIconSelected 
        ){
            const data = {
                helpfulnessRating: document.querySelector('input[name="helpfulnessRating"]:checked').value, 
                strategy: document.getElementById('strategy').value,
                gameType: document.querySelector('input[name="gameType"]:checked').value,
                generalGameType: document.querySelector('input[name="generalGameType"]:checked').value,
                explain: explainValue,
                robotStuck: document.querySelector('input[name="robotStuck"]:checked').value,
                helpedRobot: document.querySelector('input[name="helpedRobot"]:checked').value,
                whyHelped: document.getElementById('whyHelped').value,
                whyNotHelped: document.getElementById('whyNotHelped').value,
                suggestions: document.getElementById('suggestions').value,
                // robotIcon: document.querySelector('input[name="robotIcon"]:checked').value,
                // humantIcon: document.querySelector('input[name="humanIcon"]:checked').value,
            };
            let pathnow = studyId+'/participantData/'+firebaseUserId+'/postGameQuestions';
            let valuenow = data;
            writeRealtimeDatabase(pathnow, valuenow);
            finalizeBlockRandomization(studyId, TRAPSEQUENCE);
            redirectToProlific();

        }else {
            alert("Please fill out all the fields before submitting!");
        }

    });
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
// full screen stuff

/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
/**
 * Turn on Fullscreen
 */
function openFullscreen() {
    document.body.style.overflow = "hidden";
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {/* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}

/* Close fullscreen */
/**
 * Turn off Fullscreen
 */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
    document.body.style.overflow = "visible";
}

function exitHandler() {
    if (currentRound <= 5){
        if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
            alert("Please complete this study in fullscreen mode. Please press F11 to continue in fullscreen mode.");
        }
    }
}

document.addEventListener('fullscreenchange', exitHandler);
document.addEventListener('webkitfullscreenchange', exitHandler);
document.addEventListener('mozfullscreenchange', exitHandler);
document.addEventListener('MSFullscreenChange', exitHandler);
  
let game = new Phaser.Game(config);

let player1, player2;

function preload() {
    this.load.image('player1', 'colorHuman.png'); 
    this.load.image('player2', 'outlineRobot.png');

    this.load.image('star', 'star.png');
    this.load.image('flower', 'flower.png');
    this.load.image('butterfly', 'butterfly.png');
    this.load.image('highlightSprite', 'lock.png');
    this.load.image('replayPlayer', 'replay.png');
    this.load.image('apple', 'apple.png');
}


function create() {

    runUpdateLogic = false;
    // Initially pause the game
    this.scene.pause();

    let gameCanvas = this.sys.game.canvas;
    gameCanvas.style.width = '1220px';
    gameCanvas.style.height = '520px';

   function consentCallback() {
        // Check if the checkbox is checked
        if (document.getElementById('consentcheckbox').checked) {
            // Hide the consent form
            document.getElementById('consentDiv').style.display = 'none';

            // Resume the game
            this.scene.resume();

            openFullscreen();

            displayNextMessage(this);
            // Remove the event listener now that it's no longer needed
            document.getElementById('consentProceed').removeEventListener('click', consentCallback);
        } else {
            alert("You must agree to the terms to proceed.");
        }
    }

    // Setup event listener for the consent button
    document.getElementById('consentProceed').addEventListener('click', consentCallback.bind(this));

    if (showQuestionnaireOnly === 'true') {
        // Show only the questionnaire
        endGame(this);
    }

    let specificSizeStyle = createTextStyle(30 * dpr, '#000');

    let messages = [
        ' You are going to play a simple game with another player. \n The primary goal of the game is to collect tokens. \n You will collect flowers, \n while the other player will collect butterflies or apples.',
        ' There are 4 short rounds of the game.\n Each round lasts 90 seconds.',
        ' You might be playing with a robot player or\n another human player.',
        ' At the beginning of each round,\n you will be told whether you are playing\n with a human or a robot.',
        ' Let’s start with a demo!'
    ];
    let currentMessageIndex = 0;
    
    function displayNextMessage(scene) {

        if (!scene.proceedButton) {
            scene.proceedButton = scene.add.rectangle(scene.sys.game.config.width / 2, scene.sys.game.config.height * 0.65, 100 * dpr, 30 * dpr, 0x007BFF).setOrigin(0.5, 0.5).setInteractive().setDepth(1001);
            
            let specificSizeStyle = createTextStyle(25 * dpr, '#FFF');
            scene.proceedButtonText = scene.add.text(scene.sys.game.config.width / 2, scene.sys.game.config.height * 0.65, 'Proceed', specificSizeStyle).setOrigin(0.5, 0.5).setDepth(1002);
    
            // Button interaction
            scene.proceedButton.on('pointerup', () => {
                displayNextMessage(scene);
            });
        }
        // If there's another message to show
        if (currentMessageIndex < messages.length) {
            scene.messageText.setText(messages[currentMessageIndex]);
            currentMessageIndex++;

            // Show the button when a message is displayed
            scene.proceedButton.setVisible(true);
            scene.proceedButtonText.setVisible(true);
        } else {
            scene.messageText.setVisible(false);
            // runUpdateLogic = true;
            scene.overlay.setVisible(false);
            setupGameElements(scene);
            scene.proceedButton.destroy();
            scene.proceedButtonText.destroy();
        }
    }
    
    let pathnow = studyId+'/participantData/'+firebaseUserId+'/assignedCondition';
    let assignedConditionExplained;

// HHAAA
// AHHAA
// AAHHA
// HAHAA
// AHAHA
// HAAHA

    if(assignedCondition === 0){
        assignedConditionExplained = assignedCondition + "HHAAA";
    }else if (assignedCondition === 1){
        assignedConditionExplained =  assignedCondition + "AHHAA";
    }else if (assignedCondition === 2){
        assignedConditionExplained =  assignedCondition + "AAHHA";
    }else if(assignedCondition === 3){
        assignedConditionExplained =  assignedCondition + "HAHAA";
    }else if(assignedCondition === 4){
        assignedConditionExplained =  assignedCondition + "AHAHA";
    }else if(assignedCondition === 5){
        assignedConditionExplained =  assignedCondition + "HAAHA";
    }


    let valuenow = assignedConditionExplained;
    writeRealtimeDatabase( pathnow , valuenow );

    pathnow = studyId+'/participantData/'+firebaseUserId +'/Trap Time Start For Each Round';
    valuenow = trapTimeForEachRoundToSave;
    writeRealtimeDatabase( pathnow , valuenow );

    pathnow = studyId+'/participantData/'+firebaseUserId+ '/participantInfo';
    writeURLParameters( pathnow );

    // Create an overlay and welcome message
    this.overlay = this.add.rectangle(0, 0, this.sys.game.config.width, this.sys.game.config.height, 0xC8E6C9).setOrigin(0, 0).setDepth(1000);
    this.overlay.setAlpha(1); // Adjust the alpha for desired transparency
    // this.overlay.setVisible(false);
    this.messageText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, '', specificSizeStyle).setOrigin(0.5, 0.5).setDepth(1001);

    this.highlight = this.add.rectangle(0, 0, cellWidth * 3, cellHeight * 3, 0x39FF14, 0.5);
    this.highlight.setVisible(false);

    // Initialize a blink timer
    this.blinkTimer = 0;
    this.blinkInterval = 8; 
    this.blinkCounter = 0; 
    this.shouldBlink = false; 
    this.blinkMax = 4; 

    // this.highlightSprite = this.add.sprite(0, 0, 'highlightSprite').setScale(0.2 * dpr);


    // this.highlightSprite.setVisible(false);

    //  // Create a button using graphics
    //  this.proceedButton = this.add.rectangle(this.sys.game.config.width / 2, this.sys.game.config.height * 0.65, 100, 30, 0x007BFF).setOrigin(0.5, 0.5).setInteractive().setDepth(1001);
    //  // Button label
    //  specificSizeStyle = createTextStyle(25, '#FFF');
    //  this.proceedButtonText = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height * 0.65, 'Proceed', specificSizeStyle).setOrigin(0.5, 0.5).setDepth(1002);
    //  // Initially hide the button
    //  this.proceedButton.setVisible(false);
    //  this.proceedButtonText.setVisible(false);
     
    //  // Button interaction
    //  this.proceedButton.on('pointerup', () => {
    //      displayNextMessage(this);
    //  });
    
    
}

function update(time) {

    if (!runUpdateLogic) return;

    if(isReplay === "AI"){
        handleAIStateandDecision();
    }else if(isReplay === "replay"){
        handleReplayStateandDecision(); 
    }

    if (time - lastReplayUpdate > ReplayUpdateInterval && isReplay === "replay") {

        // If currently following a path, continue moving along it
        if(isPathBeingFollowed){
            if(replayState === "NAVIGATING_TO_SUBGRID" && currentPlayerDataIndex < currentPath.length){
                const nextPosition = currentPath[currentPlayerDataIndex];
                movePlayer2(nextPosition[0], nextPosition[1], this);
                currentPlayerDataIndex++;
            }else if(replayState === "COLLECTING" && currentPlayerDataIndex < currentPath.length){
                const nextPosition = currentPath[currentPlayerDataIndex];
                movePlayer2(nextPosition[0], nextPosition[1], this);
                currentPlayerDataIndex++;
            }else{
                if(replayState === "NAVIGATING_TO_SUBGRID"){
                    replayState = "COLLECTING";
                }else{
                    replayState = "NAVIGATING_TO_SUBGRID";
                }

                isPathBeingFollowed = false;
            }
        }

        if(playerTwoTrapped === true && currentPlayerDataIndex >= 3){
            // Adjust for 0-based index and move according to the current direction
            isPathBeingFollowed = false;
        
            // Correct the index before moving, to ensure it's valid
            const correctedIndex = currentPlayerDataIndex - 2;
            const nextPosition = currentPath[correctedIndex]; // Use corrected index
            moveReplayWhenTrapped(nextPosition[0] + 1, nextPosition[1] + 1);
            replayState = "TRAPPED";
        
            // Move after performing the action, to prepare for the next iteration
            currentPlayerDataIndex += direction;
        
            // Check if we need to reverse the direction for the next move
            if(currentPlayerDataIndex > currentPath.length || currentPlayerDataIndex <= 3){
                direction *= -1; // Reverse the direction
        
                // Adjust currentPlayerDataIndex immediately after reversing direction
                // This ensures we don't step out of bounds or move one extra in the new direction
                currentPlayerDataIndex += direction; // Apply the direction change immediately to correct the position
            }
        }

        if(playerTwoTrapped ==='blue' && replayState === "TRAPPED"){

            if(currentPlayerDataIndex === currentPath.length){
                currentPlayerDataIndex = currentPlayerDataIndex - 1;
            }
            const nextPosition = currentPath[currentPlayerDataIndex - 2];
            if(currentPlayerDataIndex > 1){
                moveReplayToEscape(nextPosition[0] + 1, nextPosition[1] + 1);
                currentPlayerDataIndex = currentPlayerDataIndex - 1;
            }else{
                isPathBeingFollowed = false;
                replayState = "NAVIGATING_TO_SUBGRID";
            }
        }
       

        lastReplayUpdate = time;
    }


    // if(isPathBeingFollowed){
    //     AIUpdateInterval = handleAIInterval();
    // }else{
    //     AIUpdateInterval = 500;
    // }

    // if (playerOneTrapped === true) {
    //     // Position the highlight over player1 and make it visible
    //     this.highlight.setPosition(humanTrappedGrid[0] * cellWidth + 0.5 * cellWidth, humanTrappedGrid[1] * cellHeight + 0.5 * cellHeight);
    //     this.highlight.setVisible(true);
    // } else if (playerTwoTrapped  === true) {
    //     // Position the highlight over player2 and make it visible
    //     this.highlight.setPosition( trappedAIStartGrid[0] * cellWidth + 0.5 * cellWidth,  trappedAIStartGrid[1] * cellHeight + 0.5 * cellHeight);
    //     this.highlight.setVisible(true);
    // } else {
    //     // Hide the highlight when no player is trapped
    //     this.highlight.setVisible(false);
    // }



    if ((playerOneTrapped === true || playerTwoTrapped === true) && !this.shouldBlink) {
        if (!this.blinkStartTimer) {
            this.blinkStartTimer = this.time.now; // Capture the start time
        }

        if (this.time.now - this.blinkStartTimer > 3000) { // 3 seconds
            this.shouldBlink = true; // Start blinking
        }
    }

    if (this.shouldBlink === true) {
        this.blinkTimer++;

        // if (this.blinkCounter == this.blinkMax * 2 - 2){
        //     this.blinkInterval = 50
        // }

        // Toggle visibility based on the blink timer
        if (this.blinkTimer % this.blinkInterval === 0) {
            this.highlight.setVisible(!this.highlight.visible);
            this.blinkCounter++;

            // Stop blinking after 4 blinks
            if (this.blinkCounter >= this.blinkMax * 2) {
                this.shouldBlink = "blinked";
                this.highlight.setVisible(false);
                this.blinkCounter = 0;
                this.blinkStartTimer = null;
            }
        }

        // Position the highlight over the correct player
        if (playerOneTrapped === true) {
            this.highlight.setPosition(humanTrappedGrid[0] * cellWidth + 0.5 * cellWidth, humanTrappedGrid[1] * cellHeight + 0.5 * cellHeight);
        } else if (playerTwoTrapped === true) {
            this.highlight.setPosition(trappedAIStartGrid[0] * cellWidth + 0.5 * cellWidth, trappedAIStartGrid[1] * cellHeight + 0.5 * cellHeight);
        }
    } else {
        // Hide the highlight when no player is trapped
        this.highlight.setVisible(false);
    }

    if (time - lastAIUpdate > AIUpdateInterval && isReplay === "AI") {
        // If currently following a path, continue moving along it
        if(isPathBeingFollowed){

            if(currentPath !== null){

                if(playerTwoTrapped === true){

                    console.log("AI trapped in which grid");
                    console.log(trappedAIStartGrid);
                    aiState = "TRAPPED";
            
                    moveAIWhenTrapped(trappedAIStartGrid);
            
                }else{
                    moveAIAlongPath(currentPath, this);
                }
            }
        }
        lastAIUpdate = time;
    }
    
    if (otherPlayerinSubgrid === true && isReplay === "AI") {

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

    if (otherPlayerinSubgrid === true && isReplay === "replay") {

        console.log("recalculate AI path");

        if(replayState === "COLLECTING"){
            currentPath = currentPath.reverse();
            otherPlayerinSubgrid = false;
            currentPlayerDataIndex = currentPath.length - currentPlayerDataIndex - 1;
            ReplayUpdateInterval = currentPathTime[currentPlayerDataIndex];
        }else if(replayState === "NAVIGATING_TO_SUBGRID"){
            if (withinGridPath.path[0].length === 2) {
                // If betwenGridPath.path is an array, use the first element
                withinGridPath.path = withinGridPath.path.reverse();
            } else {
                // If betwenGridPath.path is not an array, use it directly
                withinGridPath.path[0] = withinGridPath.path[0].reverse();
            }
            reculculateReplayPath();
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

    timeText.setText(`Time elapsed: ${currentTime}\nTotal tokens collected: ${totalToken}`);

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
                    
                let doorToAddHuman = { coord: humanDoortoLeave, orientation: "V" };
                
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

                let doorToAddAI = { coord: aiDoorToLeave, orientation: "V" };
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

    let doorColor;

    let doorColorOther;

    let movement;

    let door_coord;

    let startGrid;

    let endGrid;

    let doorTrappedPlayer;

    // if (playerID == "Human" && isReplay === "AI"){
    //     doorColor = 0xd55e00;
    //     doorColorOther = 0xf0e442;
    // }else if(playerID == "AI" && isReplay === "AI"){
    //     doorColor = 0xf0e442;
    //     doorColorOther = 0xd55e00;
    // }else if(playerID == "Human" && isReplay === "replay"){
    //     doorColor = 0xd55e00;
    //     doorColorOther = 0xcc79a7;
    // }else if(playerID == "AI" && isReplay === "replay"){
    //     doorColor = 0xcc79a7;
    //     doorColorOther = 0xd55e00;
    // }

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

                if(isClickable === false && instructionShown === false){
                    isClickable = true;
                    instructionShown = true;
                    if (isClickable) {
                        proceedButton.setFillStyle(0x007BFF);
                    } else {
                        proceedButton.setFillStyle(0xCCCCCC);
                    }
                }
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
                    doorColor = players['AI'].color;

                    console.log("Human trapped");

                    humanTrappedGrid = startGrid;

                    setTimeout(() => {
                        timeToSaveTrappedHuman = true;
                        console.log('C is set to true');
                      }, 5 * 1000); 

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
                    doorColor = players['Human'].color;
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
                                newTokenPlacedForAI = true;
                            }else if ((startGrid[0] - 2 < currentAIX && currentAIX < endGrid[0]) &&
                            (startGrid[1] - 2 < currentAIY && currentAIY < endGrid[1])) {
                                console.log("human player enters the grid AI is in");
                                otherPlayerinSubgrid = true;
                                newTokenPlacedForAI = true;
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

    if(startGamePlay && currentRound < 6){

        let timestamp = Date.now() - startOfGamePlay;

        eventNumber++;

            // Create local copies of data
        let currentHumanData = {
            "Time since game play (ms)": timestamp,
            "Human Player Position (x,y)": [Math.round(player1.x / cellWidth), Math.round(player1.y / cellHeight)],
            "Human Player Trapped State": playerOneTrapped === true,
            "Human Player Collected Token": players.Human.tokensCollected,
            "Human doors": doorHumanCoords.map(door => door.coord),
            "Human tokens": tokenInfoHuman.locations,
            "Elapsed time in current round": currentTime
        };

        let currentAIData = {
            "Time since game play (ms)": timestamp,
            "AI Player Position (x,y)": [Math.round(player2.x / cellWidth), Math.round(player2.y / cellHeight)],
            "AI State": aiState,
            "AI Player Trapped State": playerTwoTrapped === true,
            "AI Player Collected Token": players.AI.tokensCollected,
            "AI doors": doorAICoords.map(door => door.coord),
            "AI tokens": tokenInfo.locations
        };

        // Now update the main data objects
        humanData[eventNumber] = { ...currentHumanData };
        aiData[eventNumber] = { ...currentAIData };
    }

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

function movePlayer2(x, y, scene) {

    let currentplayerX = Math.round(player2.x / cellWidth);
    let currentplayerY = Math.round(player2.y / cellHeight);
    // // Logic to move Player 2 to position (x, y)
    // player2.x = cellWidth * 0.5 + (x -1) * cellWidth;
    // player2.y = cellHeight * 0.5 + (y - 1) * cellHeight;

    const dx = x - currentplayerX + 1;
    const dy = y - currentplayerY + 1;
    console.log("current point");
    console.log(currentplayerX, currentplayerY);

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


    console.log("player 2 position");
    console.log(player2.x);
    console.log(player2.y);

    ReplayUpdateInterval = currentPathTime[currentPlayerDataIndex];

}

function reculculateReplayPath(){
    let currentplayerX = Math.round(player2.x / cellWidth) - 1;
    let currentplayerY = Math.round(player2.y / cellHeight) - 1;
    const [endX, endY] = findEndCoordinates(tokenInfo.subgrid, doorAIadjusted);

    easystar.findPath(currentplayerX, currentplayerY, endX, endY, function(path) {
        if (path === null) {
            console.log("Path was not found.");
            isPathBeingFollowed = false; // No path to follow
        } else {
            currentPath = path; // Store the new path
            // currentPath = currentPath.map(step => ({
            //     x: step.x + 1,
            //     y: step.y + 1
            // }));
            currentPath = currentPath.map(step => [step.x, step.y]);            
            currentPlayerDataIndex = 1; // Reset the index for the new path
            console.log("the path");
            console.log(currentPath);
            isPathBeingFollowed = true;
            otherPlayerinSubgrid = false;
        }
    });
    easystar.calculate();        

}

function moveReplayWhenTrapped(x, y) {

    player2.x = cellWidth * 0.5 + (x -1) * cellWidth;
    player2.y = cellHeight * 0.5 + (y - 1) * cellHeight;
    ReplayUpdateInterval = currentPathTime[currentPlayerDataIndex - 2] * 3;

}

function moveReplayToEscape(x, y) {

    player2.x = cellWidth * 0.5 + (x -1) * cellWidth;
    player2.y = cellHeight * 0.5 + (y - 1) * cellHeight;
    ReplayUpdateInterval = currentPathTime[currentPlayerDataIndex];

}

function handleReplayStateandDecision(){
    if (!isPathBeingFollowed) {
        if (replayState === "NAVIGATING_TO_SUBGRID"){
            console.log("NAVIGATING_TO_SUBGRID");
            handlReplayMovement();
        }else if(replayState === "COLLECTING"){
            console.log("COLLECTING");
            handlReplayMovement();
        }
    }
}

function handlReplayMovement() {

    console.log("current token info");
    console.log(tokenInfo);

    let currentplayerX = Math.round(player2.x / cellWidth) - 1;
    let currentplayerY = Math.round(player2.y / cellHeight) - 1;
    console.log("current aiPosition");
    console.log(currentplayerX , currentplayerY );

   
    const [endX, endY] = findEndCoordinates(tokenInfo.subgrid, doorAIadjusted);
    console.log([endX, endY]);

    if(replayState === "COLLECTING"){
        isPathBeingFollowed = true;
        replayState = "COLLECTING";
        currentPlayerDataIndex = 1;
        if (withinGridPath.path[0].length === 2) {
            // If betwenGridPath.path is an array, use the first element
            currentPath = withinGridPath.path;
            currentPathLength = withinGridPath.path.length;
        } else {
            // If betwenGridPath.path is not an array, use it directly
            currentPath = withinGridPath.path[0];
            currentPathLength = withinGridPath.path[0].length;
        }
        currentPathTime = withinGridPath.times;
        console.log(replayState);
        console.log(currentPathLength);
        console.log(currentPath);
    }else{
        console.log("current replay positioin");
        console.log(currentplayerX, currentplayerY);
        console.log("goal");
        console.log(endX, endY);
        betwenGridPath = findAndSelectRandomPath(betwenGridData, [currentplayerX, currentplayerY], [endX, endY]);
        replayState = "NAVIGATING_TO_SUBGRID";
        isPathBeingFollowed = true;
        currentPlayerDataIndex = 1;

        if (betwenGridPath.path[0].length === 2) {
            // If betwenGridPath.path is an array, use the first element
            currentPath = betwenGridPath.path;
            currentPathLength = betwenGridPath.path.length;
        } else {
            // If betwenGridPath.path is not an array, use it directly
            currentPath = betwenGridPath.path[0];
            currentPathLength = betwenGridPath.path[0].length;
        }
        currentPathTime = betwenGridPath.times;
        console.log(replayState);
        console.log(currentPathLength);
        console.log(currentPath);
    }

}

//Handle subgrid door navigation
function handleAIMovement() {

    console.log("current token info");
    console.log(tokenInfo);

    console.log("current aiPosition");
    console.log(aiStartX, aiStartY);

   
    const [endX, endY] = findEndCoordinates(tokenInfo.subgrid, doorAIadjusted);

    if(aiStartX === endX && aiStartY === endY){
        isPathBeingFollowed = false;
        aiState = "COLLECTING";
    }

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

        if (localAIx === localTargets[currentTargetIndex][0] && localAIy === localTargets[currentTargetIndex][1]) {
            currentTargetIndex++;
        }

        if(currentTargetIndex === 3 && playerTwoTrapped != 'blue' ){
            const [endX, endY] = findEndCoordinates(oldGrid, doorAIadjusted);

            if (endX - subgridAI[0] > 1){
                localTargets[localTargets.length - 1] = [4, 1];
            }else{
                localTargets[localTargets.length - 1] = [0, 1];
            }
        }

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
        oldGrid = null;

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
            oldGrid = tokenInfo.subgrid;
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

        aiState = "COLLECTING";
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

// function calculateDirection(point1, point2) {
//     const dx = point2.x - point1.x;
//     const dy = point2.y - point1.y;
//     return [dx, dy];
// }

// function handleAIInterval(){

//     if (pathIndex - 1 == -1){
//         AIUpdateInterval = SLOW_UPDATE_INTERVAL; 
//         return AIUpdateInterval;
//     }
//     let currentDirection = calculateDirection(currentPath[pathIndex - 1], currentPath[pathIndex]);
//     let upcomingDirection = calculateDirection(currentPath[pathIndex], currentPath[pathIndex + 1]);
    
//     if (!arraysEqual(currentDirection, upcomingDirection)) {
//       AIUpdateInterval = SLOW_UPDATE_INTERVAL; // Adjust interval if direction changed
//     } else {
//       AIUpdateInterval = NORMAL_UPDATE_INTERVAL;
//     }

//     return AIUpdateInterval;
    
// }

function setupGameElements(scene) {
    initializeDemo(scene);
}

function initializeDemo(scene) {
    // Your initial setup: showing only player 1's sprite and the first instruction.
    // Create grid graphics
    let graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xFFFFFF } });
     // Draw vertical lines
    for (let i = 0; i <= gridWidth; i++) {
         graphics.moveTo(i * cellWidth, 0);
         graphics.lineTo(i * cellWidth, gridWidth * cellHeight);
    }
 
     // Draw horizontal lines
    for (let i = 0; i <= gridHeight; i++) {
         graphics.moveTo(0, i * cellHeight);
         graphics.lineTo(gridWidth * cellWidth, i * cellHeight);
    }
 
    graphics.strokePath();
 
    scene.doorSprites = [];

    calculateDoors();
    createSubGrids.call(scene);
    //allDoors.forEach(drawDoor.bind(this));
    allDoors.forEach(door => drawDoor(door, scene));

    player1 = scene.physics.add.sprite(cellWidth / 2, cellHeight / 2, 'player1').setScale(0.04 * dpr).setDepth(1);
    player1.setCollideWorldBounds(true); 
    player1.name = 'Human'; 
    player1.data = players['Human']; 
    player1.setTint(players['Human'].color);

    scene.physics.world.debugGraphic = scene.add.graphics().setAlpha(0);

    // Keyboard controls
    scene.input.keyboard.on('keyup', handleKeyDown.bind(scene));

    scene.messageText.destroy(); 
    let specificSizeStyle = createTextStyle(20 * dpr * 0.9, '#000');
    scene.messageText = scene.add.text(900 * dpr, 10 * dpr, ' You are the orange player.\n You can use the arrow keys to\n move your orange player\n at the top-left corner.', specificSizeStyle).setDepth(1001);
    scene.messageText.setScale(0.9, 1);
    scene.messageText.setResolution(2); 
    proceedButton = scene.add.rectangle(1020 * dpr, 250 * dpr, 90 * dpr, 20 * dpr, 0x007BFF).setOrigin(0.5, 0.5).setInteractive().setDepth(1001);
    specificSizeStyle = createTextStyle(21 * dpr, '#FFF');
    scene.proceedText = scene.add.text(983 * dpr, 240 * dpr, 'Proceed', specificSizeStyle).setDepth(1002);

    proceedButton.on('pointerdown', function() {
        if (isClickable) {
            console.log('Proceed button clicked!');
            displayNextInstruction(scene);
        } else {
            console.log('Condition not met yet!');
        }
    });
}

let playerName = "AI"; 
let tokenType = "Gold";

if(trapTimeForEachRound[currentRound - 1].AI === 777){
    isReplay = "replay";
}else if(trapTimeForEachRound[currentRound - 1].Replay === 777){
    isReplay = "AI";
}

if(isReplay === "AI"){
    playerName =  "a robot player";
    tokenType = "butterflies";
}else{
    playerName =  "a human player";
    tokenType = "apple";
}

let instructions = [
    " There are four areas on the grid\n where tokens will appear.\n To get to these areas,\n you have to go through \n the right doors when entering. \n You, the orange player, \n can only move through orange doors. \n Now go through an orange door.",
    " The tokens you can collect are\n the orange flowers. \n When you finish collecting\n all orange flowers in an area, \n a new group of orange flowers\n will appear in another area.\n Now try to collect three flowers. ",
    " Now we will add\n a yellow robot player to the game.\n The yellow robot will only\n collect the yellow butterflies.",
    " Also, the yellow robot can only\n move through yellow doors.\n You, as the orange player,\n can only move through orange doors.",
    `Let's start the first round. There are 4 rounds in total.
Have fun!!
You are playing with ${playerName} who collects ${tokenType} in this round.`
];
let currentInstructionIndex = 0;


function displayNextInstruction(scene) {

    if(currentInstructionIndex === 0 && isClickable === true){
        isClickable = false;
    }

    if(currentInstructionIndex === 1 && isClickable === true){
        isClickable = false;

        //star token groups
        scene.tokenGroup = scene.physics.add.group();

        addStarTokens(scene, players['Human'].id);

        scene.physics.add.overlap(player1, scene.tokenGroup, onTokenHit.bind(scene), null, scene);

    }

    if(currentInstructionIndex === 2 && isClickable === true){
        isClickable = false;

        let specificSizeStyle = createTextStyle(25 * dpr, '#000');

        timeText = scene.add.text(910 * dpr, 10 * dpr, '', specificSizeStyle);

        runUpdateLogic = true;

        timeText.setVisible(false);

        player2 = scene.physics.add.sprite(grid_width - cellWidth / 2, scene.sys.game.config.height - cellHeight / 2, 'player2').setScale(0.25 * dpr).setDepth(1);
        player2.setCollideWorldBounds(true); 
        player2.name = 'AI'; 
        player2.data = players['AI'];
        player2.setTint(players['AI'].color);

        easystar = new EasyStar.js();
        easystar.setGrid(initialGrid);
        easystar.setAcceptableTiles([0]); 

        easystarSubgrid = new EasyStar.js();
        easystarSubgrid.setGrid(subGrid);
        easystarSubgrid.setAcceptableTiles([0]);

        isReplay = "AI";

        scene.player1Ghost = scene.add.sprite(cellWidth / 2, cellHeight / 2, 'player1').setScale(0.04 * dpr).setDepth(1);
        scene.player2Ghost = scene.add.sprite(grid_width - cellWidth / 2, scene.sys.game.config.height - cellHeight / 2, 'player2').setScale(0.25 * dpr).setDepth(1);
        scene.player1Ghost.setVisible(false);
        scene.player2Ghost.setVisible(false);

        addStarTokens(scene, players['AI'].id);

        scene.physics.add.overlap(player2, scene.tokenGroup, onTokenHit.bind(scene), null, scene);  

    }

    if (isClickable) {
        proceedButton.setFillStyle(0x007BFF);
    } else {
        proceedButton.setFillStyle(0xCCCCCC);
    }

    if(currentInstructionIndex === 4){
        scene.overlay.setVisible(true);
        let fontSize = 26 * dpr;
        scene.messageText.setFontSize(fontSize + 'px');
        scene.messageText.x = scene.sys.game.config.width / 2 - 500 * dpr;
        scene.messageText.y = scene.sys.game.config.height / 2 - 100;

        proceedButton.x = scene.sys.game.config.width / 2;
        proceedButton.y = scene.sys.game.config.height * 0.65;

        scene.proceedText.x = scene.sys.game.config.width / 2 - 40 * dpr;
        scene.proceedText.y = scene.sys.game.config.height * 0.65 - 10 * dpr;

        // if(isReplay === "AI"){
        //     scene.displayIcon = scene.add.sprite(scene.sys.game.config.width - 200 * dpr, scene.sys.game.config.height * 0.5 + 5 * dpr, 'player2').setScale(0.3 * dpr).setDepth(1001);
        // }else{
        //     scene.displayIcon = scene.add.sprite(scene.sys.game.config.width  - 200 * dpr, scene.sys.game.config.height * 0.55 + 5 * dpr, 'replayPlayer').setScale(0.5 * dpr).setDepth(1001);
        // }

    }

    if (currentInstructionIndex < instructions.length) {
        scene.messageText.setText(instructions[currentInstructionIndex]);
        currentInstructionIndex++;
    } 
    else {
        // All instructions shown, remove L key listener and proceed with game setup
        proceedButton.destroy();
        completeSetup(scene);
    }
}

function completeSetup(scene) {

    scene.messageText.destroy(); 

    scene.proceedText.destroy();

    scene.overlay.setVisible(false);

    setInterval(() => {
        updateGameTime(scene);
    }, 1000);

    timeText.setVisible(true);

    if(trapTimeForEachRound[currentRound - 1].AI === 777){
        player2TrapTimeStart = trapTimeForEachRound[currentRound - 1].Replay;
        isReplay = "replay";
    }else if(trapTimeForEachRound[currentRound - 1].Replay === 777){
        player2TrapTimeStart = trapTimeForEachRound[currentRound - 1].AI;
        isReplay = "AI";
    }



    let pathnow = studyId+'/participantData/'+firebaseUserId+'/Initial setup' +'/Grid dimension';
    let valuenow = [gridWidth, gridHeight];
    writeRealtimeDatabase( pathnow , valuenow );

    pathnow = studyId+'/participantData/'+firebaseUserId+'/Initial setup' +'/Subgrids';
    valuenow = GRIDS;
    writeRealtimeDatabase( pathnow , valuenow );

    player1TrapTimeStart = trapTimeForEachRound[currentRound - 1].human;

    if(isReplay === "AI"){
        player1.x = cellWidth/2;
        player1.y = cellHeight/2;
      
        player2.x = grid_width - cellWidth / 2;
        player2.y = scene.sys.game.config.height - cellHeight / 2;
    }else if(isReplay === "replay"){
        player2.x = cellWidth/2;
        player2.y = cellHeight/2;
      
        player1.x = grid_width - cellWidth / 2;
        player1.y = scene.sys.game.config.height - cellHeight / 2;
    }

    door_AI_color = roundOneColor;
    players['AI'].color = roundOneColor;

    if(isReplay === "replay"){
        // door_AI_color = 0xcc79a7;
        // players['AI'].color = 0xcc79a7;
        player2.setTexture('player1').setScale(0.04 * dpr).setDepth(1).setTint(players['AI'].color);
        scene.player2Ghost.setTexture('player1').setScale(0.04 * dpr).setDepth(1).setTint(players['AI'].color);
    }

    doorAICoords = [];
    doorAIadjusted = [];
    doorHumanCoords = [];
    doorHumanadjusted = [];
    allDoors = [];
    scene.doorSprites = [];
    calculateDoors();
    allDoors.forEach(door => drawDoor(door, scene));

    player1.setTint(players['Human'].color);
    player2.setTint(players['AI'].color);
    scene.player1Ghost.setTint(players['Human'].color);
    scene.player2Ghost.setTint(players['AI'].color);

  
    aiStartX =  14;
    aiStartY = 12;

    localAIx = null;
    localAIy = null;
    subgridAI = null;

    pathIndex = 0;
  
    currentTargetIndex = 0;
  
    currentPath = null; 
  
    localTargets = [];
  
    otherPlayerinSubgrid = false;
  
    tokenInfo = {
        locations: [],
        subgrid: null
    };
  
    players.AI.tokensCollected = 0;
    players.Human.tokensCollected = 0;

    scene.tokenGroup.clear(true, true); // This will remove all the tokens from the group and also destroy them
      
    // // Add new tokens for each player
    addStarTokens(scene, players['Human'].id);
    addStarTokens(scene, players['AI'].id);

    isPathBeingFollowed = false;
  
    aiState = "NAVIGATING_TO_SUBGRID";

    startOfGamePlay = Date.now();

    runUpdateLogic = true;

    startGamePlay = true;

}



