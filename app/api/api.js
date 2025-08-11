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
  const res = await api.get(`/cadastro/matriz/${id_igreja}`);
  return res.data;
};

export const fetchDepartamentosPorIgreja = async (id_igreja) => {
  const res = await api.get(`/departamento/matriz/${id_igreja}`);
  return res.data;
};

export const moverPessoa = async (tipo, id, nova_igreja_id) => {
  const endpoint = tipo === "membro" ? "/mover/membro" : "/mover/cadastro";

  const body =
    tipo === "membro"
      ? { id_membro: id, nova_igreja_id }
      : { id_user: id, nova_igreja_id };

  const res = await api.put(endpoint, body);
  return res.data;
};


export default api;