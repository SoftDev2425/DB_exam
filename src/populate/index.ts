import BookMetadata from "../models/bookmetdata.model";
import books1 from "../../data/books1.json";
import books2 from "../../data/books2.json";
import books3 from "../../data/books3.json";
import books4 from "../../data/books4.json";
import books5 from "../../data/books5.json";
import books6 from "../../data/books6.json";
import books7 from "../../data/books7.json";
import books8 from "../../data/books8.json";
import books9 from "../../data/books9.json";
import books10 from "../../data/books10.json";
import sql from "mssql";
import { mssqlConfig } from "../utils/mssqlConnection";
import mongoose from "mongoose";

const scrapeAndInsertIntoDBs = async () => {
  console.log("Scraping and inserting into DBs...");
  try {
    const con = await sql.connect(mssqlConfig);
    await mongoose.connect("mongodb://localhost:27017/bookstore");

    const books = [
      ...books1,
      ...books2,
      ...books3,
      ...books4,
      ...books5,
      ...books6,
      ...books7,
      ...books8,
      ...books9,
      ...books10,
    ];

    const prices = [
      50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600,
    ];

    for (const book of books) {
      let generatedStockQuantity = Math.floor(Math.random() * 11);
      let generatedPrice = prices[Math.floor(Math.random() * prices.length)];

      await con.query`
        BEGIN
            INSERT INTO Books (isbn, title, StockQuantity, Price)
            VALUES (${book.isbn}, ${book.title}, ${generatedStockQuantity}, ${generatedPrice});
        END
      `;

      await BookMetadata.create({
        title: book.title,
        isbn: book.isbn,
        authors: [book.author],
        publishedDate: new Date(book.publishedDate),
        genres: [book.genre],
        format: book.format,
        pageCount: book.pageCount,
        publisher: book.publisher_name,
        weight: book.book_weight,
        shortDescription: book.shortDescription,
        longDescription: book.longDescription,
        thumbnailUrl: book.thumbnailUrl,
        ratings: {
          averageRating: book.Ratings.AverageRating,
          totalReviews: book.Ratings.TotalReviews,
        },
        language: book.language,
        price: generatedPrice,
      });
    }

    await con.close();
    await mongoose.disconnect();
    console.log("Scraping and inserting into DBs completed successfully!");
  } catch (error) {
    console.log(error);
  } finally {
  }
};

scrapeAndInsertIntoDBs();
