const multer = require('multer');

// Le dictionnaire de MIME TYPES
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
// La destination du fichier (repertoire) 
// et générer un nom de fichier unique
const storage = multer.diskStorage({
  // La destination de stockage du fichier
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    // Supprimer les éspaces dans le nom du fichier
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');