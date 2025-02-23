// import React from "react";
// import { Navigate } from "react-router-dom";

// const Private = ({ isAuthenticated }) => {
//   if (!isAuthenticated) {
//     return <Navigate to="/register" />;
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-blue-500 mb-4">Private Page</h1>
//         <p className="text-gray-700">Welcome to the private page! You have successfully registered and logged in.</p>
//       </div>
//     </div>
//   );
// };

// export default Private;


import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

const Private = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div>
      <h1>Private Page</h1>
      <p>Welcome, {user.email}!</p>
    </div>
  );
};

export default Private;