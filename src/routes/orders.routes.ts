import { Request, Response, Router } from "express";
import { CustomRequest } from "../ICustomRequest";
import { redisClient } from "../../redis/client";
import { mssqlConfig } from "../utils/mssqlConnection";
import sql from "mssql";
import BookMetadata from "../models/bookmetdata.model";

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

    // update bookmetadata in mongodb
    const bookIds = basketItems.books.map((book: any) => book.isbn);
    const books = await BookMetadata.find({
      isbn: { $in: bookIds },
    });

    for (const book of books) {
      const bookInBasket = basketItems.books.find((b: any) => b.isbn === book.isbn);
      if (bookInBasket) {
        const data = await con.query`SELECT * FROM Books WHERE ISBN = ${book.isbn}`;
        const bookInfo = data.recordsets[0][0];
        const latestQuantity = bookInfo.StockQuantity;
        await BookMetadata.updateOne({ isbn: book.isbn }, { stockQuantity: latestQuantity });
      }
    }

    // clear basket
    await redisClient.del(`basket-${userId}`);

    return res.status(200).json({ message: "Order created successfully", orderId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

// get order by id
orderRoutes.get("/:orderId", async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;

    const con = await sql.connect(mssqlConfig);

    const result = await con.request().input("OrderID", sql.UniqueIdentifier, orderId).execute("GetOrderById");

    const order = result.recordset;

    if (order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderDetails = {
      orderId: order[0].OrderID,
      userId: order[0].UserID,
      orderDate: order[0].OrderDate,
      shippingAddress: order[0].ShippingAddress,
      shippingCity: order[0].ShippingCity,
      status: order[0].Status,
      orderCreatedAt: order[0].OrderCreatedAt,
      orderUpdatedAt: order[0].OrderUpdatedAt,
      orderLines: order.map((item) => ({
        orderLineId: item.OrderLineID,
        isbn: item.ISBN,
        quantity: item.Quantity,
        unitPrice: item.UnitPrice,
        bookTitle: item.BookTitle,
        bookPrice: item.BookPrice,
      })),
    };

    return res.status(200).json({ order: orderDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

// get all user orders
orderRoutes.get("/", async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;

    const con = await sql.connect(mssqlConfig);

    const result = await con.request().input("UserID", sql.UniqueIdentifier, userId).execute("GetUserOrders");

    const orders = result.recordset;

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Group the orders and their order lines
    const userOrders = orders.reduce((acc, item) => {
      let order = acc.find((o) => o.orderId === item.OrderID);
      if (!order) {
        order = {
          orderId: item.OrderID,
          userId: item.UserID,
          orderDate: item.OrderDate,
          shippingAddress: item.ShippingAddress,
          shippingCity: item.ShippingCity,
          status: item.Status,
          orderCreatedAt: item.OrderCreatedAt,
          orderUpdatedAt: item.OrderUpdatedAt,
          orderLines: [],
        };
        acc.push(order);
      }

      if (item.OrderLineID) {
        order.orderLines.push({
          orderLineId: item.OrderLineID,
          isbn: item.ISBN,
          quantity: item.Quantity,
          unitPrice: item.UnitPrice,
          bookTitle: item.BookTitle,
          bookPrice: item.BookPrice,
        });
      }

      return acc;
    }, []);

    return res.status(200).json({ orders: userOrders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

export default orderRoutes;
