
// Store frame for motion functions
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

Leap.loop(controllerOptions, function(frame) {
  if (paused) {
    return; // Skip this update
  }

  // Display Frame object data
  var frameOutput = document.getElementById("frameData");

  var frameString = "Frame ID: " + frame.id  + "<br />"
                  + "Timestamp: " + frame.timestamp + " &micro;s<br />"
                  + "Hands: " + frame.hands.length + "<br />"
                  + "Fingers: " + frame.fingers.length + "<br />"
                  + "Tools: " + frame.tools.length + "<br />"
                  + "Gestures: " + frame.gestures.length + "<br />";

  // Frame motion factors
  if (previousFrame && previousFrame.valid) {
    var translation = frame.translation(previousFrame);
    frameString += "Translation: " + vectorToString(translation) + " mm <br />";

    var rotationAxis = frame.rotationAxis(previousFrame);
    var rotationAngle = frame.rotationAngle(previousFrame);
    frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
    frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

    var scaleFactor = frame.scaleFactor(previousFrame);
    frameString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
  }
  //frameOutput.innerHTML = "<div style='width:300px; float:left; padding:5px'>" + frameString + "</div>";

  // Display Hand object data
  var handOutput = document.getElementById("handData");
  var handString = "";
  if (frame.hands.length > 0) {
    for (var i = 0; i < frame.hands.length; i++) {
      var hand = frame.hands[i];

      handString += "<div style='width:300px; float:left; padding:5px'>";
      handString += "Hand ID: " + hand.id + "<br />";
      handString += "Direction: " + vectorToString(hand.direction, 2) + "<br />";
      handString += "Palm normal: " + vectorToString(hand.palmNormal, 2) + "<br />";
      handString += "Palm position: " + vectorToString(hand.palmPosition) + " mm<br />";
      handString += "Palm velocity: " + vectorToString(hand.palmVelocity) + " mm/s<br />";
      handString += "Sphere center: " + vectorToString(hand.sphereCenter) + " mm<br />";
      handString += "Sphere radius: " + hand.sphereRadius.toFixed(1) + " mm<br />";

      // Hand motion factors
      if (previousFrame && previousFrame.valid) {
        var translation = hand.translation(previousFrame);
        handString += "Translation: " + vectorToString(translation) + " mm<br />";

        var rotationAxis = hand.rotationAxis(previousFrame, 2);
        var rotationAngle = hand.rotationAngle(previousFrame);
        handString += "Rotation axis: " + vectorToString(rotationAxis) + "<br />";
        handString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

        var scaleFactor = hand.scaleFactor(previousFrame);
        handString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
      }

      // IDs of pointables (fingers and tools) associated with this hand
      if (hand.pointables.length > 0) {
        var fingerIds = [];
        var toolIds = [];
        for (var j = 0; j < hand.pointables.length; j++) {
          var pointable = hand.pointables[j];
          if (pointable.tool) {
            toolIds.push(pointable.id);
          }
          else {
            fingerIds.push(pointable.id);
          }
        }
        if (fingerIds.length > 0) {
          handString += "Fingers IDs: " + fingerIds.join(", ") + "<br />";
        }
        if (toolIds.length > 0) {
          handString += "Tools IDs: " + toolIds.join(", ") + "<br />";
        }
      }

      handString += "</div>";
    }
  }
  else {
    handString += "No hands";
  }
 // handOutput.innerHTML = handString;

  // Display Pointable (finger and tool) object data
  var pointableOutput = document.getElementById("pointableData");
  var pointableString = "";
  if (frame.pointables.length > 0) {
    for (var i = 0; i < frame.pointables.length; i++) {
      var pointable = frame.pointables[i];

      pointableString += "<div style='width:250px; float:left; padding:5px'>";
      pointableString += "Pointable ID: " + pointable.id + "<br />";
      pointableString += "Belongs to hand with ID: " + pointable.handId + "<br />";

      if (pointable.tool) {
        pointableString += "Classified as a tool <br />";
        pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
        pointableString += "Width: "  + pointable.width.toFixed(1) + " mm<br />";
      }
      else {
        pointableString += "Classified as a finger<br />";
        pointableString += "Length: " + pointable.length.toFixed(1) + " mm<br />";
      }

      pointableString += "Direction: " + vectorToString(pointable.direction, 2) + "<br />";
      pointableString += "Tip position: " + vectorToString(pointable.tipPosition) + " mm<br />";
      pointableString += "Tip velocity: " + vectorToString(pointable.tipVelocity) + " mm/s<br />";

      pointableString += "</div>";
    }
  }
  else {
    pointableString += "<div>No pointables</div>";
  }
 // pointableOutput.innerHTML = pointableString;

// Display Gesture object data
  var gestureOutput = document.getElementById("gestureData");
  var gestureString = "";
  if (frame.gestures.length > 0) {
    for (var i = 0; i < frame.gestures.length; i++) {
      var gesture = frame.gestures[i];

      switch (gesture.type) {
        case "circle":
            var r = new CustomEvent("rotate", {
          });
            if ( gesture.state == "stop" ) {
              document.dispatchEvent(r); 
            }

            break;
        case "swipe":
          if (gesture.state == "update" || gesture.state == "stop") break; 
          // e = $.Event("keydown");
          var e = new CustomEvent("swipe", {
            which: 0

          });
          
          //Classify swipe as either horizontal or vertical
          var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
          //Classify as right-left or up-down
          $(document).focus();
          if(isHorizontal){
              if(gesture.direction[0] > 0){
                e.which = 39;
                  swipeDirection = "right";
                  
              } else {

                  swipeDirection = "left";
                  e.which = 37;
              }
          } else { //vertical
              if(gesture.direction[1] > 0){
                  swipeDirection = "up";
                  e.which = 38;
              } else {
                  swipeDirection = "down";
                  e.which = 40;
              }               
          }
          $("body").trigger('e'); 
          document.dispatchEvent(e); 




          break;
       }
     }
  }
 // gestureOutput.innerHTML = gestureString + gestureOutput.innerHTML;

})

function vectorToString(vector, digits) {
  if (typeof digits === "undefined") {
    digits = 1;
  }
  return "(" + vector[0].toFixed(digits) + ", "
             + vector[1].toFixed(digits) + ", "
             + vector[2].toFixed(digits) + ")";
}

function togglePause() {
  paused = !paused;

  if (paused) {
    document.getElementById("pause").innerText = "Resume";
  } else {
    document.getElementById("pause").innerText = "Pause";
  }
}

function pauseForGestures() {
  if (document.getElementById("pauseOnGesture").checked) {
    pauseOnGesture = true;
  } else {
    pauseOnGesture = false;
  }
}


