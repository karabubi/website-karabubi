// import React from "react";
// import { Navigate } from "react-router-dom";

// const Private = ({ isAuthenticated }) => {
//   // Redirect to register if not authenticated
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

//---------1----------


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

//---------1--------

// 
// client/src/components/Private.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const Private = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/register" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-500 mb-4">Private Page</h1>
        <p className="text-gray-700">Welcome to the private page! You have successfully registered and logged in.</p>
      </div>
    </div>
  );
};

export default Private;
//
// import React from "react";
// import { Navigate } from "react-router-dom";

// const Private = ({ isAuthenticated }) => {
//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
//           <p className="text-gray-700">You need to register or log in to access this page.</p>
//           <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-blue-500 mb-4">Private Page</h1>
//         <p className="text-gray-700">Welcome to the private page! You have successfully registered and logged in.</p>
//         <a href="/" className="text-blue-500 hover:underline">Back to Home</a>
//       </div>
//     </div>
//   );
// };

// export default Private;