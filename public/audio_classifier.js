// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0
import audio from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio@0.10.0";
const { AudioClassifier, FilesetResolver } = audio;

let audioClassifier;
let audioCtx;

// Initialize the Audio Classifier
const createAudioClassifier = async () => {
  const audio = await FilesetResolver.forAudioTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-audio@0.10.0/wasm"
  );
  audioClassifier = await AudioClassifier.createFromOptions(audio, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/audio_classifier/yamnet/float32/1/yamnet.tflite",
    },
  });
};

// Run classification on uploaded audio file
async function classifyUploadedAudio(audioFile) {
  if (!audioClassifier) {
    alert("Audio Classifier is still loading. Please wait and try again.");
    return;
  }

  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  const output = document.getElementById("audioResult");
  output.innerHTML = "Processing audio...";

  try {
    // Read the audio file as an array buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    // Classify the audio
    const results = audioClassifier.classify(
      audioBuffer.getChannelData(0),
      audioBuffer.sampleRate
    );

    displayClassificationResults(results, output);
  } catch (error) {
    output.innerHTML = `Error: ${error.message}`;
    console.error("Audio classification error:", error);
  }
}

// Display classification results in a table
function displayClassificationResults(results, output) {
  output.innerHTML = ""; // Clear previous results

  // Create table
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "10px";

  // Table headers
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const headers = ["Timestamp (ms)", "Category", "Confidence"];

  headers.forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.padding = "8px";
    th.style.background = "#f5f5f5";
    th.style.borderBottom = "1px solid #ddd";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement("tbody");
  for (const result of results) {
    const categories = result.classifications[0].categories;
    const timestamp = result.timestampMs;

    const topCategory = categories[0].categoryName;
    const topScore = categories[0].score.toFixed(3);

    const tr = document.createElement("tr");
    const cells = [timestamp, topCategory, topScore];

    cells.forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      td.style.padding = "8px";
      td.style.borderBottom = "1px solid #ddd";
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  output.appendChild(table);
}

// Handle audio file upload
const audioUpload = document.getElementById("audioUpload");
audioUpload.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    await classifyUploadedAudio(file);
  }
});

// Initialize the classifier when the script loads
createAudioClassifier();
