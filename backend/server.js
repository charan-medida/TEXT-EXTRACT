const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  const username = req.headers['x-user-name'];

  if (username !== 'Charan') {
    return res.status(401).json({ message: 'Authentication is not verified' });
  }

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const subscriptionKey = 'ed51ff1e4fbe4321893779738c37d762';
    const endpoint = 'https://mscomputervisionpath.cognitiveservices.azure.com/vision/v3.2/ocr';
    const imageBuffer = req.file.buffer;

    const formData = new FormData();
    formData.append('image', imageBuffer);

    const options = {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      params: {
        'language': 'unk',
        'detectOrientation': 'true',
      },
    };

    const response = await axios.post(endpoint, imageBuffer, options);
    const extractedText = response.data.regions.map(region =>
      region.lines.map(line =>
        line.words.map(word => word.text).join(' ')
      ).join('\n')
    ).join('\n');

    res.json({ text: extractedText });
  } catch (error) {
    console.error('Error extracting text:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
