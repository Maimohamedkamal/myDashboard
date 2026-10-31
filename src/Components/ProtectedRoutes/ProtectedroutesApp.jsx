// import React, { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'

// export default function ProtectedroutesApp({children}) {
// let navigate=useNavigate()
// const [token,setToken]=useState(localStorage.getItem('token'))
// useEffect(()=>{

//     if(!token){
// navigate('/login')
//     }

// },[])


//   return (
//     <>{children}</>
//   )
// }


import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Mainlayout from "../../Layout/AdminLayout";

export default function ProtectedroutesApp() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Mainlayout />;
}
