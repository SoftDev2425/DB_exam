import { Request, Response, Router } from "express";
import { CustomRequest } from "../ICustomRequest";
import { redisClient } from "../../redis/client";
import { mssqlConfig } from "../utils/mssqlConnection";
import sql from "mssql";

const orderRoutes = Router();

orderRoutes.post("/", async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;

    const { shippingAddress, shippingCity } = req.body;

    if (!shippingAddress || !shippingCity) {
      return res.status(400).json({ message: "Shipping address and city are required" });
    }

    // get basket from redis
    const basket = await redisClient.get(`basket-${userId}`);
    if (!basket) {
      return res.status(404).json({ message: "Basket not found" });
    }

    // Parse basket
    const basketItems = JSON.parse(basket);

    if (!Array.isArray(basketItems.books) || basketItems.books.length === 0) {
      return res.status(400).json({ message: "Basket is empty" });
    }

    const basketJSON = JSON.stringify(basketItems.books);

    const con = await sql.connect(mssqlConfig);

    console.log("BASKETJSON", basketJSON);

    const result = await con
      .request()
      .input("UserID", sql.UniqueIdentifier, userId)
      .input("ShippingAddress", sql.NVarChar(255), shippingAddress)
      .input("ShippingCity", sql.NVarChar(50), shippingCity)
      .input("Basket", sql.NVarChar(sql.MAX), basketJSON)
      .execute("CreateOrder");

    const orderId = result.recordset[0].OrderID;

    if (!orderId) {
      return res.status(500).json({ message: "Order creation failed" });
    }

    // clear basket
    await redisClient.del(`basket-${userId}`);

    return res.status(200).json({ message: "Order created successfully", orderId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

orderRoutes.get("/", async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ message: "Orders route" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default orderRoutes;
