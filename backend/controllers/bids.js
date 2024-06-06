import { StatusCodes } from "http-status-codes";
import pool from "../db/dbConfig.js";
import { BadRequestError, CustomAPIError } from "../errors/index.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

export const getAllBids = async (req, res) => {
  const { itemId } = req.params;

  const totalBids = await pool.query(
    `SELECT * FROM bids WHERE item_id = $1 ORDER BY created_at DESC`,
    [itemId]
  );

  if (totalBids.rowCount === 0)
    throw new CustomAPIError(
      `Currently, there are no bids regarding item having id: ${itemId}`,
      StatusCodes.NOT_FOUND
    );

  res.status(StatusCodes.OK).json({ bids: totalBids.rows });
};

export const createBid = async (req, res) => {
  const { itemId } = req.params;

  // take the user_id from jwt payload.
  const { userId, username, role } = req.user;
  const { bid_amount } = req.body;

  const isItemPresent = await pool.query(
    `SELECT * FROM auction_items WHERE id = $1`,
    [itemId]
  );

  if (isItemPresent.rowCount === 0)
    throw new BadRequestError(`No item exist with id: ${itemId}`);

  // checking bid amount...
  const last_bid = isItemPresent.rows[0].current_price;
  // console.log(last_bid);
  if (last_bid >= bid_amount) {
    // 409 - req. not proccessed due to conflict
    throw new CustomAPIError(
      `Your bidding amount should be greater than ${last_bid}`,
      409
    );
  }

  const ownerId = isItemPresent.rows[0].owner_id;
  // update the notification's to the owner of the item.
  if (ownerId && ownerId !== userId) {
    const ownerMsg = `Your item ${isItemPresent.rows[0].name} has received a new bid of ${bid_amount}`;

    await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
      [ownerId, ownerMsg]
    );

    //**** */ web socket
    const receiverSocketId = getReceiverSocketId(ownerId);
    io.to(receiverSocketId).emit("notification", ownerMsg);
  }

  //notify to the last highest bidder..
  const highestBidResult = await pool.query(
    `SELECT * FROM bids WHERE item_id = $1 ORDER BY created_at DESC`,
    [itemId]
  );
  const highestBid = highestBidResult.rows[0];

  // console.log(highestBid);
  if (highestBid && highestBid.user_id !== userId) {
    const outbitMsg = `You have been outbid on item ${isItemPresent.rows[0].name}. The new highest bid is ${bid_amount}`;

    await pool.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
      [highestBid.user_id, outbitMsg]
    );
    // **** web socket.. implement...
    const receiverSocketId = getReceiverSocketId(highestBid.user_id);
    io.to(receiverSocketId).emit("notification", outbitMsg);
  }

  await pool.query(
    `INSERT INTO bids (item_id, user_id, bid_amount)
  VALUES ($1, $2, $3 )`,
    [itemId, userId, bid_amount]
  );

  // update the new bid to the item's current price..
  await pool.query(
    `
    UPDATE auction_itemS SET current_price = $1 WHERE id = $2
  `,
    [bid_amount, itemId]
  );

  res
    .status(StatusCodes.CREATED)
    .json({ bid_creator: username, msg: "bid created successfully" });
};
