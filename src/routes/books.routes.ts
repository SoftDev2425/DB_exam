import { Router, Request, Response } from "express";
import sql from "mssql";
import { mssqlConfig } from "../utils/mssqlConnection";
import BookMetadata from "../models/bookmetdata.model";

const booksRouter = Router();

// Search for book (with pagination) query={searchTerm}&page={page}&limit={limit}
booksRouter.get("/search", async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

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

    res.status(200).json({
      total,
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
booksRouter.get("/:isbn", async (req: Request, res: Response) => {
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

export default booksRouter;
