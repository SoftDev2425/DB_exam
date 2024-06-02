// src/components/BookCarousel.js
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface Book {
  _id: string;
  title: string;
  isbn: string;
  authors: string[];
  publishedDate: string;
  genres: string[];
  format: string;
  pageCount: number;
  publisher: string;
  weight?: number;
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

const BookCarousel = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:3000/books/recommendations", {
          withCredentials: true,
        });
        console.log(response.data.recommendedBooks);
        setBooks(response.data.recommendedBooks);
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Error fetching books");
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className="container mx-auto py-4">
      <h2 className="text-2xl font-semibold mb-4">Recommended Books</h2>
      {books ? (
        <div className="flex overflow-x-auto space-x-4">
          {books.map((book) => (
            <div
              key={book._id}
              className="flex-shrink-0 w-48 p-4 bg-white shadow-md rounded-lg m-2 hover:scale-105 duration-100 ease-in-out cursor-pointer"
              onClick={() => navigate(`/book/${book.isbn}`)}
            >
              <img className="w-full h-48 object-cover mb-2" src={book.thumbnailUrl} alt={book.title} />
              <h3 className="text-lg font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-600">by {book.authors.join(", ")}</p>
              <p className="text-sm text-gray-600">
                Rating: {book.ratings.averageRating} ({book.ratings.totalReviews} reviews)
              </p>
              <p className="text-sm text-gray-600">Price: ${book.price}</p>

              <div className="flex flex-col gap-2 justify-between mt-2">
                <Button className=" px-2 py-1 rounded-md" variant="secondary">
                  Add to cart
                </Button>
                <Button className=" px-2 py-1 rounded-md">Add to wishlist</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-700">No recommendations at the current time.</p>
      )}
    </div>
  );
};

export default BookCarousel;
