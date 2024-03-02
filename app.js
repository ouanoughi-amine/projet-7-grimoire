
const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const cors = require('cors');
const path = require('path');

// Import des packages qui vont nous servir à sécuriser l'app et la BDD
// Helmet sécurise les headers et mongoSanitize vient supprimer
// les requêtes malveillantes
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

require('dotenv').config();


const uri = 'mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.uq3tici.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(uri, {
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


const app = express();

// On vient utiliser helmet pour rajouter une sécurité sur les headers
// mais on supprime sa propriété crossOriginRessourcePolicy car on gère déjà
// les CORS de notre côté
app.use(
	helmet({
		crossOriginResourcePolicy: false,
	})
);

// Middleware pour gérer les requêtes CORS
app.use(cors());


app.use(express.json());

// On vient utiliser mongoSanitize après avoir parsé notre requête
// afin de venir y éliminer les potentielles injections malveillantes
app.use(mongoSanitize());

app.use('/api/books', bookRoutes);
app.use('/api/auth' , userRoutes );
// Nous permet de servir les images dans l'app
app.use('/images', express.static(path.join(__dirname, 'images')));
module.exports = app;
