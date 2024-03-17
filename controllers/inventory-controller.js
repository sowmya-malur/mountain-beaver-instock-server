const knex = require("knex")(require("../knexfile"));

const { response } = require("express");
const { sortList } = require("./sort.js");

const inventories = async (req, res) => {
  try {
    const data = await knex("inventories");
    const warehouses = await knex("warehouses");
    const newData = data.map((item) => {
      const warehouse = warehouses.find(
        (house) => house.id === item.warehouse_id
      );
      const name = warehouse.warehouse_name;
      return { warehouse_name: name, ...item };
    });
    const response = sortList(newData, req.query.sort_by, req.query.order_by);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).send(`Error retrieving inventories: ${err}`);
  }
};

const index = async (_req, res) => {
  try {
    const data = await knex("inventories");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving inventories: ${err}`);
  }
};

/**
 * Finds a single inventory item by ID.
 * @param {*} req - The request object containing the id of the inventory.
 * @param {*} res - The response object.
 * @returns A JSON response containing the inventory item data id, desc, item name, category, quantity, status and corresponding warehouse name.
 */
const findOne = async (req, res) => {
  try {
    // Find inventory item by id
    const inventoriesFound = await knex("inventories").where({
      id: req.params.id,
    });

    // If no inventory item found, return 404
    if (inventoriesFound.length === 0) {
      return res.status(404).json({
        message: `inventory with ID ${req.params.id} not found`,
      });
    }

    // Extract the first inventory item found
    const inventoryData = inventoriesFound[0];

    // Find warehouse by id
    const warehousesFound = await knex("warehouses").where({
      id: inventoryData.warehouse_id,
    });

    //if warehouse doesn't exist, response 404
    if (warehousesFound.length === 0) {
      return res.status(404).json({
        message: `warehouse with ID ${req.params.id} not found`,
      });
    }

    // Constuct response
    const response = {
      id: inventoryData.id,
      warehouse_id: warehousesFound[0].warehouse_name,
      warehouse_name: warehousesFound[0].warehouse_name,
      item_name: inventoryData.item_name,
      description: inventoryData.description,
      category: inventoryData.category,
      status: inventoryData.status,
      quantity: inventoryData.quantity,
    };

    // Return the response with 200 status
    res.status(200).json(response);
  } catch (error) {
    // Handle internal server error
    res.status(500).json({
      message: `Unable to retrieve inventory data for inventory with ID ${req.params.id}`,
    });
  }
};

const add = async (req, res) => {
  try {
    // Check for required fields in the request body
    if (
      !req.body.warehouse_id ||
      !req.body.item_name ||
      !req.body.description ||
      !req.body.category ||
      !req.body.status ||
      !req.body.quantity
    ) {
      return res.status(400).json({
        message:
          "Please provide warehouse id, item name, description, category, status, and quantity for the inventory.",
      });
    }

    // Check if the quantity is not a number.
    if (isNaN(req.body.quantity)) {
      return res.status(400).json({
        message: "Quantity must be a number.",
      });
    }

    // Check if the quantity is not a whole number.
    if (!Number.isInteger(Number(req.body.quantity))) {
      return res.status(400).json({
        message: "Quantity must be a whole number.",
      });
    }

    // Check if quantity is zero or less.
    if (req.body.status === "In stock" && req.body.quantity <= 0) {
      return res.status(400).json({
        message: "Quantity cannot be zero(0).",
      });
    }

    // Check if the warehouse exists
    const warehousesFound = await knex("warehouses").where({
      id: req.body.warehouse_id,

    });

    if (warehousesFound.length === 0) {
      return res.status(404).json({
        message: `warehouse with ID ${req.body.warehouse_id} not found`,
      });
    }

    // Prepare the data for insertion by excluding the 'id' field, if present
    const { id, ...insertData } = req.body;

    // Insert the inventory data into the database
    const result = await knex("inventories").insert(insertData);

    // Retrieve the ID of the newly inserted inventory record
    const newInventoryId = result[0];

    // Fetch the newly created inventory record from the database
    const [createdInventory] = await knex("inventories").where({
      id: newInventoryId,
    });

     // Remove created_at and updated_at fields from the response
     const responseWithoutDates = Object.fromEntries(
      Object.entries(createdInventory).filter(
        ([key, value]) => key !== "created_at" && key !== "updated_at"
      )
    );

    // Respond with the newly created inventory record
    res.status(201).json(responseWithoutDates);

  } catch (error) {
    // Handle any errors that occur during the database operations
    res.status(500).json({
      message: `Unable to create new inventory: ${error.message}`,
    });
  }
};

const update = async (req, res) => {
  try {
    // Check for required fields in the request body
    if (
      !req.body.warehouse_id ||
      !req.body.item_name ||
      !req.body.description ||
      !req.body.category ||
      !req.body.status ||
      !req.body.quantity
    ) {
      return res.status(400).json({
        message:
          "Please provide warehouse id, item name, description, category, status, and quantity for the inventory.",
      });
    }

    // Check if the quantity is not a number.
    if (isNaN(req.body.quantity)) {
      return res.status(400).json({
        message: "Quantity must be a number.",
      });
    }

    // Check if the quantity is not a whole number.
    if (!Number.isInteger(Number(req.body.quantity))) {
      return res.status(400).json({
        message: "Quantity must be a whole number.",
      });
    }

    // Check if quantity is zero or less.
    if (req.body.status === "In stock" && req.body.quantity <= 0) {
      return res.status(400).json({
        message: "Quantity cannot be zero(0).",
      });
    }

    // Check if the warehouse exists
    const warehousesFound = await knex("warehouses").where({
      id: req.body.warehouse_id,
    });

    if (warehousesFound.length === 0) {
      return res.status(404).json({
        message: `warehouse with ID ${req.body.warehouse_id} not found`,
      });
    }

    const rowsUpdated = await knex("inventories")
      .where({ id: req.params.id })
      .update(req.body);

    if (rowsUpdated === 0) {
      return res.status(404).json({
        message: `inventory with ID ${req.params.id} not found`,
      });
    }

    const [updatedInventory] = await knex("inventories").where({
      id: req.params.id,
    });

    // Remove created_at and updated_at fields from the response
    const responseWithoutDates = Object.fromEntries(
      Object.entries(updatedInventory).filter(
        ([key, value]) => key !== "created_at" && key !== "updated_at"
      )
    );

    // Respond with the newly created warehouse record
    res.status(201).json(responseWithoutDates);
  } catch (error) {
    res.status(500).json({
      message: `Unable to update inventory with ID ${req.params.id}: ${error}`,
    });
  }
};

const remove = async (req, res) => {
  try {
    const rowsDeleted = await knex("inventories")
      .where({ id: req.params.id })
      .delete();

    if (rowsDeleted === 0) {
      return res
        .status(404)
        .json({ message: `inventory with ID ${req.params.id} not found` });
    }
    // No Content response
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: `Unable to delete inventory: ${error}`,
    });
  }
};

module.exports = {
  index,
  inventories,
  findOne,
  add,
  update,
  remove,
};
