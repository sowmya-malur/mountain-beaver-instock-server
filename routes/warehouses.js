const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const router = express.Router();

// Define the path to the data file
const dataFilePath = path.join(__dirname, '../data/videos.json');

// Load initial data from file
let videos = loadVideosData();

// Middleware to parse JSON bodies
router.use(express.json());

// Get all videos
router.get('/', (req, res) => {
  res.json(videos);
});

// Get a specific video by ID
router.get('/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  const video = videos.find(video => video.id === videoId);

  if (video) {
    res.json(video);
  } else {
    res.status(404).send('Video not found');
  }
});

// Add a video
router.post('/', (req, res) => {
  const { title, channel, image, description, views, likes, duration, video, timestamp, comments } = req.body;
  const newVideo = {
    id: uuidv4(),
    title, channel, image, description, views, likes, duration, video, timestamp: timestamp || Date.now(), comments: comments || []
  };

  videos.push(newVideo);
  saveDataToFile(videos); // Save the updated videos array to file

  res.status(201).json(newVideo);
});
// POST a comment to a specific video
router.post('/:videoId/comments', (req, res) => {
  const { videoId } = req.params;
  const { name, comment, likes } = req.body; // Extract comment fields from the request body

  // Find the video by ID
  const video = videos.find(video => video.id === videoId);

  if (video) {
    // Create a new comment object with the specified fields
    const newComment = {
      id: uuidv4(), // Generate a unique ID for the comment
      name,
      comment,
      likes,
      timestamp: Date.now(), // Use current time for timestamp; overwrite if provided in request
    };

    // Add the new comment to the video's comments array
    video.comments.push(newComment);

    // Save the updated videos data to the file
    saveDataToFile(videos);

    // Respond with the new comment
    res.status(201).json(newComment);
  } else {
    // Video not found
    res.status(404).send('Video not found');
  }
});

// Function to save data to a file
function saveDataToFile(data) {
  try {
    // Using writeFileSync for simplicity; consider async alternatives for production
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving data to file.', err);
  }
}

// Function to load videos data from file
function loadVideosData() {
  try {
    // Read the file synchronously at startup
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading videos data from file:', err);
    return []; // Return an empty array in case of error
  }
}

module.exports = router;
