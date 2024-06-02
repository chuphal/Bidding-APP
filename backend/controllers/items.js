import { StatusCodes } from "http-status-codes";
import pool from "../db/dbConfig.js";
import { BadRequestError } from "../errors/bad-request.js";
import { CustomAPIError } from "../errors/custom-api.js";

export const getAllItems = async (req, res) => {
  const { search, status } = req.query;

  let query = "SELECT * FROM auction_items WHERE 1=1";
  let params = [];
  if (search) {
    query += " AND name ILIKE $" + (params.length + 1);
    params.push(`%${search}%`);
  }

  if (status) {
    query += " AND status = $" + (params.length + 1);
    params.push(status);
  }

  query += " ORDER BY created_at DESC";

  try {
    const allItems = await pool.query(query, params);
    res
      .status(StatusCodes.OK)
      .json({ totalItems: allItems.rowCount, items: allItems.rows });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const getSingleItem = async (req, res) => {
  const { id } = req.params;

  const item = await pool.query(`SELECT * FROM auction_items WHERE id = $1`, [
    id,
  ]);

  if (item.rowCount === 0) throw new BadRequestError(`No item with id ${id}`);

  res.status(StatusCodes.OK).json({ item: item.rows });
};

export const createItem = async (req, res) => {
  const { userId, username, role } = req.user;
  const {
    name,
    description,
    starting_price,
    current_price,
    image_url,
    end_time,
  } = req.body;

  if (!name) throw new BadRequestError("Name of the item, can't be left empty");

  if (!description)
    throw new BadRequestError("Provide the descriptionn to the item");

  if (!starting_price)
    throw new BadRequestError("Mention the starting price to the item");

  if (!end_time) throw new BadRequestError("Provide the end time of the item");

  const newCurrent_price = !current_price ? starting_price : current_price;

  // image upload.
  await pool.query(
    `INSERT INTO auction_items (name, description, starting_price, current_price,image_url, end_time, owner_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      name,
      description,
      starting_price,
      newCurrent_price,
      image_url,
      end_time,
      userId,
    ]
  );

  res
    .status(StatusCodes.CREATED)
    .json({ msg: "item created successfully", name, username });
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { userId, username, role } = req.user;

  // owner of the item
  // id exist or not
  const item = await pool.query(`SELECT * FROM auction_items WHERE id = $1`, [
    id,
  ]);

  if (item.rowCount === 0) throw new BadRequestError(`No items with id ${id}`);

  const owner = item.rows[0].owner_id;

  if (role != "admin" && userId != item.rows[0].owner_id) {
    throw new CustomAPIError(
      `Authorization-Invalid. To delete item with id: ${id}, you should be admin or owner`,
      StatusCodes.FORBIDDEN
    );
  }

  const {
    name,
    description,
    starting_price,
    current_price,
    image_url,
    end_time,
  } = req.body;

  if (!name) throw new BadRequestError("Name of the item, can't be left empty");

  if (!description)
    throw new BadRequestError("Provide the descriptionn to the item");

  if (!starting_price)
    throw new BadRequestError("Mention the starting price to the item");

  if (!end_time) throw new BadRequestError("Provide the end time of the item");

  const newCurrent_price = !current_price ? starting_price : current_price;

  // admin or owner of the item
  await pool.query(
    `UPDATE auction_items SET name=$1, description=$2, starting_price=$3, current_price=$4,image_url=$5, end_time=$6, owner_id = $7 WHERE id = $8`,
    [
      name,
      description,
      starting_price,
      newCurrent_price,
      image_url,
      end_time,
      owner,
      id,
    ]
  );

  res.status(StatusCodes.CREATED).json({
    msg: "item updated successfully",
    newItem: name,
    Changer_name: username,
  });
};

export const deleteItem = async (req, res) => {
  const { id } = req.params;
  // owner of the item
  const item = await pool.query(`SELECT * FROM auction_items WHERE id = $1`, [
    id,
  ]);

  if (item.rowCount === 0) throw new BadRequestError(`No items with id ${id}`);

  const { userId, username, role } = req.user;

  if (role != "admin" && userId != item.rows[0].owner_id) {
    throw new CustomAPIError(
      `Authorization-Invalid. To delete item with id: ${id}, you should be admin or owner`,
      StatusCodes.FORBIDDEN
    );
  }

  await pool.query(`DELETE FROM auction_items WHERE id = $1`, [id]);

  res
    .status(StatusCodes.OK)
    .json({ msg: "successfully deleted an item", deleted_by: username });
};
