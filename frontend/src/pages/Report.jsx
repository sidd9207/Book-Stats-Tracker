import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import './pagestyles/Report.css'

function Report() {
    const [message, setMessage] = useState('');
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [books, setBooks] = useState([]);
    const [totalCopiesSold, setTotalCopiesSold] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [author, setAuthor] = useState(-1);
    const [genre, setGenre] = useState(-1);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(Number.MAX_SAFE_INTEGER);
    const [minReleaseYear, setMinReleaseYear] = useState(0);
    const [maxReleaseYear, setMaxReleaseYear] = useState(Number.MAX_SAFE_INTEGER);
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

    const handleGenreChange = (event) => {
        const value = event.target.value;
        setGenre(value === "" ? -1 : parseInt(value, 10));
    };

    const handleAuthorChange = (event) => {
        const value = event.target.value;
        setAuthor(value === "" ? -1 : parseInt(value, 10));
    };

    const handleMinPriceChange = (event) => {
        setMinPrice(parseFloat(event.target.value));
    };

    const handleMaxPriceChange = (event) => {
        setMaxPrice(parseFloat(event.target.value));
    };

    const handleMinReleaseYearChange = (event) => {
        setMinReleaseYear(parseInt(event.target.value, 10));
    };

    const handleMaxReleaseYearChange = (event) => {
        setMaxReleaseYear(parseInt(event.target.value, 10));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        const formData = {author: author, genre: genre, minPrice: minPrice, maxPrice: maxPrice, minReleaseYear: minReleaseYear, maxReleaseYear: maxReleaseYear}

        try {
            const response = await fetch('http://127.0.0.1:5000/generate_report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.status === 200) {
                setBooks(data.books || [])
                setTotalCopiesSold(data.totalCopiesSold || 0)
                setTotalRevenue(data.totalRevenue || 0)
                if (books.length > 0) {
                    setMessage("Report Generated!");
                } else {
                    setMessage("No books match the given criteria:(");
                }
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            setMessage('Error: Unable generate report.')
        }
    };

    return (
        <div>
            <h2>Inventory Statistics</h2>
            <div className='section'>
                <form className='submit-form' onSubmit={handleSubmit}>
                    <div className='pair'>
                        <label htmlFor='author' className='label'>Author:</label>
                        <select id='author' value={author} onChange={handleAuthorChange}>
                            <option value="">Select Author</option>
                            {authors.map((author) => (
                                <option key={author.id} value={author.id}>{author.first} {author.last}</option>
                            ))}
                        </select>
                    </div>

                    <div className='pair'>
                        <label htmlFor='genre' className='label'>Genre:</label>
                        <select id='genre' value={genre} onChange={handleGenreChange}>
                            <option value="">Select Genre</option>
                            {genres.map((genre) => (
                                <option key={genre.id} value={genre.id}>{genre.genre_name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className='pair'>
                    <div className='pair'>
                        <label htmlFor="price" className="label">Min Price:</label>
                        <input id="price" type="number" placeholder="" value={minPrice} onChange={handleMinPriceChange} />
                    </div>

                    <div className='pair'>
                        <label htmlFor="price" className="label">Max Price:</label>
                        <input id="price" type="number" placeholder="" value={maxPrice} onChange={handleMaxPriceChange} />
                    </div>
                    </div>

                    <div className='pair'>
                    <div className='pair'>
                        <label htmlFor="year" className="label">Min Release Year:</label>
                        <input id="year" type="number" placeholder="" value={minReleaseYear} onChange={handleMinReleaseYearChange} />
                    </div>

                    <div className='pair'>
                        <label htmlFor="year" className="label">Max Release Year:</label>
                        <input id="year" type="number" placeholder="" value={maxReleaseYear} onChange={handleMaxReleaseYearChange} />
                    </div>
                    </div>

                    <button className="addButton" type='submit'>Generate Report</button>
                </form>
                {message && <p>{message}</p>}
                {books.length > 0 && (
                    <div className="book-results">
                        <h3>Report</h3>
                            <h4>Books</h4>
                            <table className='content-table'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Author</th>
                                        <th>Genre</th>
                                        <th>Price</th>
                                        <th>Release Year</th>
                                        <th>Copies Sold</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map((book, index) => (
                                        <tr key={index}>
                                            <td>{book.name}</td>
                                            <td>{book.author}</td>
                                            <td>{book.genre}</td>
                                            <td>${book.price}</td>
                                            <td>{book.releaseYear}</td>
                                            <td>{book.copies}</td>
                                            <td>${book.revenue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <h4>Total Copies Sold: {totalCopiesSold}</h4>
                            <h4>Total Revenue Generated: ${totalRevenue}</h4>
                    </div>
                )}
            </div>
            <button className="backButton" onClick={() => navigate("/home")}>Back</button>
        </div>
    )
}

export default Report