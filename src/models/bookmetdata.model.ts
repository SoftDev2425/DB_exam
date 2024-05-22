import mongoose, { Schema, Document } from "mongoose";

const bookMetadataSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    authors: { type: [String], required: true },
    publishedDate: { type: Date, required: true },
    genres: 
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
