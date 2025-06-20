const express = require('express')
const orgController = require('../controllers/organiserControllers');
const platfromController = require('../controllers/platfromController');
const router = express.Router();

//organisers routes 
router.post('/organiser/create', orgController.create);
router.get('/organiser/all', orgController.getAllOrgs);
router.get('/organiser/:id/getItem', orgController.ItemDetails);
router.put('/organiser/:id/update', orgController.UpdateItem);

//event Routes
// router.put('/event/:id/create', eventController.create);

//paltform settings
router.post('/platforms/genres/create', platfromController.genreCreate);
router.get('/platforms/genres/all', platfromController.genreAll);
router.delete('/platforms/genres/:id', platfromController.genreDelete);

router.post('/paltforms/locations/create', platfromController.locationCreate);
router.get('/platforms/locations/all', platfromController.locationAll);
router.delete('/platforms/locations/:id', platfromController.locationDelete);

router.post('/paltforms/languages/create', platfromController.languageCreate);
router.get('/platforms/languages/all', platfromController.languageAll);
router.delete('/platforms/languages/:id', platfromController.locationDelete);


module.exports = router;
