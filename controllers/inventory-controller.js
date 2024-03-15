const knex = require("knex")(require("../knexfile"));
const { response } = require("express");
const { sortList } = require("./sort.js");

const inventories = async (req, res) => {
  try {
    const data = await knex("inventories");
    const warehouse = await knex("warehouses").where({
      id: data[0].warehouse_id,
    });
    const name = warehouse[0].warehouse_name;
    const newData = data.map((item) => ({ warehouse_name: name, ...item }));
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

const findOne = async (req, res) => {
  try {
    const inventoriesFound = await knex("inventories").where({
      id: req.params.id,
    });

    if (inventoriesFound.length === 0) {
      return res.status(404).json({
        message: `inventory with ID ${req.params.id} not found`,
      });
    }
    const inventoryData = inventoriesFound[0];
    const warehouse = await knex("warehouses").where({
      id: inventoryData.warehouse_id,
    });
    const warehouse_name = warehouse[0].warehouse_name;
    const response = { warehouse_name, ...inventoryData };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve inventory data for inventory with ID ${req.params.id}`,
    });
  }
};
const add = async (req, res) => {
  // Check for required fields in the request body
  if (
    !req.body.item_name ||
    !req.body.description ||
    !req.body.category ||
    !req.body.status ||
    !req.body.quantity
  ) {
    return res.status(400).json({
      message:
        "Please provide item name, description, category, status, and quantity for the inventory.",
    });
  }

  // Prepare the data for insertion by excluding the 'id' field, if present
  const { id, ...insertData } = req.body;

  try {
    // Insert the inventory data into the database
    const result = await knex("inventories").insert(insertData);

    // Retrieve the ID of the newly inserted inventory record
    // Note: The structure of 'result' may vary based on the database used. Adjust as necessary.
    const newInventoryId = result[0];

    // Fetch the newly created inventory record from the database
    const [createdInventory] = await knex("inventories").where({
      id: newInventoryId,
    });

    // Respond with the newly created inventory record
    res.status(201).json(createdInventory);
  } catch (error) {
    // Handle any errors that occur during the database operations
    res.status(500).json({
      message: `Unable to create new inventory: ${error.message}`,
    });
  }
};

const update = async (req, res) => {
  try {
    const rowsUpdated = await knex("inventories")
      .where({ id: req.params.id })
      .update(req.body);

    if (rowsUpdated === 0) {
      return res.status(404).json({
        message: `inventory with ID ${req.params.id} not found`,
      });
    }

    const updatedInventory = await knex("inventories").where({
      id: req.params.id,
    });

    res.json(updatedInventory[0]);
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
