// import React, { useState } from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Home from "./components/Home";
// import About from "./components/About";
// import Photos from "./components/Photos";
// import Contact from "./components/Contact";
// import Private from "./components/Private";
// import Register from "./components/Register";

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/photos" element={<Photos />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route
//           path="/private"
//           element={<Private isAuthenticated={isAuthenticated} />}
//         />
//         <Route
//           path="/register"
//           element={<Register setIsAuthenticated={setIsAuthenticated} />}
//         />
//       </Routes>
//     </Router>
//   );
// }

// export default App;



import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Photos from "./components/Photos";
import Contact from "./components/Contact";
import Private from "./components/Private";
import Register from "./components/Register";
import AuthContext from "./context/AuthContext";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        <Navbar />
        <Routes>
          {/* Default route to Home page */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/contact" element={<Contact />} />
          {/* Protected Private route */}
          <Route
            path="/private"
            element={
              isAuthenticated ? <Private /> : <Navigate to="/register" replace />
            }
          />
          {/* Register route */}
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;