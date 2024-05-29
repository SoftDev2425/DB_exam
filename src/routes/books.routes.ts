import { Router, Request, Response } from "express";
import sql from "mssql";
import { mssqlConfig } from "../utils/mssqlConnection";
import BookMetadata from "../models/bookmetdata.model";
import { redisClient } from "../../redis/client";

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

    // get book by isbn
    const book = await BookMetadata.findOne({ isbn: isbn });

    if (!book) {
      return res.status(404).json({ message: "Book not found!" });
    }

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

export default booksRouter;
