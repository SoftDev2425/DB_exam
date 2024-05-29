import mongoose, { Schema, Document } from "mongoose";

export interface UserPreferencesDocument extends Document {
  UserId: string;
  PreferedGenres: string[];
  PreferedAuthors: string[];
  PreferedFormats: string[];
  PreferedLanguages: string[];
  WishList: string[];
}

const userPreferencesSchema: Schema = new Schema<UserPreferencesDocument>(
  {
    UserId: { type: String, required: true },
    PreferedGenres: { type: [String], required: true },
    PreferedAuthors: { type: [String], required: true },
    PreferedFormats: { type: [String], required: true },
    PreferedLanguages: { type: [String], required: true },
    WishList: { type: [String], required: true },
  },
  { timestamps: true }
);

userPreferencesSchema.set("toJSON", {
  transform: (_document: Document, returnedObject: Record<string, any>) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const UserPreferences = mongoose.model("UserPreferences", userPreferencesSchema);

export default UserPreferences;
