import axios from "axios"
const BaseApi="https://oud-elite.shaarapp.com/api/v1"

  export async function getWomenFragrancesData(){
  let response= await axios.get(`${BaseApi}/products?category=2`)
    
console.log(response.data?.data?.products )
return  response.data?.data?.products 
  }
  

  export async function getMenFragrancesData(){
  let response= await axios.get(`${BaseApi}/products?category=3`)
    
console.log(response.data?.data?.products )
return  response.data?.data?.products 
  }

  export async function getUnisexFragrancesData(){
  let response= await axios.get(`${BaseApi}/products?category=4`)
    
console.log(response.data?.data?.products )
return  response.data?.data?.products 
  }
  
  export async function getPortraitFragrancesData(){
  let response= await axios.get(`${BaseApi}//products?category=7`)
    
console.log(response.data?.data?.products )
return  response.data?.data?.products 
  }
  
