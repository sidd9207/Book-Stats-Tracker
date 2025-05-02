import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Start from "./Start";
import Home from "./Home";
import AddAuthor from "./AddAuthor";
import AddBook from "./AddBook";
import '../App.css'

function AddGenre() {
    const [genreName, setGenreName] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        setGenreName(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();  // Prevent page refresh on form submit
    
        const genreData = { genre_name: genreName };
    
        try {
          const response = await fetch('http://127.0.0.1:5000/add_genre', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(genreData),
          });
    
          const data = await response.json();
    
          if (response.status === 200) {
            setGenreName('');  // Clear the input field on success
            setMessage(data.message);  // Show success or error message from the backend
          } else {
            setMessage(data.error);
          }
        } catch (error) {
          setMessage('Error: Unable to add genre.');
        }
    };

    return (
        <div>
            <h2>Add New Genre</h2>
            <div className="section submit-form">
                <form className='submit-form' onSubmit={handleSubmit}>
                    <input type="text" placeholder="Enter Genre Name" value={genreName} onChange={handleInputChange} />
                    <button className="addButton" type='submit'>Add Genre</button>
                </form>
                {message && <p>{message}</p>}
            </div>
            <button className="backButton" onClick={() => navigate("/home")}>Back</button>
        </div>
    )
}

export default AddGenre