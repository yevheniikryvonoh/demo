// Import the necessary MediaPipe modules
import {
  FaceDetector,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const demosSection = document.getElementById("demos");
let faceDetector;
let runningMode = "IMAGE";

// Initialize the face detector
const initializeFaceDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
      delegate: "GPU",
    },
    runningMode: runningMode,
  });
  demosSection.classList.remove("invisible");
};

initializeFaceDetector();

// Event listeners for demo 1 (Image face detection)
const imageContainers = document.getElementsByClassName("face detectOnClick");
for (let imageContainer of imageContainers) {
  imageContainer.children[0].addEventListener("click", handleClick);
}

// Handle image click for face detection
async function handleClick(event) {
  const highlighters =
    event.target.parentNode.getElementsByClassName("highlighter");
  while (highlighters[0]) {
    highlighters[0].parentNode.removeChild(highlighters[0]);
  }
  const infos = event.target.parentNode.getElementsByClassName("info");
  while (infos[0]) {
    infos[0].parentNode.removeChild(infos[0]);
  }
  const keyPoints = event.target.parentNode.getElementsByClassName("key-point");
  while (keyPoints[0]) {
    keyPoints[0].parentNode.removeChild(keyPoints[0]);
  }
  if (!faceDetector) {
    console.log("Wait for face detector to load before clicking");
    return;
  }
  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await faceDetector.setOptions({ runningMode: "IMAGE" });
  }
  const ratio = event.target.height / event.target.naturalHeight;
  const detections = faceDetector.detect(event.target).detections;
  console.log(detections);
  displayDetections(detections, event.target, ratio);
}

// Display detections on image
function displayDetections(detections, resultElement, ratio) {
  for (let detection of detections) {
    const p = document.createElement("p");
    p.setAttribute("class", "info");
    p.innerText =
      "Confidence: " +
      Math.round(parseFloat(detection.categories[0].score) * 100) +
      "% .";
    p.style = `left: ${detection.boundingBox.originX * ratio}px; top: ${
      detection.boundingBox.originY * ratio - 30
    }px; width: ${detection.boundingBox.width * ratio - 10}px; height: 20px;`;

    const highlighter = document.createElement("div");
    highlighter.setAttribute("class", "highlighter");
    highlighter.style = `left: ${
      detection.boundingBox.originX * ratio
    }px; top: ${detection.boundingBox.originY * ratio}px; width: ${
      detection.boundingBox.width * ratio
    }px; height: ${detection.boundingBox.height * ratio}px;`;

    resultElement.parentNode.appendChild(highlighter);
    resultElement.parentNode.appendChild(p);

    for (let keypoint of detection.keypoints) {
      const keypointEl = document.createElement("div");
      keypointEl.className = "key-point";
      keypointEl.style = `top: ${
        keypoint.y * resultElement.height - 3
      }px; left: ${keypoint.x * resultElement.width - 3}px;`;
      resultElement.parentNode.appendChild(keypointEl);
    }
  }
}

// Demo 2: Webcam face detection
let video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
let enableWebcamButton;

const hasGetUserMedia = () =>
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

var children = [];

if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

async function enableCam() {
  if (!faceDetector) {
    alert("Face Detector is still loading. Please try again..");
    return;
  }
  enableWebcamButton.classList.add("removed");
  const constraints = { video: true };
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      video.srcObject = stream;
      video.addEventListener("loadeddata", predictWebcam);
    })
    .catch((err) => {
      console.error(err);
    });
}

let lastVideoTime = -1;
async function predictWebcam() {
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await faceDetector.setOptions({ runningMode: "VIDEO" });
  }
  let startTimeMs = performance.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const detections = faceDetector.detectForVideo(
      video,
      startTimeMs
    ).detections;
    displayVideoDetections(detections);
  }
  window.requestAnimationFrame(predictWebcam);
}

function displayVideoDetections(detections) {
  for (let child of children) {
    liveView.removeChild(child);
  }
  children = [];
  for (let detection of detections) {
    const p = document.createElement("p");
    p.innerText =
      "Confidence: " +
      Math.round(parseFloat(detection.categories[0].score) * 100) +
      "% .";
    p.style = `left: ${
      video.offsetWidth -
      detection.boundingBox.width -
      detection.boundingBox.originX
    }px; top: ${detection.boundingBox.originY - 30}px; width: ${
      detection.boundingBox.width - 10
    }px;`;

    const highlighter = document.createElement("div");
    highlighter.setAttribute("class", "highlighter");
    highlighter.style = `left: ${
      video.offsetWidth -
      detection.boundingBox.width -
      detection.boundingBox.originX
    }px; top: ${detection.boundingBox.originY}px; width: ${
      detection.boundingBox.width - 10
    }px; height: ${detection.boundingBox.height}px;`;

    liveView.appendChild(highlighter);
    liveView.appendChild(p);
    children.push(highlighter, p);

    for (let keypoint of detection.keypoints) {
      const keypointEl = document.createElement("div");
      keypointEl.className = "key-point";
      keypointEl.style = `top: ${
        keypoint.y * video.offsetHeight - 3
      }px; left: ${video.offsetWidth - keypoint.x * video.offsetWidth - 3}px;`;
      liveView.appendChild(keypointEl);
      children.push(keypointEl);
    }
  }
}
