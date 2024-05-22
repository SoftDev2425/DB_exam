const books1 = require("./data/books1.json");
const books2 = require("./data/books2.json");
const books3 = require("./data/books3.json");
const books4 = require("./data/books4.json");
const books5 = require("./data/books5.json");
const books6 = require("./data/books6.json");
const books7 = require("./data/books7.json");
const books8 = require("./data/books8.json");
const books9 = require("./data/books9.json");
const books10 = require("./data/books10.json");

function countDuplicatesByISBN(books: any[]) {
  // Create an object to store the count of each ISBN
  const isbnCounts = {};

  // Loop through each book
  books.forEach((book) => {
    // Extract the ISBN number
    const isbn = book.isbn;

    // If the ISBN is already in the counts object, increment its count
    if (isbnCounts[isbn]) {
      isbnCounts[isbn]++;
    } else {
      // If it's not in the counts object, initialize its count to 1
      isbnCounts[isbn] = 1;
    }
  });

  // Create an array to store the duplicates
  const duplicates: any = [];

  // Loop through the counts object and add the ISBNs with count > 1 to the duplicates array
  for (const isbn in isbnCounts) {
    if (isbnCounts[isbn] > 1) {
      duplicates.push({
        isbn: isbn,
        count: isbnCounts[isbn],
      });
    }
  }

  return duplicates;
}

// Usage:
const duplicateISBNs = countDuplicatesByISBN([
  ...books1,
  ...books2,
  ...books3,
  ...books4,
  ...books5,
  ...books6,
  ...books7,
  ...books8,
  ...books9,
  ...books10,
]);
console.log(duplicateISBNs);
