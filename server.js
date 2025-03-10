const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Serve static files from node_modules and public folder
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use(express.static(path.join(__dirname, "public")));

// Basic routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/audio_classifier", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "audio_classifier.html"));
});

app.get("/blockly", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "blockly.html"));
});

app.get("/pose_detect", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pose_detect.html"));
});

app.get("/face_detect", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "face_detect.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
