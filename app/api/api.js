import axios from 'axios'
const api = axios.create({
  baseURL: "https://obreiro-digital-api-5f4j.onrender.com/"
})
export default api;