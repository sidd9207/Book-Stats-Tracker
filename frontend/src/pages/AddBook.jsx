import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Start from "./Start";
import Home from "./Home";
import AddGenre from "./AddGenre";
import AddAuthor from "./AddAuthor";
import './pagestyles/AddBook.css'

function AddBook() {
    const [message, setMessage] = useState('');
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [bookName, setBookName] = useState('');
    const [bookGenre, setBookGenre] = useState(-1);
    const [bookAuthor, setBookAuthor] = useState(-1);
    const [bookPrice, setBookPrice] = useState(0);
    const [bookReleaseYear, setBookReleaseYear] = useState(0);
    const [bookCopiesSold, setBookCopiesSold] = useState(0);
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
      }, []
    );

    const handleBookNameChange = (event) => {
        setBookName(event.target.value);
    };

    const handleBookGenreChange = (event) => {
        setBookGenre(parseInt(event.target.value, 10));
    };

    const handleBookAuthorChange = (event) => {
        setBookAuthor(parseInt(event.target.value, 10));
    };

    const handleBookPriceChange = (event) => {
        setBookPrice(parseFloat(event.target.value));
    };

    const handleBookReleaseYearChange = (event) => {
        setBookReleaseYear(parseInt(event.target.value, 10));
    };

    const handleBookCopiesSold = (event) => {
        setBookCopiesSold(parseInt(event.target.value, 10));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = {name: bookName, genre: bookGenre, author: bookAuthor, price: bookPrice, releaseYear: bookReleaseYear, copiesSold: bookCopiesSold}

        try {
            const response = await fetch('http://127.0.0.1:5000/add_book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.status === 200) {
                setBookName('');  // Clear the input field on success
                setBookGenre(-1);
                setBookAuthor(-1);
                setBookPrice(0);
                setBookReleaseYear(0);
                setBookCopiesSold(0)
                setMessage(data.message);  // Show success or error message from the backend
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            setMessage('Error: Unable to add book.')
        }
    };


    return (
        <div>
            <h2>Add New Book</h2>
            <div className='section submit-form'>
                <form className='submit-form' onSubmit={handleSubmit}>
                    <div className='pair'>
                        <label htmlFor="name" className="label">Book Name:</label>
                        <input id="name" type="text" placeholder="" value={bookName} onChange={handleBookNameChange} />
                    </div>
                    <div className='pair'>
                        <label htmlFor='genre' className='label'>Genre:</label>
                        <select id='genre' value={bookGenre} onChange={handleBookGenreChange} required>
                            <option value="">Select Genre</option>
                            {genres.map((genre) => (
                                <option key={genre.id} value={genre.id}>{genre.genre_name}</option>
                            ))}
                        </select>
                    </div>
                    <div className='pair'>
                        <label htmlFor='author' className='label'>Author:</label>
                        <select id='author' value={bookAuthor} onChange={handleBookAuthorChange} required>
                            <option value="">Select Author</option>
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>{author.first} {author.last}</option>
                            ))}
                        </select>
                    </div>
                    <div className='pair'>
                        <label htmlFor="price" className="label">Price</label>
                        <input id="price" type="number" placeholder="" value={bookPrice} onChange={handleBookPriceChange} />
                    </div>
                    <div className='pair'>
                        <label htmlFor="year" className="label">Release Year:</label>
                        <input id="year" type="number" placeholder="" value={bookReleaseYear} onChange={handleBookReleaseYearChange} />
                    </div>
                    <div className='pair'>
                        <label htmlFor="copies" className="label">Copies Sold:</label>
                        <input id="copies" type="number" placeholder="" value={bookCopiesSold} onChange={handleBookCopiesSold} />
                    </div>
                    <button className="addButton" type='submit'>Add Book</button>
                </form>
                {message && <p>{message}</p>}
            </div>
            <button className="backButton" onClick={() => navigate("/home")}>Back</button>
        </div>
    )
}

export default AddBook