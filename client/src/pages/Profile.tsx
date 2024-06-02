import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select, { createFilter } from "react-select";
import { toast } from "sonner";

const Profile = () => {
  const [userPreferences, setUserPreferences] = useState(null);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formats, setFormats] = useState([]);
  const [authors, setAuthors] = useState([]);
  const navigate = useNavigate();

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get("http://localhost:3000/user/preferences", { withCredentials: true });
        setUserPreferences(userResponse.data);

        const genresResponse = await axios.get("http://localhost:3000/books/genres", { withCredentials: true });
        setGenres(genresResponse.data.map((genre) => ({ value: genre, label: genre })));

        const languagesResponse = await axios.get("http://localhost:3000/books/languages", { withCredentials: true });
        setLanguages(languagesResponse.data.map((language) => ({ value: language, label: language })));

        const formatsResponse = await axios.get("http://localhost:3000/books/formats", { withCredentials: true });
        setFormats(formatsResponse.data.map((format) => ({ value: format, label: format })));

        const authorsResponse = await axios.get("http://localhost:3000/books/authors", { withCredentials: true });
        setAuthors(authorsResponse.data.map((author) => ({ value: author, label: author })));

        setSelectedGenres(userResponse.data.PreferedGenres.map((genre) => ({ value: genre, label: genre })));
        setSelectedLanguages(
          userResponse.data.PreferedLanguages.map((language) => ({ value: language, label: language }))
        );
        setSelectedFormats(userResponse.data.PreferedFormats.map((format) => ({ value: format, label: format })));
        setSelectedAuthors(userResponse.data.PreferedAuthors.map((author) => ({ value: author, label: author })));
      } catch (error) {
        console.log("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const handleSavePreferences = async () => {
    try {
      const response = await axios.put(
        "http://localhost:3000/user/preferences",
        {
          PreferedGenres: selectedGenres.map((item) => item.value),
          PreferedAuthors: selectedAuthors.map((item) => item.value),
          PreferedFormats: selectedFormats.map((item) => item.value),
          PreferedLanguages: selectedLanguages.map((item) => item.value),
        },
        { withCredentials: true }
      );
      if (response.status === 200) {
        toast.success("Preferences updated successfully");
      } else {
        console.log("Error updating preferences");
      }
    } catch (error) {
      console.log("Error updating preferences", error);
    }
  };

  const handleRemove = (setter, value) => {
    setter((prev) => prev.filter((item) => item.value !== value));
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmation = window.confirm("Are you sure you want to delete your account? This action is irreversible.");

      if (!confirmation) {
        return;
      }

      const response = await axios.delete("http://localhost:3000/user/delete", { withCredentials: true });
      if (response.status === 200) {
        toast.success("Account deleted successfully");
        navigate("/login");
      } else {
        console.log("Error deleting account");
        toast.error("Error deleting account");
      }
    } catch (error) {
      console.log("Error deleting account", error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        {userPreferences ? (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="genres">
                Preferred Genres
              </label>
              <div className="mb-2">
                {selectedGenres.map((genre) => (
                  <span
                    key={genre.value}
                    onClick={() => handleRemove(setSelectedGenres, genre.value)}
                    className="inline-block bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2 cursor-pointer hover:bg-blue-300"
                  >
                    {genre.label}
                  </span>
                ))}
              </div>
              <Select
                id="genres"
                options={genres.filter((genre) => !selectedGenres.some((selected) => selected.value === genre.value))}
                isMulti
                value={null}
                onChange={(selectedOption) => {
                  setSelectedGenres([...selectedGenres, selectedOption[selectedOption.length - 1]]);
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="languages">
                Preferred Languages
              </label>
              <div className="mb-2">
                {selectedLanguages.map((language) => (
                  <span
                    key={language.value}
                    onClick={() => handleRemove(setSelectedLanguages, language.value)}
                    className="inline-block bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2 cursor-pointer hover:bg-blue-300"
                  >
                    {language.label}
                  </span>
                ))}
              </div>
              <Select
                id="languages"
                options={languages.filter(
                  (language) => !selectedLanguages.some((selected) => selected.value === language.value)
                )}
                isMulti
                value={null}
                onChange={(selectedOption) => {
                  setSelectedLanguages([...selectedLanguages, selectedOption[selectedOption.length - 1]]);
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="formats">
                Preferred Formats
              </label>
              <div className="mb-2">
                {selectedFormats.map((format) => (
                  <span
                    key={format.value}
                    onClick={() => handleRemove(setSelectedFormats, format.value)}
                    className="inline-block bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2 cursor-pointer hover:bg-blue-300"
                  >
                    {format.label}
                  </span>
                ))}
              </div>
              <Select
                id="formats"
                options={formats.filter(
                  (format) => !selectedFormats.some((selected) => selected.value === format.value)
                )}
                isMulti
                value={null}
                onChange={(selectedOption) => {
                  setSelectedFormats([...selectedFormats, selectedOption[selectedOption.length - 1]]);
                }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="authors">
                Preferred Authors
              </label>
              <div className="mb-2">
                {selectedAuthors.map((author) => (
                  <span
                    key={author.value}
                    onClick={() => handleRemove(setSelectedAuthors, author.value)}
                    className="inline-block bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2 cursor-pointer hover:bg-blue-300"
                  >
                    {author.label}
                  </span>
                ))}
              </div>
              <Select
                id="authors"
                filterOption={createFilter({ ignoreAccents: false })}
                options={authors.filter(
                  (author) => !selectedAuthors.some((selected) => selected.value === author.value)
                )}
                isMulti
                value={null}
                onChange={(selectedOption) => {
                  setSelectedAuthors([...selectedAuthors, selectedOption[selectedOption.length - 1]]);
                }}
              />
            </div>
            <Button className="p-2 rounded-md w-full" onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </form>
        ) : (
          <p>Loading user preferences...</p>
        )}
      </div>

      {/* Delete user account */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Delete Account</h2>
        <Button className="p-2 rounded-md w-full" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </div>
    </>
  );
};

export default Profile;
