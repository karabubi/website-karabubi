// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Register = ({ setIsAuthenticated }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleRegister = (e) => {
//     e.preventDefault();
//     // Simulate registration logic
//     if (username && password) {
//       setIsAuthenticated(true); // Set authentication to true
//       navigate("/private"); // Redirect to the private page
//     } else {
//       alert("Please fill in all fields.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//         <h1 className="text-2xl font-bold text-blue-500 mb-6">Register</h1>
//         <form onSubmit={handleRegister}>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Username</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div className="mb-6">
//             <label className="block text-gray-700 mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
//           >
//             Register
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const Register = ({ setIsAuthenticated }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [email, setEmail] = useState("");
//   const [isRegistering, setIsRegistering] = useState(true); // Toggle between login and register
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!username || !password) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     try {
//       const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
//       const payload = isRegistering ? { username, password, email } : { username, password };

//       const response = await axios.post(`http://localhost:5001${endpoint}`, payload);

//       if (response.data.success) {
//         setIsAuthenticated(true);
//         navigate("/private");
//       } else {
//         setError(response.data.message || "An error occurred.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setError("An error occurred. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//         <h1 className="text-2xl font-bold text-blue-500 mb-6 text-center">
//           {isRegistering ? "Register" : "Login"}
//         </h1>
//         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Username</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           {isRegistering && (
//             <div className="mb-4">
//               <label className="block text-gray-700 mb-2">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           )}
//           <div className="mb-6">
//             <label className="block text-gray-700 mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mb-4"
//           >
//             {isRegistering ? "Register" : "Login"}
//           </button>
//           <p className="text-center text-gray-700">
//             {isRegistering ? "Already have an account? " : "Don't have an account? "}
//             <button
//               type="button"
//               onClick={() => setIsRegistering(!isRegistering)}
//               className="text-blue-500 hover:underline focus:outline-none"
//             >
//               {isRegistering ? "Login here" : "Register here"}
//             </button>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;




// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const Register = ({ setIsAuthenticated }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [email, setEmail] = useState("");
//   const [isRegistering, setIsRegistering] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!username || !password) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     try {
//       const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
//       const payload = isRegistering ? { username, password, email } : { username, password };

//       const response = await axios.post(`http://localhost:5001${endpoint}`, payload);

//       if (response.data.success) {
//         setIsAuthenticated(true);
//         navigate("/private");
//       } else {
//         setError(response.data.message || "An error occurred.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setError("An error occurred. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//         <h1 className="text-2xl font-bold text-blue-500 mb-6 text-center">
//           {isRegistering ? "Register" : "Login"}
//         </h1>
//         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Username</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           {isRegistering && (
//             <div className="mb-4">
//               <label className="block text-gray-700 mb-2">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           )}
//           <div className="mb-6">
//             <label className="block text-gray-700 mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mb-4"
//           >
//             {isRegistering ? "Register" : "Login"}
//           </button>
//           <p className="text-center text-gray-700">
//             {isRegistering ? "Already have an account? " : "Don't have an account? "}
//             <button
//               type="button"
//               onClick={() => setIsRegistering(!isRegistering)}
//               className="text-blue-500 hover:underline focus:outline-none"
//             >
//               {isRegistering ? "Login here" : "Register here"}
//             </button>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;



// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const Register = ({ setIsAuthenticated }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [email, setEmail] = useState("");
//   const [isRegistering, setIsRegistering] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!username || !password) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     try {
//       const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
//       const payload = isRegistering ? { username, password, email } : { username, password };

//       const response = await axios.post(`http://localhost:5001${endpoint}`, payload);

//       if (response.data.success) {
//         setIsAuthenticated(true);
//         navigate("/private");
//       } else {
//         setError(response.data.message || "An error occurred.");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       setError("An error occurred. Please try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
//         <h1 className="text-2xl font-bold text-blue-500 mb-6 text-center">
//           {isRegistering ? "Register" : "Login"}
//         </h1>
//         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Username</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           {isRegistering && (
//             <div className="mb-4">
//               <label className="block text-gray-700 mb-2">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           )}
//           <div className="mb-6">
//             <label className="block text-gray-700 mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mb-4"
//           >
//             {isRegistering ? "Register" : "Login"}
//           </button>
//           <p className="text-center text-gray-700">
//             {isRegistering ? "Already have an account? " : "Don't have an account? "}
//             <button
//               type="button"
//               onClick={() => setIsRegistering(!isRegistering)}
//               className="text-blue-500 hover:underline focus:outline-none"
//             >
//               {isRegistering ? "Login here" : "Register here"}
//             </button>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;





import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = ({ setIsAuthenticated }) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !username || !password || !email) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegistering ? { name, username, password, email } : { username, password };

      console.log("Sending payload:", payload); // Debugging: Log the payload

      const response = await axios.post(`http://localhost:5001${endpoint}`, payload);

      console.log("Response:", response.data); // Debugging: Log the response

      if (response.data.success) {
        setIsAuthenticated(true);
        navigate("/private");
      } else {
        setError(response.data.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Error:", error); // Debugging: Log the error
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-500 mb-6 text-center">
          {isRegistering ? "Register" : "Login"}
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mb-4"
          >
            {isRegistering ? "Register" : "Login"}
          </button>
          <p className="text-center text-gray-700">
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-500 hover:underline focus:outline-none"
            >
              {isRegistering ? "Login here" : "Register here"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;