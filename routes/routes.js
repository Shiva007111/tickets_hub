const express = require('express')
const orgController = require('../controllers/organiserControllers');
console.log(orgController);
const router = express.Router();

router.post('/organiser/create', orgController.create);
router.get('/organiser/all', orgController.getAllOrgs);
router.get('/organiser/:id/getItem', orgController.ItemDetails);
router.put('/organiser/:id/update', orgController.UpdateItem);


module.exports = router;
