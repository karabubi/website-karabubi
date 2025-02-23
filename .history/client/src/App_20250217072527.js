import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Photos from "./components/Photos";
import Contact from "./components/Contact";
import Private from "./components/Private";
import Register from "./components/Register";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/private"
          element={<Private isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/register"
          element={<Register setIsAuthenticated={setIsAuthenticated} />}
        />
      </Routes>
    </Router>
  );
}

export default App;