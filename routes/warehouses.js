const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouse-controller');

router
    .route('/')
    .get(warehouseController.warehouses)
    .post(warehouseController.add);

router
    .route("/:id")
    .get(warehouseController.findOne)
    .put(warehouseController.update)
    .delete(warehouseController.remove);

module.exports = router;
