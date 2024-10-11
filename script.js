// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // Serve static files from the 'public' directory

// MongoDB connection
mongoose.connect('mongodb+srv://romeobot555:mdraselm325@cluster0.ue47qhn.mongodb.net/pastebin?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Paste schema
const pasteSchema = new mongoose.Schema({
  urlId: { type: String, required: true, unique: true },
  content: { type: String, required: true },
});

const Paste = mongoose.model('Paste', pasteSchema);

// POST route to save paste
app.post('/save', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      console.log('No text provided');
      return res.status(400).json({ error: 'Text content is required.' });
    }

    console.log('Received text:', text);

    const urlId = nanoid(7);  // Generate a random 7-character ID
    const newPaste = new Paste({ urlId, content: text });
    await newPaste.save();

    console.log('Paste saved successfully:', newPaste);

    res.json({ url: `http://localhost:${PORT}/view/${urlId}` });
  } catch (error) {
    console.error('Error saving paste:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET route to view paste
app.get('/view/:urlId', async (req, res) => {
  try {
    const paste = await Paste.findOne({ urlId: req.params.urlId });
    if (!paste) {
      return res.status(404).send('Paste not found');
    }
    res.send(`<pre>${paste.content}</pre>`);
  } catch (error) {
    console.error('Error fetching paste:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});