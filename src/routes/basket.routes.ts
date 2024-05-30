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

    // check if book is already in basket
    const userBasket = await redisClient.get(`basket-${userId}`);

    if (userBasket) {
      const basket = JSON.parse(userBasket);

      if (basket.books.includes(isbn)) {
        return res.status(400).json({ message: "Book is already in basket" });
      }

      //   basket.push(isbn);
      //   await redisClient.set(`basket-${userId}`, JSON.stringify(basket));

      return res.status(201).json({ message: "Book added to basket" });
    } else {
      const bookData = await BookMetadata.findOne({
        isbn: isbn,
      });

      const con = await sql.connect(mssqlConfig);

      const latestBookData = await con.query`
        SELECT * FROM BookMetadata WHERE ISBN = ${isbn}
      `;

      const latestPrice = latestBookData.recordset[0].Price;
      const latestQuantity = latestBookData.recordset[0].Quantity;

      if (!bookData) {
        return res.status(404).json({ message: "Book not found" });
      }

      if (latestQuantity === 0) {
        return res.status(400).json({ message: `Book with ${isbn} is out of stock. Please remove from basket.`, isbn });
      }

      if (quantity > latestQuantity) {
        return res
          .status(400)
          .json({ message: `Book does not have enough stock. Please reduce quantity.`, latestQuantity, isbn });
      }

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

      const basket = {
        books: [book],
      };

      await redisClient.set(`basket-${userId}`, JSON.stringify(basket));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

export default basketRoutes;
