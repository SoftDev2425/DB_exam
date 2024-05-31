import { Request, Response, Router } from "express";
import { CustomRequest } from "../ICustomRequest";
import { redisClient } from "../../redis/client";
import BookMetadata from "../models/bookmetdata.model";
import { mssqlConfig } from "../utils/mssqlConnection";
import sql from "mssql";

const basketRoutes = Router();

// add to basket stored in redis
basketRoutes.post("/add", async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { isbn, quantity } = req.body;

    if (!isbn || quantity === undefined) {
      return res.status(400).json({ message: "ISBN and quantity are required" });
    }

    // Validate isbn and quantity
    const isbnRegex =
      /^(?:ISBN(?:-1[03])?:? )?(?=[-0-9X ]{13,17}$|[-0-9 ]{10,16}$)(?:97[89][- ]?)?(?:[0-9][- ]?){9}[0-9X]$/;
    if (!isbnRegex.test(isbn)) {
      return res.status(400).json({ message: "Invalid ISBN" });
    }

    if (typeof quantity !== "number") {
      return res.status(400).json({ message: "Quantity must be a number" });
    }

    // Fetch book metadata
    const bookData = await BookMetadata.findOne({
      isbn: isbn,
    });

    if (!bookData) {
      return res.status(404).json({ message: "Book not found" });
    }

    const con = await sql.connect(mssqlConfig);
    const latestBookData = await con.query`SELECT * FROM Books WHERE ISBN = ${isbn}`;
    const bookInfo = latestBookData.recordset[0];

    if (!bookInfo) {
      return res.status(404).json({ message: "Book not found" });
    }

    const latestPrice = bookInfo.Price;
    const latestQuantity = bookInfo.StockQuantity;

    if (latestQuantity === 0) {
      return res.status(410).json({ message: `Book with ${isbn} is out of stock.`, isbn });
    }

    if (quantity > latestQuantity) {
      return res.status(400).json({
        message: `Book does not have enough stock. Please reduce quantity.`,
        stockQuantity: latestQuantity,
        isbn,
      });
    }

    // Fetch or initialize user basket
    const userBasket = await redisClient.get(`basket-${userId}`);
    const basket = userBasket ? JSON.parse(userBasket) : { books: [] };

    // Update basket
    const bookIndex = basket.books.findIndex((book: any) => book.isbn === isbn);

    if (bookIndex !== -1) {
      if (quantity === 0) {
        basket.books.splice(bookIndex, 1);
      } else {
        basket.books[bookIndex].quantity = quantity;
      }
    } else {
      const book = {
        isbn,
        title: bookData.title,
        format: bookData.format,
        language: bookData.language,
        authors: bookData.authors,
        quantity,
        price: latestPrice,
        publisher: bookData.publisher,
        thumbnailUrl: bookData.thumbnailUrl,
      };
      basket.books.push(book);
    }

    // Update redis
    await redisClient.set(`basket-${userId}`, JSON.stringify(basket), {
      EX: 60 * 60 * 24 * 7,
    });
    await con.close();
    return res.status(201).json({ message: "Basket updated", basket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

basketRoutes.get("/get", async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.userId;

    const userBasket = await redisClient.get(`basket-${userId}`);
    const basket = userBasket ? JSON.parse(userBasket) : { books: [] };

    const con = await sql.connect(mssqlConfig);

    // Update the basket with the latest data from the database
    for (let book of basket.books) {
      const latestBookData = await con.query`SELECT Price, StockQuantity FROM Books WHERE ISBN = ${book.isbn}`;
      const bookInfo = latestBookData.recordset[0];

      if (bookInfo) {
        book.price = bookInfo.Price;
        book.latestStock = bookInfo.StockQuantity; // Add a field to track latest stock

        if (book.quantity > bookInfo.StockQuantity) {
          book.quantity = bookInfo.StockQuantity; // Adjust the quantity if it exceeds the latest stock
        }
      }
    }
    await redisClient.set(`basket-${userId}`, JSON.stringify(basket));
    await con.close();

    return res.status(200).json(basket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

export default basketRoutes;
