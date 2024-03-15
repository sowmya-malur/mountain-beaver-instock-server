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

/**
 *
 * @param {*} req The req object containing all the fields of the warehouse data
 * @param {*} res The res object
 * @returns JSON response containing all the fields of warehouse data and newly generated id
 *          except the created and updated timestamp
 */
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
      message: "Please provide all required fields for the warehouse.",
    });
  }

  // Check phone format
  if (!/^\+\d{1}\s\(\d{3}\)\s\d{3}-\d{4}$/.test(req.body.contact_phone)) {
    return res.status(400).json({
      message: "Invalid phone format. Ex: +1 (xxx) xxx-xxxx",
    });
  }

  // Check email format
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(req.body.contact_email)) {
    return res.status(400).json({
      message: "Invalid email format.Ex: example@example.com",
    });
  }

  // Prepare the data for insertion by excluding the 'id' field, if present
  const { id, ...insertData } = req.body;

  try {
    // Insert the warehouse data into the database
    const result = await knex("warehouses").insert(insertData);

    // Retrieve the ID of the newly inserted warehouse record
    const newWarehouseId = result[0];

    // Fetch the newly created warehouse record from the database
    const [createdWarehouse] = await knex("warehouses").where({
      id: newWarehouseId,
    });

    // Remove created_at and updated_at fields from the response
    const responseWithoutDates = Object.fromEntries(
      Object.entries(createdWarehouse).filter(
        ([key, value]) => key !== "created_at" && key !== "updated_at"
      )
    );

    // Respond with the newly created warehouse record
    res.status(201).json(responseWithoutDates);
  } catch (error) {
    // Handle any errors that occur during the database operations
    res.status(500).json({
      message: `Unable to create new warehouse: ${error.message}`,
    });
  }
};

/**
 * Update the warehouse data for a given id.
 * @param {*} req The req object containing all the fields of the warehouse data
 * @param {*} res The res object
 * @returns JSON response containing all the fields of warehouse data and the id
 *          except for the created and updated timestamp
 */
const update = async (req, res) => {
  try {
    // Check for the required fields in the request body
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
        message: "Please provide all required fields for the warehouse.",
      });
    }

    // Check phone format
    if (!/^\+\d{1}\s\(\d{3}\)\s\d{3}-\d{4}$/.test(req.body.contact_phone)) {
      return res.status(400).json({
        message: "Invalid phone format. Ex: +1 (xxx) xxx-xxxx",
      });
    }

    // Check email format
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(req.body.contact_email)) {
      return res.status(400).json({
        message: "Invalid email format.Ex: example@example.com",
      });
    }

    const rowsUpdated = await knex("warehouses")
      .where({ id: req.params.id })
      .update(req.body);

    // Check if the row was updated
    if (rowsUpdated === 0) {
      return res.status(404).json({
        message: `warehouse with ID ${req.params.id} not found`,
      });
    }

    // Fetch updated warehouse record from the database
    const [updatedWarehouse] = await knex("warehouses").where({
      id: req.params.id,
    });

    // Remove created_at and updated_at fields from the response
    const responseWithoutDates = Object.fromEntries(
      Object.entries(updatedWarehouse).filter(
        ([key, value]) => key !== "created_at" && key !== "updated_at"
      )
    );

    // Respond with updated warehouse record
    res.status(200).json(responseWithoutDates);
    
  } catch (error) {
    // Handle any errors that occur during the database operations
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
    const list = inventoryList.map((item) => {
      return {
        id: item.id,
        item_name: item.item_name,
        category: item.category,
        status: item.status,
        quantity: item.quantity,
      };
    });
    const response = sortList(list, req.query.sort_by, req.query.order_by);
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
