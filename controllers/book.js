const Book = require('../models/Book');
const fs = require('fs');

// Récupérer tout les livres
exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({message : "Erreur dans l'affichage des livres", error : error.message}));  
};
// Créer un livre
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

//fonction qui  récupére un livre 
 exports.getOneBook =(req, res , next) => {
  Book.findOne({ _id : req.params.id})
  .then(book => res.status(200).json(book))
  .catch(error => res.status(404).json({ error}));
 };

//fonction qui  modifie un livre dans la base de données
exports.modifyOneBook = (req, res, next) => {
  // Crée un objet bookObject en fonction de la présence d'un fichier
  const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
// Supprime le champ _userId de l'objet bookObject avant de le modifier dans la base de données
      delete bookObject._userId;
// Recherche le livre par son identifiant
    Book.findOne({ _id: req.params.id })
      .then((book) => {
          // Vérifie si l'utilisateur est autorisé à modifier ce livre
          if (book.userId != req.auth.userId) {
              // Si l'utilisateur n'est pas autorisé, retourne une erreur 401
              res.status(401).json({ message: 'Not authorized' });
          } else {
              // Si l'utilisateur est autorisé, met à jour le livre dans la base de données
              Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                  .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
    });
};

// Cette fonction supprime un livre de la base de données
exports.deleteOneBook = (req, res, next) =>{
      // Recherche le livre par son identifiant
  Book.findOne({ _id:req.params.id})
    .then(book => {
        // Vérifie si l'utilisateur est autorisé à supprimer ce livre
        if(book.userId != req.auth.userId) {
        // Vérifie si l'utilisateur est autorisé à supprimer ce livre
          res.status(401).json({message : 'Not authorized'});
        } else {
        // Récupère le nom du fichier image
          const filename = book.imageUrl.split('/images/')[1];
        // Supprime le fichier image du serveur
          fs.unlink(`images/${filename}` , () =>{
          // Supprime le livre de la base de données
            Book.deleteOne({ _id:req.params.id})
              .then(() => {res.status(200).json({message : ' Objet supprimé ! '})})
              .catch(error => res.status(401).json({error}));
          });
        }
    })
    .catch(error => {
      res.status(500).json({error});
    });
};

// Cette fonction permet de noter  un livre 
exports.createRating = (req, res, next) => {
	Book.findOne({ _id: req.params.id })
		.then(book => {
			// On vient vérifier si un rating existe pour le user connecté, si c'est le cas, on le stocke dans
			// une variable
			const hasAlreadyVoted = book.ratings.find(rating => rating.userId === req.auth.userId);

			// Notre condition nous dit que si on a null, undefined, 0 ou false, on passe
			// ce qui veut dire que si on a trouvé aucun rating pour un user, il ou elle peut voter.
			if (!hasAlreadyVoted) {
				book.ratings.push({ userId: req.auth.userId, grade: req.body.rating });

				const ratings = book.ratings.map(rating => rating.grade);

				// On vient calculer notre moyenne avec la méthode reduce pour faire la somme
				// de toutes les notes et on la divise par la taille de notre tableau.
				// On utilise la méthode toFixed() pour arrondir à une décimale après la virgule.
				let averageRating =
					ratings.reduce((previous, current) => {
						return previous + current;
					}, 0) / ratings.length;
				averageRating = averageRating.toFixed(1);

				Book.findByIdAndUpdate(
					{ _id: req.params.id },
					{ ratings: book.ratings, averageRating: averageRating },
					{ new: true }
				)
					.then(book => res.status(200).json(book))
					.catch(error => res.status(401).json({ error }));
			} else {
				return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
			}
		})
		.catch(error => {
			return res.status(500).json({ error });
		});
};
// Cette fonction permet d'avoir les 3 livres les mieux notés  
exports.getBestRating = (req, res, next) => {
  // On vient utiliser la méthode sort avec la clé que l'on veut sort
  // + "-1" pour spécifier que c'est par ordre décroissant
  // On utilise la méthode limit avec "3" pour ne garder que 3 résultats
    Book.find()
      .sort({ averageRating: -1 })
      .limit(3)
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({ error }));
};