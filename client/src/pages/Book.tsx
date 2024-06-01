import { useParams } from "react-router-dom";

const Book = () => {
  // get id from url
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Book</h1>
      <p>Book id: {id}</p>
    </div>
  );
};

export default Book;
