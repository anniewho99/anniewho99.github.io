// Firebase Psych JavaScript Library v. 1.0
// Author: Mark Steyvers
// to do: 
// save random id / firebase id mapping in database (not readable to anybody)
// update to new function getUrlParameters() {

// The following code uses the modular and functional approach of Firebase version 9
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getDatabase, ref, child, get, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
//import { getSortIndices } from './jsutilitiesv1.0.js';

// Initialize App
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth( firebaseApp );
const db = getDatabase( firebaseApp );
export var firebaseUserId = 'not initialized yet';

// Other global variables needed
export var randomId = uid(); // anonymous id

await signInAnonymously(auth)
  .then(() => {
    //console.log( "Firebase authentication successful...")
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    const msg = "Firebase authentication failed. Errorcode: " + errorCode + " : " + errorMessage;
    //console.error( msg );
    throw( msg );
  });

await onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    firebaseUserId = user.uid;
    //console.log( "User is signed in. Firebase user id=" + firebaseUserId );
  } else {
    // User is signed out
    //console.log( "User is signed out" );
  }
});


//------------------------------------------------------
// Define some new functions we can use in other code
//------------------------------------------------------
export async function writeRealtimeDatabase( myPath , value ) {
   await set( ref( db, myPath ) , value )
       .then(() => {
           //console.log( "Write operation successful...")
       })
       .catch((error) => {
           const errorCode = error.code;
           const errorMessage = error.message;
           const msg = "writeRealtimeDatabase( '" + myPath + "' , '" + value + "' ) failed. " + "  Errorcode: " + errorCode + " : " + errorMessage
           //console.error( msg );
           throw( msg );
       });
}

export async function readRealtimeDatabase( myPath ) {
      var result = [];
      await get( ref( db, myPath )).then((snapshot) => {
             if (snapshot.exists()) {
                  const sizeNow = snapshot.size;
                  if (sizeNow == 0) {
                      result = snapshot.val();
                      const key = snapshot.key;
                      //console.log( "Key retrieved=" + key );
                      //console.log( "result retrieved=" + result );
                  } else {
                      var obj = {};
                      snapshot.forEach( childSnapshot => {
                          const resultNow = childSnapshot.val();
                          const keyNow = childSnapshot.key;
                          obj[ keyNow ] = resultNow;
                      });
                      result = obj;
                  }
             } else {
               //console.error( "readRealtimeDatabase( '" + myPath + "' ) retrieved no data");
               throw( 'Path not found');
             }
      }).catch((error) => {
             const msg = "readRealtimeDatabase( '" + myPath + "' ) produced error: " + error;
             //console.error( msg );
             throw( msg );
      });
      //console.log( "Function: result read = " + result );
      return result;
}

export async function writeURLParameters( myPath ) {
        const urlString = window.location.search;
        let paramString = urlString.split('?')[1];
        if (paramString) {
            let params_arr = paramString.split('&');
            for(let i = 0; i < params_arr.length; i++) {
                let pair = params_arr[i].split('=');
                const key = pair[0];
                const value = pair[1];
                const pathNow = myPath + '/' + key;
                await writeRealtimeDatabase( pathNow , value )
            }
        }

}

