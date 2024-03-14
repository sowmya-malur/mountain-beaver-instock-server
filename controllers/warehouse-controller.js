const knex = require("knex")(require("../knexfile"));
const { sortList } = require("./sort.js");

const warehouses = async (req, res) => {
  try {
    const data = await knex("warehouses");
    const response = sortList(data, req.query.sort_by, req.query.order_by);
    res.status(200).json(response);
  } catch (err) {
    res.status(400).send(`Error retrieving warehouses: ${err}`);
  }
};

const index = async (_req, res) => {
  try {
    const data = await knex("warehouses");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving warehouses: ${err}`);
  }
};

const findOne = async (req, res) => {
  try {
    const warehousesFound = await knex("warehouses").where({
      id: req.params.id,
    });

    if (warehousesFound.length === 0) {
      return res.status(404).json({
        message: `warehouse with ID ${req.params.id} not found`,
      });
    }

    const warehouseData = warehousesFound[0];
    res.json(warehouseData);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve warehouse data for warehouse with ID ${req.params.id}`,
    });
  }
};
const add = async (req, res) => {
  // Check for required fields in the request body
  if (
    !req.body.warehouse_name ||
    !req.body.address ||
    !req.body.city ||
    !req.body.country ||
    !req.body.contact_name ||
    !req.body.contact_position ||
    !req.body.contact_phone ||
    !req.body.contact_email
  ) {
    return res.status(400).json({
      message: "Please provide name and email for the warehouse.",
    });
  }

  // Prepare the data for insertion by excluding the 'id' field, if present
  const { id, ...insertData } = req.body;

  try {
    // Insert the warehouse data into the database
    const result = await knex("warehouses").insert(insertData);

    // Retrieve the ID of the newly inserted warehouse record
    // Note: The structure of 'result' may vary based on the database used. Adjust as necessary.
    const newWarehouseId = result[0];

    // Fetch the newly created warehouse record from the database
    const [createdWarehouse] = await knex("warehouses").where({
      id: newWarehouseId,
    });

    // Respond with the newly created warehouse record
    res.status(201).json(createdWarehouse);
  } catch (error) {
    // Handle any errors that occur during the database operations
    res.status(500).json({
      message: `Unable to create new warehouse: ${error.message}`,
    });
  }
};

const update = async (req, res) => {
  try {
    const rowsUpdated = await knex("warehouses")
      .where({ id: req.params.id })
      .update(req.body);

    if (rowsUpdated === 0) {
      return res.status(404).json({
        message: `warehouse with ID ${req.params.id} not found`,
      });
    }

    const updatedWarehouse = await knex("warehouses").where({
      id: req.params.id,
    });

    res.json(updatedWarehouse[0]);
  } catch (error) {
    res.status(500).json({
      message: `Unable to update warehouse with ID ${req.params.id}: ${error}`,
    });
  }
};

const remove = async (req, res) => {
  try {
    const rowsDeleted = await knex("warehouses")
      .where({ id: req.params.id })
      .delete();

    if (rowsDeleted === 0) {
      return res
        .status(404)
        .json({ message: `warehouse with ID ${req.params.id} not found` });
    }

    // No Content response
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: `Unable to delete warehouse: ${error}`,
    });
  }
};

const getInventories = async (req, res) => {
  try {
    //get warehouse by id
    const warehousesFound = await knex("warehouses").where({
      id: req.params.id,
    });
    //if warehouse doesn't exist, response 404
    if (warehousesFound.length === 0) {
      return res.status(404).json({
        message: `warehouse with ID ${req.params.id} not found`,
      });
    }
    //if warehouse exist, get inventory list of this warehouse
    const inventoryList = await knex("inventories").where({
      warehouse_id: warehousesFound[0].id,
    });
    //retrive the necessary info only
    const response = inventoryList.map((item) => {
      return {
        id: item.id,
        item_name: item.item_name,
        category: item.category,
        status: item.status,
        quantity: item.quantity,
      };
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: `Unable to retrieve warehouse data for warehouse with ID ${req.params.id}`,
    });
  }
};

module.exports = {
  index,
  warehouses,
  findOne,
  add,
  update,
  remove,
  getInventories,
};
