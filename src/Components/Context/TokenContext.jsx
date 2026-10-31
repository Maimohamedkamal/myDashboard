import React, { useState } from 'react'
import { createContext } from 'react'

 export const TokenContext=createContext()

export default function TokenContextProvider({children}) {
const [Token,setToken]=useState(localStorage.getItem('token'))

  return (
    <TokenContext.Provider value={{Token,setToken}}>
        {children}
        </TokenContext.Provider>
  )
}
