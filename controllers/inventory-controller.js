const knex = require("knex")(require("../knexfile"));

const inventories = async (_req, res) => {
  try {
    const data = await knex("inventories");
    res.status(200).json(data);
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
 * @returns A JSON response containing the inventory item data and corresponding warehouse name.
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

    // Destructure inventoryData and add warehouse name
    const { warehouse_id, ...restInventoryData } = inventoryData;
    const response = {
      warehouse_name: warehousesFound[0].warehouse_name,
      ...restInventoryData,
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
  // Check for required fields in the request body
  if (
    !req.body.item_name ||
    !req.body.description ||
    !req.body.category ||
    !req.body.status ||
    !req.body.category ||
    !req.body.quantity
  ) {
    return res.status(400).json({
      message: "Please provide name and email for the inventory.",
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
