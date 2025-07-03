const express = require('express')
const orgController = require('../controllers/organiserControllers');
const platfromController = require('../controllers/platfromController');
const eventController = require('../controllers/eventController')
const pricingController = require('../controllers/pricingController')
const router = express.Router();

//organisers routes 
router.post('/organiser/create', orgController.create);
router.get('/organiser/all', orgController.getAllOrgs);
router.get('/organiser/:id/getItem', orgController.ItemDetails);
router.put('/organiser/:id/update', orgController.UpdateItem);

//event Routes
 router.post('/events/:orgId/create', eventController.create);
 router.get('/events/:orgId/getall', eventController.getAllEvents);

// Pricing Routes
 router.post('/orgniser/:orgId/events/:eventId/createpricing',pricingController.createTier)


//paltform settings
router.post('/platforms/genres/create', platfromController.genreCreate);
router.get('/platforms/genres/all', platfromController.genreAll);
router.delete('/platforms/genres/:id', platfromController.genreDelete);

router.post('/platforms/locations/create', platfromController.locationCreate);
router.get('/platforms/locations/all', platfromController.locationAll);
router.delete('/platforms/locations/:id', platfromController.locationDelete);

router.post('/platforms/languages/create', platfromController.languageCreate);
router.get('/platforms/languages/all', platfromController.languageAll);
router.delete('/platforms/languages/:id', platfromController.locationDelete);


module.exports = router;
