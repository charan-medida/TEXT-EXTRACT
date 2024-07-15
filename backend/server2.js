const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const cors = require('cors');

const app = express();
const port = 5001;

app.use(cors());

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/extract-text', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');

    res.json({ text });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Text extraction server running on http://localhost:${port}`);
});
