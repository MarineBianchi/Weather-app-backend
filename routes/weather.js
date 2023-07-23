var express = require('express');
var router = express.Router();

const fetch = require('node-fetch');
const City = require('../models/cities');

let API_KEY = process.env.API_KEY;


// ROUTE POST ---------------------------------------------------
//  réceptionne la ville présente dans req.body.cityName, l’envoie à Openweathermap qui communique ses informations météorologiques en degrés celsius et enregistre la ville et ses informations en BDD

router.post('/', (req, res) => {
	// Vérifier que la ville n'a pas été dejà ajoutée

	// Regex pour rendre la recherche insensible à la case
	City.findOne({ cityName: { $regex: new RegExp(req.body.cityName, 'i') } }).then(dbData => {
		if (dbData === null) {
			// Request à l'API pour accèder à la data
			fetch(`https://api.openweathermap.org/data/2.5/weather?q=${req.body.cityName}&appid=${API_KEY}&units=metric`)
				.then(response => response.json())
				.then(apiData => {
		// Création d'un nouveau doc avec la ville à partir du schéma
					const newCity = new City({
						cityName: req.body.cityName,
						main: apiData.weather[0].main,
						description: apiData.weather[0].description,
						tempMin: apiData.main.temp_min,
						tempMax: apiData.main.temp_max,
					});

					// On sauvegarde dans la BDD
					newCity.save().then(newDoc => {
						res.json({ result: true, weather: newDoc });
					});
				});
		} else {
			// Sauf si la data n'est pas null alors elle existe déjà 
			res.json({ result: false, error: 'City already saved' });
		}
	});
});


// ROUTE GET ---------------------------------------------------
// Renvoie la liste de toutes les villes enregistrées en BDD

router.get('/', (req, res) => {

	City.find().then(data => {
		res.json({ weather: data });
	});
});


// renvoie uniquement les informations présentes en BDD de la ville ciblée
router.get("/:cityName", (req, res) => {
  City.findOne({
    cityName: { $regex: new RegExp(req.params.cityName, "i") },
  }).then(data => {
    if (data) {
      res.json({ result: true, weather: data });
    } else {
      res.json({ result: false, error: "City not found" });
    }
  });
});


// ROUTE DELETE ---------------------------------------------------
// supprime la ville ciblée (params) de la collection cities en BDD et renvoie la liste des villes restantes. 

router.delete("/:cityName", (req, res) => {
  City.deleteOne({
    cityName: { $regex: new RegExp(req.params.cityName, "i") },
  }).then(deletedDoc => {
    if (deletedDoc.deletedCount > 0) {
      // document bien supprimé car le deletedCound est un compteur de suppression donc si > 0 alors une ville à été supprimée
      City.find().then(data => {
        res.json({ result: true, weather: data });
      });
    } else {
      res.json({ result: false, error: "City not found" });
    }
  });
});

module.exports = router;
