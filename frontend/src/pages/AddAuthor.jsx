import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Start from "./Start";
import Home from "./Home";
import AddGenre from "./AddGenre";
import AddBook from "./AddBook";
import './pagestyles/addAuthor.css'

function AddAuthor() {
    const [authorFirst, setAuthorFirst] = useState('');
    const [authorLast, setAuthorLast] = useState('');
    const [authorAge, setAuthorAge] = useState(0);
    const [authorCountry, setAuthorCountry] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleAuthorFirstChange = (event) => {
        setAuthorFirst(event.target.value);
    };

    const handleAuthorLastChange = (event) => {
        setAuthorLast(event.target.value);
    };

    const handleAuthorAgeChange = (event) => {
        setAuthorAge(parseInt(event.target.value, 10));
    };

    const handleAuthorCountryChange = (event) => {
        setAuthorCountry(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = {first: authorFirst, last: authorLast, age: authorAge, country: authorCountry}

        try {
            const response = await fetch('http://127.0.0.1:5000/add_author', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.status === 200) {
                setAuthorFirst('');  // Clear the input field on success
                setAuthorLast('');
                setAuthorAge(0);
                setAuthorCountry('');
                setMessage(data.message);  // Show success or error message from the backend
            } else {
                setMessage(data.error);
            }
        } catch (error) {
            setMessage('Error: Unable to add author.')
        }
    };

    return (
        <div>
            <h2>Add New Author</h2>
            <div className='section submit-form'>
                <form className='submit-form' onSubmit={handleSubmit}>
                    <div className='pair'>
                        <label htmlFor="first" className="label">First Name:</label>
                        <input id="first" type="text" placeholder="" value={authorFirst} onChange={handleAuthorFirstChange} />
                    </div>
                    <div className='pair'>
                        <label htmlFor="last" className="label">Last Name:</label>
                        <input id="last" type="text" placeholder="" value={authorLast} onChange={handleAuthorLastChange} />
                    </div>
                    <div className='pair'>
                        <label htmlFor="age" className="label">Age:</label>
                        <input id="age" type="number" placeholder="" value={authorAge} onChange={handleAuthorAgeChange} />
                    </div>
                    <div className='pair'>
                        <label htmlFor="country" className="label">Country:</label>
                        <input id="country" type="text" placeholder="" value={authorCountry} onChange={handleAuthorCountryChange} />
                    </div>
                    <button className="addButton" type='submit'>Add Author</button>
                </form>
                {message && <p>{message}</p>}
            </div>
            <button className="backButton" onClick={() => navigate("/home")}>Back</button>
        </div>
    )
}

export default AddAuthor