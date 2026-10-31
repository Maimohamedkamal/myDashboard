import axios from "axios"

  export async function getBestsellerData(){
  let response= await axios.get("https://oud-elite.shaarapp.com/api/v1/products?category=1")
    
console.log(response.data?.data?.products )
return  response.data?.data?.products 
  }
  
