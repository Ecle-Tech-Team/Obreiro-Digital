import axios from 'axios'
const api = axios.create({
  baseURL: "https://obreiro-digital-api-production.up.railway.app"
})
export default api;