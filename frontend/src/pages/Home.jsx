import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Start from "./Start";
import AddGenre from "./AddGenre";
import AddAuthor from "./AddAuthor";
import AddBook from "./AddBook";
import './pagestyles/Home.css'

function Home() {
    const [message, setMessage] = useState('');
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the genres when the component loads
        fetch('http://127.0.0.1:5000/get_genres')
          .then(response => response.json())
          .then(data => setGenres(data))
          .catch(error => setMessage('Error fetching genres'));

        fetch('http://127.0.0.1:5000/get_authors')
            .then(response => response.json())
            .then(data => setAuthors(data))
            .catch(error => setMessage('Error fetching authors'));
        
        fetch('http://127.0.0.1:5000/get_books')
            .then(response => response.json())
            .then(data => setBooks(data))
            .catch(error => setMessage('Error fetching books'));
      }, []
    );

    const handleGenreDelete = (id) => {
        fetch(`http://127.0.0.1:5000/delete_genre/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    // On success, remove the deleted genre from the state
                    setGenres(genres.filter(genre => genre.id !== id));
                    setMessage(data.message);
                } else {
                    setMessage(data.error);
                }
            })
            .catch(error => setMessage('Error deleting genre'));
    };

    const handleAuthorDelete = (id) => {
        fetch(`http://127.0.0.1:5000/delete_author/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    setAuthors(authors.filter(author => author.id !== id));
                    setMessage(data.message);

                    fetch('http://127.0.0.1:5000/get_books')
                        .then(response => response.json())
                        .then(data => setBooks(data))
                        .catch(error => setMessage('Error refreshing books'));
                }
                else {
                    setMessage(data.error);
                }
            })
            .catch(error => setMessage('Error deleting author'));
    };

    const handleBookDelete = (id) => {
        fetch(`http://127.0.0.1:5000/delete_book/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    setBooks(books.filter(book => book.id !== id));
                    setMessage(data.message);

                    fetch('http://127.0.0.1:5000/get_books')
                        .then(response => response.json())
                        .then(data => setBooks(data))
                        .catch(error => setMessage('Error refreshing books'));
                }
                else {
                    setMessage(data.error);
                }
            })
            .catch(error => setMessage('Error deleting book'));
    };

    return (
        <div>
            <h1>Home Screen</h1>
            <div className="home-container">
                {/* Books Section */}
                <div className="section books-section">
                    <h2 className="section-title">Books</h2>
                    <div className="section-content">
                        <button className="addButton" onClick={() => navigate("/addBook")}>Add Book</button>
                        <div className='table-wrapper'>
                        <table className='content-table'>
                            <thead>
                                <tr>
                                <th>Book Name</th>
                                <th>Genre</th>
                                <th>Author</th>
                                <th>Price</th>
                                <th>Release Year</th>
                                <th>Copies Sold</th>
                                <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book) => (
                                    <tr key={book.id}>
                                        <td>{book.name}</td>
                                        <td>{book.genre}</td>
                                        <td>{book.author}</td>
                                        <td>${book.price}</td>
                                        <td>{book.year}</td>
                                        <td>{book.copies}</td>
                                        <td>
                                            <button onClick={() => navigate("/updateBook", {state: {id: book.id, name: book.name, genre_id: book.genre_id, genre: book.genre, author_id: book.author_id, author: book.author, price: book.price, year: book.year, copies: book.copies}})} className='updateButton'>Update</button>
                                            <button onClick={() => handleBookDelete(book.id)} className='deleteButton'>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                    
                </div>

                {/* Genres Section */}
                <div className="section genres-section">
                    <h2 className="section-title">Genres</h2>
                    <div className="section-content">
                        <button className="addButton" onClick={() => navigate("/addGenre")}>Add Genre</button>
                        <div className='table-wrapper'>
                        <table className="content-table">
                            <thead>
                                <tr>
                                <th>Genre Name</th>
                                <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {genres.map((genre) => (
                                    <tr key={genre.id}>
                                        <td>{genre.genre_name}</td>
                                        <td>
                                            <button onClick={() => handleGenreDelete(genre.id)} className='deleteButton'>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>   
                </div>

                {/* Authors Section */}
                <div className="section authors-section">
                    <h2 className="section-title">Authors</h2>
                    <div className="section-content">
                        <button className="addButton" onClick={() => navigate("/addAuthor")}>Add Author</button>
                        <div className='table-wrapper'>
                        <table className='content-table'>
                            <thead>
                                <tr>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Age</th>
                                <th>Country</th>
                                <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {authors.map((author) => (
                                    <tr key={author.id}>
                                        <td>{author.first}</td>
                                        <td>{author.last}</td>
                                        <td>{author.age}</td>
                                        <td>{author.country}</td>
                                        <td>
                                            <button onClick={() => navigate("/updateAuthor", {state: {id: author.id, first: author.first, last: author.last, age: author.age, country: author.country}})} className='updateButton'>Update</button>
                                            <button onClick={() => handleAuthorDelete(author.id)} className='deleteButton'>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>

                <div className='section report-section'>
                    <div className='section-content'>
                        <button className="reportButton" onClick={() => navigate("/report")}>Get Statistics Report</button>
                    </div>
                </div>
            </div>
                
        </div>
    )
}

export default Home