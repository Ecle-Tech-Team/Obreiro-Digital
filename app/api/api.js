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



export const fetchMembrosPorIgreja = async (id_igreja) => {
  const res = await api.get(`/membro/matriz/${id_igreja}`);
  return res.data;
};

export const fetchObreirosPorIgreja = async (id_igreja) => {
  const res = await api.get(`/obreiros/igreja/${id_igreja}`);
  return res.data;
};

export const fetchDepartamentosPorIgreja = async (id_igreja) => {
  const res = await api.get(`/departamentos/igreja/${id_igreja}`);
  return res.data;
};


export default api;