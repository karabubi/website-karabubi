// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { register, login } from "../api";

// // const Register = ({ setIsAuthenticated }) => {
// //   const [isRegistering, setIsRegistering] = useState(true);
// //   const [formData, setFormData] = useState({ name: "", username: "", password: "", email: "" });
// //   const [error, setError] = useState("");
// //   const navigate = useNavigate();

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       const response = isRegistering ? await register(formData) : await login(formData);
// //       if (response.data.success) {
// //         setIsAuthenticated(true);
// //         navigate("/private");
// //       } else {
// //         setError(response.data.error || "An error occurred.");
// //       }
// //     } catch (error) {
// //       setError("An error occurred. Please try again.");
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gray-100">
// //       <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
// //         <h1 className="text-2xl font-bold text-blue-500 mb-6 text-center">
// //           {isRegistering ? "Register" : "Login"}
// //         </h1>
// //         {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
// //         <form onSubmit={handleSubmit}>
// //           {isRegistering && (
// //             <input
// //               type="text"
// //               placeholder="Name"
// //               className="input"
// //               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //             />
// //           )}
// //           <input type="text" placeholder="Username" className="input" />
// //           {isRegistering && <input type="email" placeholder="Email" className="input" />}
// //           <input type="password" placeholder="Password" className="input" />
// //           <button className="btn">{isRegistering ? "Register" : "Login"}</button>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Register;


// // client/src/components/Register.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { register, login } from "../api";

// const Register = ({ setIsAuthenticated }) => {
//   const [isRegistering, setIsRegistering] = useState(true);
//   const [formData, setFormData] = useState({ name: "", username: "", password: "", email: "" });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.username || !formData.password || (isRegistering && (!formData.name || !formData.email))) {
//       setError("All fields are required.");
//       return;
//     }

//     try {
//       const response = isRegistering ? await register(formData) : await login(formData);
//       if (response.data.success) {
//         setIsAuthenticated(true);
//         navigate("/private");
//       } else {
//         setError(response.data.error || "An error occurred.");
//       }
//     } catch (error) {
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
//           {isRegistering && (
//             <input
//               type="text"
//               placeholder="Name"
//               className="input"
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             />
//           )}
//           <input
//             type="text"
//             placeholder="Username"
//             className="input"
//             onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//           />
//           {isRegistering && (
//             <input
//               type="email"
//               placeholder="Email"
//               className="input"
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//             />
//           )}
//           <input
//             type="password"
//             placeholder="Password"
//             className="input"
//             onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//           />
//           <button className="btn">{isRegistering ? "Register" : "Login"}</button>
//         </form>
//         <p className="text-center mt-4">
//           {isRegistering ? "Already have an account? " : "Don't have an account? "}
//           <button
//             className="text-blue-500 hover:underline"
//             onClick={() => setIsRegistering(!isRegistering)}
//           >
//             {isRegistering ? "Login" : "Register"}
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;



import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User registered:", userCredential.user);
      navigate("/private");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Register;