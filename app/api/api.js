import axios from 'axios'
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  withCredentials: true
})

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
