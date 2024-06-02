import { Router, Request, Response } from "express";
import sql from "mssql";
import { mssqlConfig } from "../utils/mssqlConnection";
import BookMetadata from "../models/bookmetdata.model";
import { redisClient } from "../../redis/client";
import { CustomRequest } from "../ICustomRequest";
import UserPreferences from "../models/userpreferences.model";
import { pipeline } from "zod";

const booksRouter = Router();

// Search for book (with pagination) query={searchTerm}&page={page}&limit={limit}
booksRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 32;

    // check if searchTerm is provided
    if (!searchTerm) return res.status(400).json({ message: "Search term is required!" });

    // check if searchTerm is in cache
    const cachedResult = await redisClient.get(`search-${searchTerm}-page-${page}-limit-${limit}`);

    if (cachedResult) {
      const { total, data } = JSON.parse(cachedResult);

      return res.status(200).json({
        searchTerm,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit,
        books: data,
      });
    }

    // search for books
    // const books = await BookMetadata.find({
    //   $or: [
    //     { title: { $regex: searchTerm, $options: "i" } },
    //     { authors: { $regex: searchTerm, $options: "i" } },
    //     { genres: { $regex: searchTerm, $options: "i" } },
    //     { publisher: { $regex: searchTerm, $options: "i" } },
    //   ],
    // })
    //   .limit(limit)
    //   .skip(limit * (page - 1));

    // Aggregation pipeline
    const pipeline = [
      {
        $match: {
          $or: [
            { title: { $regex: searchTerm, $options: "i" } },
            { authors: { $regex: searchTerm, $options: "i" } },
            { genres: { $regex: searchTerm, $options: "i" } },
            { publisher: { $regex: searchTerm, $options: "i" } },
          ],
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }, { $addFields: { page, limit } }],
          data: [{ $skip: limit * (page - 1) }, { $limit: limit }],
        },
      },
      {
        $project: {
          total: { $arrayElemAt: ["$metadata.total", 0] },
          page: 1,
          limit: 1,
          books: "$data",
        },
      },
    ];

    // search for books
    const result = await BookMetadata.aggregate(pipeline);

    const { total, books: data } = result[0];

    if (data.length === 0) return res.status(404).json({ message: "No books found!" });

    // cache result in redis
    await redisClient.set(
      `search-${searchTerm}-page-${page}-limit-${limit}
    `,
      JSON.stringify({ total, data }),
      {
        EX: 60,
      }
    );

    res.status(200).json({
      searchTerm,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      books: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// get book by isbn route
booksRouter.get("/isbn/:isbn", async (req: Request, res: Response) => {
  try {
    const isbn = req.params.isbn;

    // check if isbn is in cache
    const cachedBook = await redisClient.get(`book-isbn-${isbn}`);

    if (cachedBook) {
      return res.status(200).json(JSON.parse(cachedBook));
    }

    // get book by isbn
    const book = await BookMetadata.findOne({ isbn: isbn });

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

    // cache book in redis
    await redisClient.set(`book-isbn-${isbn}`, JSON.stringify(book), {
      EX: 60,
    });

    res.status(200).json(book);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// get unique genres route
booksRouter.get("/genres", async (req: Request, res: Response) => {
  try {
    // get unique genres
    // const genres = await BookMetadata.distinct("genres");
    const genres = await BookMetadata.aggregate([
      {
        $unwind: "$genres", // Unwind the genres array
      },
      {
        $group: {
          _id: null, // Group all documents into a single group
          genres: { $addToSet: "$genres" }, // Add genres to a set to ensure uniqueness
        },
      },
      {
        $project: {
          _id: 0, // Exclude the default _id field
          genres: 1, // Include the genres field
        },
      },
    ]);

    // Extract genres array from the result
    const genreArray = genres.length > 0 ? genres[0].genres : [];

    res.status(200).json(genreArray);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// get unique languages route
booksRouter.get("/languages", async (req: Request, res: Response) => {
  try {
    // get unique languages
    const languages = await BookMetadata.distinct("language");

    res.status(200).json(languages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// get unique formats route
booksRouter.get("/formats", async (req: Request, res: Response) => {
  try {
    // get unique formats
    const formats = await BookMetadata.distinct("format");

    res.status(200).json(formats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// get unique authors route
booksRouter.get("/authors", async (req: Request, res: Response) => {
  try {
    // get unique authors
    const authors = await BookMetadata.distinct("authors");

    res.status(200).json(authors);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// create book review
booksRouter.post("/isbn/:isbn/reviews", async (req: CustomRequest, res: Response) => {
  try {
    const isbn = req.params.isbn;
    const userId = req.userId;
    const { rating, comment } = req.body;

    // validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5!" });
    }

    // create book review
    const con = await sql.connect(mssqlConfig);

    const result = await con.query`
      BEGIN
      IF EXISTS (SELECT * FROM Books WHERE isbn = ${isbn})
      BEGIN
        IF NOT EXISTS (SELECT * FROM reviews WHERE userId = ${userId} AND isbn = ${isbn})
        BEGIN
          INSERT INTO reviews (userId, isbn, rating, comment)
          VALUES (${userId}, ${isbn}, ${rating}, ${comment})
        END
        ELSE 
        BEGIN
          THROW 51000, 'You have already reviewed this book!', 1
        END
      END
      ELSE
      BEGIN
        THROW 51000, 'Book not found!', 1
      END
    END
    `;

    const book: any = await BookMetadata.findOne({ isbn });

    const totalReviews = book.ratings.totalReviews;
    const averageRating = book.ratings.averageRating;

    const newAverageRating = (averageRating * totalReviews + rating) / (totalReviews + 1);

    const updatedBook = await BookMetadata.findOneAndUpdate(
      { isbn },
      {
        $set: {
          ratings: {
            totalReviews: totalReviews + 1,
            averageRating: newAverageRating.toFixed(2),
          },
        },
      },
      {
        new: true,
      }
    );

    await con.close();
    res.status(201).json(updatedBook);
  } catch (error) {
    if (error.number === 51000) {
      return res.status(400).json({ message: error.message });
    }

    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// get book reviews
booksRouter.get("/:isbn/reviews", async (req: Request, res: Response) => {
  try {
    const isbn = req.params.isbn;

    // check if isbn is in cache
    const cachedReviews = await redisClient.get(`book-reviews-isbn-${isbn}`);

    if (cachedReviews) {
      return res.status(200).json(JSON.parse(cachedReviews));
    }

    // get book reviews
    const con = await sql.connect(mssqlConfig);

    const result = await con.query`
      SELECT reviews.ReviewID, FirstName, LastName, Rating, Comment, reviews.CreatedAt
      FROM reviews
      JOIN users ON reviews.UserID = users.UserID
      WHERE isbn = ${isbn}
    `;

    const reviews = result.recordset;

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found!" });
    }

    // cache reviews in redis
    await redisClient.set(`book-reviews-isbn-${isbn}`, JSON.stringify(reviews), {
      EX: 60,
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// add book to wishlist
booksRouter.post("/:isbn/wishlist", async (req: CustomRequest, res: Response) => {
  try {
    const isbn = req.params.isbn;
    const userId = req.userId;

    const isbnExists = await BookMetadata.exists({ isbn });

    if (!isbnExists) {
      return res.status(404).json({ message: "Book not found!" });
    }

    const userPreferences = await UserPreferences.findOneAndUpdate(
      { UserId: userId },
      { $addToSet: { WishList: isbn } },
      { upsert: true, new: true }
    );

    if (!userPreferences) {
      return res.status(404).json({ message: "User preferences not found!" });
    }

    res.status(201).json(userPreferences);
  } catch (error) {
    if (error.number === 52000) {
      return res.status(400).json({ message: error.message });
    }

    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// remove book from wishlist
booksRouter.delete("/:isbn/wishlist", async (req: CustomRequest, res: Response) => {
  try {
    const isbn = req.params.isbn;
    const userId = req.userId;

    const isbnExists = await BookMetadata.exists({ isbn });

    if (!isbnExists) {
      return res.status(404).json({ message: "Book not found!" });
    }

    const userPreferences = await UserPreferences.findOneAndUpdate(
      { UserId: userId },
      { $pull: { WishList: isbn } },
      { new: true }
    );

    if (!userPreferences) {
      return res.status(404).json({ message: "User preferences not found!" });
    }

    res.status(200).json(userPreferences);
  } catch (error) {
    if (error.number === 52000) {
      return res.status(400).json({ message: error.message });
    }

    console.log(error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// top 10 rated books
booksRouter.get("/top-rated", async (req: Request, res: Response) => {
  try {
    const cachedTopRated = await redisClient.get("top-rated-books");

    if (cachedTopRated) {
      return res.status(200).json(JSON.parse(cachedTopRated));
    }

    const result = await BookMetadata.aggregate([
      {
        $sort: { "ratings.averageRating": -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          isbn: 1,
          authors: 1,
          publishedDate: 1,
          genres: 1,
          format: 1,
          pageCount: 1,
          publisher: 1,
          weight: 1,
          shortDescription: 1,
          longDescription: 1,
          thumbnailUrl: 1,
          "ratings.averageRating": 1,
          "ratings.totalReviews": 1,
          language: 1,
          price: 1,
          stockQuantity: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    await redisClient.set("top-rated-books", JSON.stringify(result), {
      EX: 60,
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching top-rated books:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Update book price by ISBN
booksRouter.put("/isbn/:isbn/price", async (req: Request, res: Response) => {
  try {
    const { isbn } = req.params;
    const { newPrice } = req.body;

    // Validate new price
    if (newPrice <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    // Update price in MongoDB
    const mongoUpdateResult = await BookMetadata.findOneAndUpdate(
      { isbn },
      { $set: { price: newPrice } },
      { new: true }
    );

    if (!mongoUpdateResult) {
      return res.status(404).json({ message: "Book not found in MongoDB" });
    }

    // Update price in MSSQL
    const mssqlPool = await sql.connect(mssqlConfig);
    const mssqlUpdateResult = await mssqlPool
      .request()
      .input("ISBN", sql.VarChar, isbn)
      .input("Price", sql.Decimal(10, 2), newPrice).query(`
        UPDATE Books
        SET Price = @Price
        WHERE ISBN = @ISBN
      `);

    if (mssqlUpdateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Book not found in MSSQL" });
    }

    // Clear cache for the updated book in Redis
    await redisClient.del(`book-isbn-${isbn}`);

    res.status(200).json({ message: "Book price updated successfully" });
  } catch (error) {
    console.error("Error updating book price:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

// Update book stock by ISBN
booksRouter.put("/isbn/:isbn/stock", async (req: Request, res: Response) => {
  try {
    const { isbn } = req.params;
    const { newStock } = req.body;

    // Validate new stock
    if (newStock < 0) {
      return res.status(400).json({ message: "Stock must be greater than or equal to 0" });
    }

    // Update stock in MongoDB
    const mongoUpdateResult = await BookMetadata.findOneAndUpdate(
      { isbn },
      { $set: { stockQuantity: newStock } },
      { new: true }
    );

    if (!mongoUpdateResult) {
      return res.status(404).json({ message: "Book not found in MongoDB" });
    }

    // Update stock in MSSQL
    const mssqlPool = await sql.connect(mssqlConfig);
    const mssqlUpdateResult = await mssqlPool
      .request()
      .input("ISBN", sql.VarChar, isbn)
      .input("Stock", sql.Int, newStock).query(`
        UPDATE Books
        SET StockQuantity = @Stock
        WHERE ISBN = @ISBN
      `);

    if (mssqlUpdateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Book not found in MSSQL" });
    }

    // Clear cache for the updated book in Redis
    await redisClient.del(`book-isbn-${isbn}`);

    res.status(200).json({ message: "Book stock updated successfully" });
  } catch (error) {
    console.error("Error updating book stock:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

booksRouter.get("/recommendations", async (req: CustomRequest, res: Response) => {
  try {
    res.status(200).json({ message: "Recommendations" });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

export default booksRouter;
