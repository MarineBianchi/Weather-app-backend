var express = require('express');
var router = express.Router();

const User = require('../models/users');

// Import d'une fonction checkBody() qui recoit un objet contenant le body renvoyé par les formulaires d’inputs. Si chaque élément de celui-ci existe et que le nombre d’éléments est le bon, la fonction renvoit true et sinon false.

const { checkBody } = require('../modules/checkBody');


// Route pour s'inscrire 

router.post('/signup', (req, res) => {

  // Vérifier que tous les champs sont remplis avec la fonction du module checkBody
  if (!checkBody(req.body, ['name', 'email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Vérifier si l'utilisateur n'est pas dejà existant dansla BDD
  User.findOne({ email: req.body.email }).then(data => {
    if (data === null) {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });

      newUser.save().then(() => {
        res.json({ result: true });
      });
    } else {
      // Si dejà existant : erreur
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

// Route pour se connecter
router.post('/signin', (req, res) => {

  // Pareil vérifier que les champs sont remplis
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  // Methode findOne pour chercher un utilisateur et vérifier que le mail et password correspondent
  User.findOne({ email: req.body.email, password: req.body.password }).then(data => {
    if (data) {
      res.json({ result: true });
    } else {
      res.json({ result: false, error: 'User not found' });
    }
  });
});

module.exports = router;
