import mongoose, { Schema, Document } from "mongoose";

export interface BookMetadataDocument extends Document {
  title: string;
  isbn: string;
  authors: string[];
  publishedDate: Date;
  genres: string[];
  format: string;
  pageCount: number;
  publisher: string;
  weight: number;
  shortDescription: string;
  longDescription: string;
  thumbnailUrl: string;
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
  language: string;
  price: number;
  stockQuantity: number;
}

const bookMetadataSchema: Schema = new Schema<BookMetadataDocument>(
  {
    title: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    authors: { type: [String], required: true },
    publishedDate: { type: Date, required: true },
    genres: { type: [String], required: true },
    format: { type: String, required: true },
    pageCount: { type: Number, required: true },
    publisher: { type: String, required: true },
    weight: { type: Number, default: 0 },
    shortDescription: { type: String, required: true },
    longDescription: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    ratings: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
    language: { type: String, required: true },
    price: { type: Number, required: true },
    stockQuantity: { type: Number, required: true },
  },
  { timestamps: true }
);

bookMetadataSchema.index({ title: 1, isbn: 1 }, { unique: true });

bookMetadataSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const BookMetadata = mongoose.model("BookMetadata", bookMetadataSchema);

export default BookMetadata;
