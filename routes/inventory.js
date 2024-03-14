const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory-controller');

router
    .route('/')
    .get(inventoryController.inventories)
    .post(inventoryController.add);

router
    .route("/:id")
    .get(inventoryController.findOne)
router 
    .route("/update/:id")
    .put(inventoryController.update);
    
router
    .route("/remove/:id")
    .delete(inventoryController.remove);
module.exports = router;
