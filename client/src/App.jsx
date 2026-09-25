import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Photos from "./components/Photos";
import Contact from "./components/Contact";
import Private from "./components/Private";
import Register from "./components/Register";
import Login from "./components/Login";
import Wisdom from "./components/Wisdom";
import AdminWisdom from "./components/AdminWisdom";
import WisdomPoetry from "./components/WisdomPoetry";
import AdminWisdomPoetry from "./components/AdminWisdomPoetry";
import Videos from "./components/Videos";
import Gallery from "./components/Gallery";
import AdminGallery from "./components/AdminGallery";
import AdminVideos from "./components/AdminVideos";

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/wisdom" element={<Wisdom />} />
          <Route path="/admin/wisdom" element={<AdminWisdom />} />
          <Route path="/wisdom-poetry" element={<WisdomPoetry />} />
          <Route path="/admin/wisdom-poetry" element={<AdminWisdomPoetry />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/videos" element={<AdminVideos />} />
          <Route path="/private" element={<Private />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;
