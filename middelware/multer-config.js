const multer = require('multer');
const sharpMulter = require('sharp-multer');

// On vient définir les mimetypes que l'on souhaite autoriser
const MIME_TYPES = {
	'image/jpg': 'jpg',
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
};

// On vient utiliser sharpMulter qui est une librairie plus simple à utiliser
// que sharp et multer en simultané, elle simplifie énormément la syntaxe en
// utilisant les propriétés de ces deux dernières

// On stocke nos images dans le dossier images, on les resize et on utilise
// la propriété "inside" sur le resizeMode qui permet de prendre la largeur max
// définie et de conserver le ratio de l'image. On la change aussi en .webp
const storage = sharpMulter({
	destination: (req, file, callback) => {
		callback(null, 'images');
	},
	imageOptions: {
		fileFormat: 'webp',
		quality: 80,
		resize: { width: 500, height: 700, resizeMode: 'inside' },
		useTimestamp: true,
	},
});

// On vient vérifier le mimetype pour refuser les fichiers non valides
const fileFilter = (req, file, callback) => {
	if (!MIME_TYPES[file.mimetype]) {
		callback(new Error('Veuillez passer un fichier valide'));
	} else {
		callback(null, true);
	}
};

module.exports = multer({ storage: storage, fileFilter: fileFilter }).single('image');