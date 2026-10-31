
import { Toaster } from "react-hot-toast";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Authlayout from "./Layout/Authlayout";

import Home from "./Pages/Home/Home";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";

import ProtectedroutesApp from "./Components/ProtectedRoutes/ProtectedroutesApp";
import AdminLayout from "./Layout/AdminLayout";
import AllProducts from "./Components/Products/AllProducts";
import CreateCategory from "./Components/Category/CreateCategory";
import AllOrders from "./Components/AllOrders/AllOrders";
import AllReviews from "./Components/Reviews/Reviews";
import AllCoupons from "./Components/Coupons/Coupons";
import Setting from "./Components/Setting/Setting";
import AllUsers from "./Components/Users/Users";
import Banners from "./Components/Banners/Banners";



export default function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AdminLayout />,
      children: [
        {
          index: true,
          element: <Navigate to="/home" replace />,
        },

        {
          path: "home",
          element: <Home />,
        },
      
        {
          path: "admin/products",
          element: <AllProducts/>,
        },
       
        {
          path: "admin/categories",
          element: <CreateCategory/>,
        },
       
        {
          path: "admin/orders",
          element:<AllOrders/>,
        },
       
        {
          path: "admin/customersReview",
          element:<AllReviews/>,
        },
        {
          path: "admin/customers",
          element:<AllUsers/>,
        },
       
        {
          path: "admin/coupons",
          element:<AllCoupons/>,
        },
        {
          path: "admin/settings",
          element:<Setting/>,
        },
        {
          path: "admin/banners",
          element:<Banners/>,
        },
       

       

    
       

      ],
    },

    // Protected routes
    {
      element: <ProtectedroutesApp />,
      children: [

    
      ],
    },

    // Authentication routes
    {
      path: "/",
      element: <Authlayout />,
      children: [
        {
          path: "login",
          element: <Login />,
        },

        {
          path: "register",
          element: <Register />,
        },
      ],
    },
  ]);

  return (
    <>
    
      <Toaster position="top-center" />
      <RouterProvider router={router} /></>
    
  );
}
