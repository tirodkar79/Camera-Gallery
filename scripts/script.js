// Defining the class access object
let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont")
let recordBtn = document.querySelector(".record-btn")
let captureBtnCont = document.querySelector(".capture-btn-cont")
let captureBtn = document.querySelector(".capture-btn")
let fiilterLayer = document.querySelector(".filter-layer")

// Initializing toggle checker to start and stop recording
let recordFlag = false;

// Initializing default filter for video streaming
let transparentColor = "transparent";


let recorder;

// Defining video recorder storage (since data is coming in small chunks naming the variable based on that)
let chunks = [] // Media data in chunks

// Defining the system infra constraints whose access is required 
let constraints = {
    video: true,
    audio: true
}

// Getting access permission from user for required system infra using navigator
// Key Points: Navigator is a browser api which helps to get browser info and to get access permission for camera, audio, etc.,
// Navigator is a global window element
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    // Setting the video stream data to the video tag which is defined in html 
    video.srcObject = stream;

    // MediaRecorder is a broswer api which is used to record the user's camera data
    recorder = new MediaRecorder(stream);

    // If recording is started -> Than reinitializing the chunks variable to remove previous recording data if present
    recorder.addEventListener("start", (e) => {
        chunks = [];
    })

    // If any recording data is present to be stored than adding that data chunk into chunks
    recorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
    })

    // If user stops recording than storing the recorded video in indexedDB
    recorder.addEventListener("stop", (e) => {
        // Converting media chunks data into video format
        let blob = new Blob(chunks, { type: "video/mp4" });
        
        if (db) {
            // Using a npm pkg shortid-dist to generate a unique id for storing our video in indexedDB
            let videoID = shortid();
            let dbTransaction = db.transaction("video", "readwrite")
            let videoStore = dbTransaction.objectStore("video");
            let videoEntry = {
                id: `vid-${videoID}`,
                blobData: blob
            }
            videoStore.add(videoEntry)
        }
    })

})

// If user clicks on record Button than
recordBtnCont.addEventListener("click", (e) => {
    if (!recorder) return;
    
    // Toggle the record flag
    recordFlag = !recordFlag;
 
    // Starting the recording if flag is true
    if (recordFlag) {
        recorder.start();
        // Add recording animation to record button 
        recordBtn.classList.add("scale-record")
        // Displaying video recording timer
        startTimer()
        
    }
    // Stoping the recording if flag is false
    else {
        recorder.stop();
        // Remove recording animation from record button 
        recordBtn.classList.remove("scale-record")
        // Hide video recording timer
        stopTimer()
    }
})

// If user clicks on capture Button than
captureBtnCont.addEventListener("click", (e) => {

    // Show the image capturing animation
    captureBtn.classList.add("scale-capture")

    // Initailizing the canvas element to save the camera data as an image
    let canvas = document.createElement("canvas")
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Storing the captured camera data in canvas
    let tool = canvas.getContext("2d");
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Adding the active filter color enabled by user at the moment
    tool.fillStyle = transparentColor;
    tool.fillRect(0, 0, canvas.width, canvas.height);

    // Converting the image data to a url and storing it in indexedDB
    let imageURL = canvas.toDataURL();
    if (db) {
        // Using a npm pkg shortid-dist to generate a unique id for storing our image in indexedDB
        let imageID = shortid();
        let dbTransaction = db.transaction("image", "readwrite")
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id: `img-${imageID}`,
            url: imageURL
        }
        imageStore.add(imageEntry)
    }

    // Using a setTimeout to give required delay for our capturing animation to complete
    setTimeout(() => {
        captureBtn.classList.remove("scale-capture")
    }, 500)
})

let timerID;
// Counter represents total seconds the recording is going on
let counter = 0;
let timer = document.querySelector(".timer"); 

/**
 * Logic to convert the total seconds in HH:MM:SS format and working as a timer
 */
function startTimer() {
    // Toggling the display from none to block as recording starts
    timer.style.display = "block";

    function displayTimer() {
        let totalSeconds = counter;
        // Getting max hours from total seconds 
        let hours = Number.parseInt(totalSeconds / 3600);
        //Formatting it in HH format by adding 0 if single digit
        hours = (hours >= 10) ? `${hours}` : `0${hours}`
        // Removing the max hours present from total seconds
        totalSeconds = totalSeconds % 3600;

        // Getting max minutes from total seconds 
        let minutes = Number.parseInt(totalSeconds / 60);
        //Formatting it in MM format by adding 0 if single digit
        minutes = (minutes >= 10) ? `${minutes}` : `0${minutes}`
        // Removing the max minutes present from total seconds
        totalSeconds = totalSeconds % 60;

        // Setting the remaining total seconds as seconds 
        let seconds = totalSeconds;
        //Formatting it in SS format by adding 0 if single digit
        seconds = (seconds >= 10)? `${seconds}`: `0${seconds}`

        // Showing it in html as HH:MM:SS format
        timer.innerText = `${hours}:${minutes}:${seconds}`;

        counter++;
    }

    timerID = setInterval(displayTimer, 1000);
}

/**
 * If recording stops resetting the counter and hiding the timer
 */
function stopTimer() {
    clearInterval(timerID)
    timer.innerText = "00:00:00";
    timer.style.display = "none";
}

// Adding click event listener on all filter components
let allFilters = document.querySelectorAll(".filter");
allFilters.forEach((filterElem) => {
    filterElem.addEventListener("click", (e) => {
        // If any filter component is clicked setting it to transparentColor and applying it to filter layer
        transparentColor = getComputedStyle(filterElem).getPropertyValue("background-color");
        fiilterLayer.style.backgroundColor = transparentColor;
    })
})