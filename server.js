const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

let videos = []; // hier speichern wir alle hochgeladenen Videos im Speicher

// Speicherort und Dateiname für Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Statische Dateien (HTML, CSS, JS)
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Route: Upload
app.post('/upload', upload.single('video'), (req, res) => {
  const videoData = {
    title: req.body.title,
    url: '/uploads/' + req.file.filename
  };
  videos.push(videoData);
  res.sendStatus(200);
});

// Route: Liste der Videos
app.get('/videos', (req, res) => {
  res.json(videos);
});

// Route: Video löschen
app.delete('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (id >= 0 && id < videos.length) {
    const filePath = path.join(__dirname, videos[id].url);
    
    // Datei auf Festplatte löschen
    fs.unlink(filePath.replace('/uploads', 'uploads'), (err) => {
      if (err) console.error(err);
    });

    // Aus Liste löschen
    videos.splice(id, 1);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Server starten
app.listen(port, () => {
  console.log(`✅ Server läuft auf http://localhost:${port}`);
});
