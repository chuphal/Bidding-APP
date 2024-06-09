import { StatusCodes } from "http-status-codes";
import pool from "../db/dbConfig.js";
import { BadRequestError } from "../errors/bad-request.js";
import { CustomAPIError } from "../errors/custom-api.js";
import fs from "fs";
import { logger } from "../logger/logger.js";
import { NotFoundError } from "../errors/not-found.js";
export const getAllItems = async (req, res) => {
  const { search, status, page = 1, limit = 5 } = req.query;

  const offSet = (page - 1) * limit;

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
  const countResult = await pool.query(query, params);

  query += " ORDER BY created_at DESC";

  query += " LIMIT $" + (params.length + 1);
  params.push(limit);

  query += " OFFSET $" + (params.length + 1);
  params.push(offSet);

  try {
    const allItems = await pool.query(query, params);
    const totalItems = countResult.rowCount;
    const totalPages = Math.ceil(totalItems / limit);

    logger.info("successfully get all items");
    res.status(StatusCodes.OK).json({
      totalCount: totalItems,
      Items: allItems.rows,
      totalPages: totalPages,
      currentPage: parseInt(page, 10),
    });
  } catch (error) {
    logger.error("Server Error", error);
    throw new CustomAPIError("Server Error", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const getSingleItem = async (req, res) => {
  const { id } = req.params;

  const item = await pool.query(`SELECT * FROM auction_items WHERE id = $1`, [
    id,
  ]);

  if (item.rowCount === 0) {
    logger.error(`No item with id ${id}`);
    throw new BadRequestError(`No item with id ${id}`);
  }
  logger.info("Successfuly get the item");
  res.status(StatusCodes.OK).json({ item: item.rows[0] });
};

export const createItem = async (req, res) => {
  const { userId, username, role } = req.user;
  const { name, description, starting_price, current_price, end_time } =
    req.body;

  const image_url = req.file ? req.file.path : "";

  if (!name) {
    logger.error("Name of the item, can't be left empty");
    throw new BadRequestError("Name of the item, can't be left empty");
  }
  if (!description) {
    logger.error("Provide the descriptionn to the item");
    throw new BadRequestError("Provide the descriptionn to the item");
  }
  if (!starting_price) {
    logger.error("Mention the starting price to the item");
    throw new BadRequestError("Mention the starting price to the item");
  }
  if (!end_time) {
    logger.error("Provide the end time of the item");
    throw new BadRequestError("Provide the end time of the item");
  }

  const newCurrent_price = !current_price ? starting_price : current_price;

  // image upload.
  const item = await pool.query(
    `INSERT INTO auction_items (name, description, starting_price, current_price,image_url, end_time, owner_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
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
  const itemId = item.rows[0].id;
  logger.info("item created successfully");
  res
    .status(StatusCodes.CREATED)
    .json({ itemId, msg: "item created successfully", name, username });
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const { userId, username, role } = req.user;

  // owner of the item
  // id exist or not
  const item = await pool.query(`SELECT * FROM auction_items WHERE id = $1`, [
    id,
  ]);

  if (item.rowCount === 0) {
    logger.error(`No items with id ${id}`);
    throw new BadRequestError(`No items with id ${id}`);
  }

  const owner = item.rows[0].owner_id;

  if (role != "admin" && userId != item.rows[0].owner_id) {
    logger.error(
      `Authorization-Invalid. To update item with id: ${id}, you should be admin or owner`
    );
    throw new CustomAPIError(
      `Authorization-Invalid. To update item with id: ${id}, you should be admin or owner`,
      StatusCodes.FORBIDDEN
    );
  }

  const { name, description, starting_price, current_price, end_time } =
    req.body;

  const image_url = req.file ? req.file.path : "";
  if (!name) {
    logger.error("Name of the item, can't be left empty");
    throw new BadRequestError("Name of the item, can't be left empty");
  }
  if (!description) {
    logger.error("Provide the descriptionn to the item");
    throw new BadRequestError("Provide the descriptionn to the item");
  }
  if (!starting_price) {
    logger.error("Mention the starting price to the item");
    throw new BadRequestError("Mention the starting price to the item");
  }
  if (!end_time) {
    logger.error("Provide the end time of the item");
    throw new BadRequestError("Provide the end time of the item");
  }

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

  logger.info("item updated successfully");
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

  if (item.rowCount == 0) {
    logger.error(`No item with id: ${id}`);
    throw new NotFoundError(`No item with id: ${id}`);
  }

  const { userId, username, role } = req.user;

  if (role != "admin" && userId != item.rows[0].owner_id) {
    logger.error(
      `Authorization-Invalid. To delete item with id: ${id}, you should be admin or owner`
    );
    throw new CustomAPIError(
      `Authorization-Invalid. To delete item with id: ${id}, you should be admin or owner`,
      StatusCodes.FORBIDDEN
    );
  }

  // deleting all the bids releated to item...
  await pool.query(`DELETE FROM bids WHERE item_id = $1`, [id]);

  const isDelete = await pool.query(`DELETE FROM auction_items WHERE id = $1`, [
    id,
  ]);

  if (isDelete.rowCount) {
    const imagePath = item.rows[0].image_url;

    if (os.path.isfile(imagePath)) {
      fs.unlinkSync(imagePath);
      logger.info("image deleted");
      console.log("image deleted");
    } else {
      logger.info("image not deleted");
      console.log("image not deleted");
    }
  }

  logger.info("successfully deleted an item");
  res
    .status(StatusCodes.OK)
    .json({ msg: "successfully deleted an item", deleted_by: username });
};