// Create a unique ID
function uid() {
  return (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");
};

function minutesUnixTime( serverTime ) {
    // converts server time (milliseconds of unix time) to minutes
    return serverTime / (1000*60);
}

function getSortIndices(vals) {
  // returns the indices of the sorted values of "vals", when sorted in ascending order
  var toSort = [];
  for (var i = 0; i < vals.length; i++) {
    toSort[i] = [vals[i], i];
  }
  toSort.sort(function(left, right) {
    return left[0] < right[0] ? -1 : 1;
  });
  toSort.sortIndices = [];
  for (var j = 0; j < toSort.length; j++) {
    toSort.sortIndices.push(toSort[j][1]);
    toSort[j] = toSort[j][0];
  }
  return toSort.sortIndices;
}

export async function blockRandomization( studyId , condition , numConditions , maxCompletionTimeMinutes , numDraws ) {
    if (numDraws > numConditions) {
          throw( "Number of draws exceeds number of available conditions -- split up the draws");
    }

    // Our estime of the probability that a participant will finish the study once started
    const probWillFinish = 0.8;

    const condPath =  studyId+'/studyInfo/conditionCounts/'+condition;

    // Get server time. We cannot directly access this from firebase so we first write to database and then retrieve it
    const timePath = studyId + '/studyInfo/serverTime/';
    await writeRealtimeDatabase( timePath  , serverTimestamp() );

    const serverTimeNow = await readRealtimeDatabase( timePath );
    const minutesNow = minutesUnixTime( serverTimeNow );

    // First, retrieve the condition records for this path
    var countsCompleted = new Array(numConditions).fill(0);
    var countsStarted   = new Array(numConditions).fill(0);
    var countsTimedOut  = new Array(numConditions).fill(0);
    var countsExpected  = new Array(numConditions).fill(0);
    try {
      // Note: maybe this statement can be replaced by a filter statement for more efficient results
      const result = await readRealtimeDatabase( condPath );
      // Get all the anonymous participant id's
      let allkeys = Object.keys(result);
      allkeys.forEach((keynow) => {
            // Aggregate the counts
            const record = result[ keynow ];
    
            const timeStarted = record.serverTimeStarted;
            const timeMinutes = minutesUnixTime( timeStarted );
            var numConds = record.condition.length;
    
            //console.log( 'rid=' + record.rid + ' numConds=' + numConds );   
            if (numConds==null) {
                const condNow = record.condition;       
                //console.log( 'condNow=' + condNow + ' rid=' + record.rid );
            
                if ((condNow<0) || (condNow >= numConditions)) {
                  throw( 'Condition level value is out of bounds: condition=' + condNow );
                }
                var hasCompleted = record.hasCompleted;
                var hasStarted = record.hasStarted;
                var minutesElapsed = minutesNow - timeMinutes;
                if (minutesElapsed > maxCompletionTimeMinutes) {
                    countsTimedOut[ condNow ] += hasStarted;
                    hasStarted = 0; // If a participant times out, we should not expect them to finish at all
                }
                countsCompleted[ condNow ] += hasCompleted;
                countsStarted[ condNow ] += hasStarted;
            } else {
                for (let j=0; j<numConds; j++) {
                      const condNow = record.condition[ j ];
            
                      //console.log( 'condNow=' + condNow + ' rid=' + record.rid );
            
                      if ((condNow<0) || (condNow >= numConditions)) {
                        throw( 'Condition level value is out of bounds: condition=' + condNow );
                      }
                      var hasCompleted = record.hasCompleted;
                      var hasStarted = record.hasStarted;
                      var minutesElapsed = minutesNow - timeMinutes;
                      if (minutesElapsed > maxCompletionTimeMinutes) {
                          countsTimedOut[ condNow ] += hasStarted;
                          hasStarted = 0; // If a participant times out, we should not expect them to finish at all
                      }
                      countsCompleted[ condNow ] += hasCompleted;
                      countsStarted[ condNow ] += hasStarted;
                }
            }
               
      });


    } catch( e ) {
        // If the error is "Path not found", let's ignore that
        var partofmessage = new RegExp('Path not found');
        if ( partofmessage.test(e) == false ) {
            //console.log( e );
            throw( e );
        }
    }

    // Pick the condition with lowest count, and randomly break ties
    //console.log( 'Condition level counts: ' + condition );
    var sumCompleted = 0;
    var sumStarted = 0;
    var sumTimedOut = 0;
    var minValue;
    //var assignedCondition = 0;
    for (let i=0; i<numConditions; i++) {
        sumCompleted += countsCompleted[ i ];
        sumStarted += countsStarted[ i ];
        sumTimedOut += countsTimedOut[ i ];
        // Compute the expected number of participants per condition -- add some small random moise to break ties
        countsExpected[ i ] = countsCompleted[ i ] + probWillFinish * countsStarted[ i ] + 0.001 * Math.random();
        //console.log( 'Condition:' + String(i).padStart(4, '0') + ' #Completed=' + countsCompleted[ i ] + ' #Started & NotTimedOut=' + countsStarted[ i ] + ' #Started & TimedOut=' + countsTimedOut[ i ])
    }
    //console.log( 'Totals:   '  + ' #Completed=' + sumCompleted + ' #Started & NotTimedOut=' + sumStarted + ' #Started & TimedOut=' + sumTimedOut );
    //console.log( 'Condition level chosen=' + assignedCondition );

    // Sort the countsExpected
    var sidx = getSortIndices(countsExpected);
    var assignedCondition = [];

    for (let j=0; j<numDraws; j++) {
          var assignedNow = sidx[ j ];
          assignedCondition[ j ] = assignedNow
          //console.log( 'Condition level chosen (draw ' + (j+1) + ')=' + assignedNow );
    }


    // Write conditions selected
    var condRecord = { condition: assignedCondition,
                       rid: randomId,
                       serverTimeStarted:serverTimeNow,
                       serverTimeEnded:[],
                       hasCompleted: 0,
                       hasStarted: 1  };
    const key = randomId;

    //console.log( '[blockrandomization]: writing to path ' + condPath + ' key=' + key + '  condition=' + assignedCondition );
    //await writeRealtimeDatabase( condPath+'/' + key + '/'  , condRecord );
    await writeRealtimeDatabase( condPath+'/' + key + '/'  , condRecord );

    // Handle the event where the participant leaves the study OR refreshes the page
    //window.addEventListener('beforeunload', (event) => {
    //    // Change the condRecord status
    //    writeRealtimeDatabase( condPath+'/' + key + '/hasStarted'  , 0 );
    //    writeRealtimeDatabase( condPath+'/' + key + '/serverTimeEnded:'  , serverTimestamp());
    //});

    // Return the condition chosen
    return assignedCondition;
}

export async function finalizeBlockRandomization( studyId , condition ) {
     const key = randomId;
     const condPath =  studyId+'/studyInfo/conditionCounts/'+condition;
     await writeRealtimeDatabase( condPath+'/' + key + '/hasStarted'  , 0 );
     await writeRealtimeDatabase( condPath+'/' + key + '/hasCompleted'  , 1 );
}


export async function blockRandomization_readonly( studyId , condition , numConditions , maxCompletionTimeMinutes , numDraws ) {
  if (numDraws > numConditions) {
        throw( "Number of draws exceeds number of available conditions -- split up the draws");
  }

  // Our estime of the probability that a participant will finish the study once started
  const probWillFinish = 0.8;

  const condPath =  studyId+'/studyInfo/conditionCounts/'+condition;

  // Get server time. We cannot directly access this from firebase so we first write to database and then retrieve it
  const timePath = studyId + '/studyInfo/serverTime/';
  await writeRealtimeDatabase( timePath  , serverTimestamp() );

  const serverTimeNow = await readRealtimeDatabase( timePath );
  const minutesNow = minutesUnixTime( serverTimeNow );

  // First, retrieve the condition records for this path
  var countsCompleted = new Array(numConditions).fill(0);
  var countsStarted   = new Array(numConditions).fill(0);
  var countsTimedOut  = new Array(numConditions).fill(0);
  var countsExpected  = new Array(numConditions).fill(0);
  try {
    // Note: maybe this statement can be replaced by a filter statement for more efficient results
    const result = await readRealtimeDatabase( condPath );
    // Get all the anonymous participant id's
    var allkeys = Object.keys(result);
    var numKeys = allkeys.length;
    allkeys.forEach((keynow) => {
        // Aggregate the counts
        const record = result[ keynow ];

        const timeStarted = record.serverTimeStarted;
        const timeMinutes = minutesUnixTime( timeStarted );
        var numConds = record.condition.length;

        //console.log( 'rid=' + record.rid + ' numConds=' + numConds );   
        if (numConds==null) {
            const condNow = record.condition;       
            //console.log( 'condNow=' + condNow + ' rid=' + record.rid );
        
            if ((condNow<0) || (condNow >= numConditions)) {
              throw( 'Condition level value is out of bounds: condition=' + condNow );
            }
            var hasCompleted = record.hasCompleted;
            var hasStarted = record.hasStarted;
            var minutesElapsed = minutesNow - timeMinutes;
            if (minutesElapsed > maxCompletionTimeMinutes) {
                countsTimedOut[ condNow ] += hasStarted;
                hasStarted = 0; // If a participant times out, we should not expect them to finish at all
            }
            countsCompleted[ condNow ] += hasCompleted;
            countsStarted[ condNow ] += hasStarted;
        } else {
            for (let j=0; j<numConds; j++) {
                  const condNow = record.condition[ j ];
        
                  //console.log( 'condNow=' + condNow + ' rid=' + record.rid );
        
                  if ((condNow<0) || (condNow >= numConditions)) {
                    throw( 'Condition level value is out of bounds: condition=' + condNow );
                  }
                  var hasCompleted = record.hasCompleted;
                  var hasStarted = record.hasStarted;
                  var minutesElapsed = minutesNow - timeMinutes;
                  if (minutesElapsed > maxCompletionTimeMinutes) {
                      countsTimedOut[ condNow ] += hasStarted;
                      hasStarted = 0; // If a participant times out, we should not expect them to finish at all
                  }
                  countsCompleted[ condNow ] += hasCompleted;
                  countsStarted[ condNow ] += hasStarted;
            }
        }
        
      
        
    });


  } catch( e ) {
      // If the error is "Path not found", let's ignore that
      var partofmessage = new RegExp('Path not found');
      if ( partofmessage.test(e) == false ) {
          //console.log( e );
          throw( e );
      }
  }

  // Pick the condition with lowest count, and randomly break ties
  //console.log( 'Condition level counts: ' + condition );
  var sumCompleted = 0;
  var sumStarted = 0;
  var sumTimedOut = 0;
  var minValue;
  //var assignedCondition = 0;
  for (let i=0; i<numConditions; i++) {
      sumCompleted += countsCompleted[ i ];
      sumStarted += countsStarted[ i ];
      sumTimedOut += countsTimedOut[ i ];
      // Compute the expected number of participants per condition -- add some small random moise to break ties
      countsExpected[ i ] = countsCompleted[ i ] + probWillFinish * countsStarted[ i ] + 0.001 * Math.random();
      //console.log( 'Condition:' + String(i).padStart(4, '0') + ' #Completed=' + countsCompleted[ i ] + ' #Started & NotTimedOut=' + countsStarted[ i ] + ' #Started & TimedOut=' + countsTimedOut[ i ])
  }
  //console.log( 'Totals:   '  + ' #Completed=' + sumCompleted + ' #Started & NotTimedOut=' + sumStarted + ' #Started & TimedOut=' + sumTimedOut );
  //console.log( 'Condition level chosen=' + assignedCondition );

  // Sort the countsExpected
  var sidx = getSortIndices(countsExpected);
  var assignedCondition = [];

  for (let j=0; j<numDraws; j++) {
        var assignedNow = sidx[ j ];
        assignedCondition[ j ] = assignedNow
        //console.log( 'Condition level chosen (draw ' + (j+1) + ')=' + assignedNow );
  }


  // Write conditions selected
  var condRecord = { countsC: countsCompleted,
                     countsS: countsStarted,
                     countsE: countsExpected,
                     condition: assignedCondition,
                     rid: randomId,
                     serverTimeStarted:serverTimeNow,
                     serverTimeEnded:[],
                     hasCompleted: 0,
                     hasStarted: 1  };
  const key = randomId;


  //await writeRealtimeDatabase( condPath+'/' + key + '/'  , condRecord );
 
  // Return the condition chosen
  return condRecord;
}