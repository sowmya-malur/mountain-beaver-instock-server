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
    .put(inventoryController.update)
    .delete(inventoryController.remove);

module.exports = router;
