import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./Home";
import AddGenre from "./AddGenre";
import AddAuthor from "./AddAuthor";
import AddBook from "./AddBook";
import '../App.css'

function Start() {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://127.0.0.1:5000/')
        .then(response => response.text())
        .then(data => setMessage(data));
    }, []);

    return (
        <div>
        <h1>Welcome to the Book Stats Tracker!</h1>
        <button onClick={() => navigate("/home")}>Go to Home Page</button>
        </div>
    )
}

export default Start