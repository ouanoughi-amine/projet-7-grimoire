const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/book');
const auth = require('../middelware/auth')
const multer = require('../middelware/multer-config');


router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRating);
router.get('/:id', bookCtrl.getOneBook);

 router.post('/', auth, multer, bookCtrl.createBook);
 router.post('/:id/rating',auth, bookCtrl.createRating);

router.put('/:id' ,auth, multer, bookCtrl.modifyOneBook);
router.delete('/:id',auth, bookCtrl.deleteOneBook);

module.exports = router;