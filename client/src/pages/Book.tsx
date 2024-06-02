import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";

interface Review {
  ReviewID: string;
  FirstName: string;
  LastName: string;
  Rating: number;
  Comment: string;
  CreatedAt: string;
}

interface Book {
  ratings: {
    totalReviews: number;
    averageRating: number;
  };
  title: string;
  isbn: string;
  authors: string[];
  publishedDate: string;
  genres: string[];
  format: string;
  pageCount: number;
  publisher: string;
  weight: number;
  shortDescription: string;
  longDescription: string;
  thumbnailUrl: string;
  language: string;
  price: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

const Book = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get<Book>(`http://localhost:3000/books/isbn/${id}`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setBook(response.data);
        } else {
          setError("Failed to fetch book details.");
        }
      } catch (error) {
        setError("An error occurred while fetching book details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get<Review[]>(`http://localhost:3000/books/${id}/reviews`, {
          withCredentials: true,
        });

        if (response.status === 200) {
          setReviews(response.data);
        } else {
          setError("Failed to fetch reviews.");
        }
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          setReviews([]);
          return;
        }
        setError("An error occurred while fetching reviews.");
      }
    };

    if (showReviews) {
      fetchReviews();
    }
  }, [id, showReviews]);

  const handleReviewSubmit = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/books/isbn/${id}/reviews`, newReview, {
        withCredentials: true,
      });

      if (response.status === 201) {
        setReviews((prev) => [...prev, response.data]);
        setNewReview({ rating: 0, comment: "" });
      } else {
        setError("Failed to add review.");
      }
    } catch (error) {
      setError("An error occurred while adding the review.");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-700">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-6">
        {book && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex">
              <img src={book.thumbnailUrl} alt={book.title} className="w-48 h-72 object-cover mr-6" />
              <div>
                <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                <p className="text-lg mb-4">by {book.authors.join(", ")}</p>
                <p className="text-gray-700 mb-4">{book.longDescription}</p>
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500 font-bold">{book.ratings.averageRating.toFixed(1)}</span>
                  <span className="text-gray-600 ml-2">({book.ratings.totalReviews} reviews)</span>
                </div>
                <p className="mb-2">
                  <strong>ISBN:</strong> {book.isbn}
                </p>
                <p className="mb-2">
                  <strong>Publisher:</strong> {book.publisher}
                </p>
                <p className="mb-2">
                  <strong>Published Date:</strong> {new Date(book.publishedDate).toLocaleDateString()}
                </p>
                <p className="mb-2">
                  <strong>Genres:</strong> {book.genres.join(", ")}
                </p>
                <p className="mb-2">
                  <strong>Format:</strong> {book.format}
                </p>
                <p className="mb-2">
                  <strong>Page Count:</strong> {book.pageCount}
                </p>
                <p className="mb-2">
                  <strong>Weight:</strong> {book.weight} kg
                </p>
                <p className="mb-2">
                  <strong>Language:</strong> {book.language}
                </p>
                <p className="mb-2">
                  <strong>Price:</strong> {book.price} kr
                </p>
                <p className="mb-2">
                  <strong>Stock Quantity:</strong> {book.stockQuantity}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                onClick={() => setShowReviews((prev) => !prev)}
              >
                {showReviews ? "Hide Reviews" : "Show Reviews"}
              </button>
              {showReviews && (
                <div className="mt-6">
                  {reviews.map((review) => (
                    <div key={review.ReviewID} className="border-b border-gray-200 pb-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-bold">{`${review.FirstName} ${review.LastName}`}</p>
                          <p className="text-sm text-gray-600">{new Date(review.CreatedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-yellow-500 font-bold">{review.Rating}</div>
                      </div>
                      <p>{review.Comment}</p>
                    </div>
                  ))}
                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-4">Add a Review</h3>
                    <div className="mb-4">
                      <label className="block text-gray-700">Rating</label>
                      <select
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      >
                        <option value="0">Select Rating</option>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700">Comment</label>
                      <textarea
                        className="border border-gray-300 rounded-md p-2 w-full"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      />
                    </div>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleReviewSubmit}>
                      Submit Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Book;
