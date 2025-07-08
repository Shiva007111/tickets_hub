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
 router.put('/events/:eventId/update', eventController.updateEvent);
 router.get('/events/:event_id/details', eventController.getEventDetails)
router.get('/events/:event_id/push_to_ott', eventController.eventPublish);
router.get('/events/:event_id/get_fulldetails', eventController.getEventDetailsv2);

// Pricing Routes
 router.post('/orgniser/:orgId/events/:eventId/createpricing',pricingController.createTier);
 router.put('/ticketplan/:tier_id/update', pricingController.updateTier);
 router.get('/ticketplan/:tier_id/details', pricingController.getTierById);
 router.delete('/ticketplan/:tier_id/delete', pricingController.deleteTier);
 router.get('/events/:event_id/get_tiers', pricingController.getAllTiersByEvent)



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
