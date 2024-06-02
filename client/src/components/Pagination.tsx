const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Adjust as needed

    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handlePrevClick = () => {
    onPageChange(Math.max(1, currentPage - 1));
  };

  const handleNextClick = () => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center mt-4">
      <button
        onClick={handlePrevClick}
        disabled={currentPage === 1}
        className="px-3 py-1 mr-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
      >
        &lt;
      </button>
      {generatePageNumbers().map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`px-3 py-1 mx-1 rounded-md ${
            currentPage === pageNumber
              ? "bg-blue-500 text-white font-semibold"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          {pageNumber}
        </button>
      ))}
      <button
        onClick={handleNextClick}
        disabled={currentPage === totalPages}
        className="px-3 py-1 ml-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
      >
        &gt;
      </button>

      <select
        value={currentPage}
        onChange={(e) => handlePageChange(parseInt(e.target.value))}
        className="px-3 py-1 mx-2 border border-gray-300 rounded-md focus:outline-none"
      >
        {pageOptions.map((page) => (
          <option key={page} value={page}>
            {page}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Pagination;
