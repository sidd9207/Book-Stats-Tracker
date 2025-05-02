import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Start from "./pages/Start";
import Home from "./pages/Home";
import AddGenre from "./pages/AddGenre";
import AddAuthor from "./pages/AddAuthor";
import AddBook from "./pages/AddBook";
import UpdateAuthor from './pages/UpdateAuthor';
import UpdateBook  from './pages/UpdateBook';
import Report from './pages/Report';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:5000/')
      .then(response => response.text())
      .then(data => setMessage(data));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/home" element={<Home />} />
        <Route path="/addGenre" element={<AddGenre />} />
        <Route path="/addAuthor" element={<AddAuthor />} />
        <Route path="/addBook" element={<AddBook />} />
        <Route path="/updateAuthor" element={<UpdateAuthor />} />
        <Route path="/updateBook" element={<UpdateBook />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  )
}

export default App