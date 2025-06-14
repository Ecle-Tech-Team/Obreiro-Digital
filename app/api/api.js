import axios from 'axios'
const api = axios.create({
  baseURL: "http://localhost:3333"
})

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('Token não encontrado no sessionStorage');
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

export default api;