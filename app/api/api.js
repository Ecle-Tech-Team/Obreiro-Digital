import axios from 'axios'
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  withCredentials: true
})

// Páginas que funcionam sem sessão: nelas um 401 é resposta normal (ex.: senha errada).
const PUBLIC_PAGES = ['/pages/login', '/pages/recuperarSenha', '/pages/cadastroIgreja', '/pages/cadastroPastor', '/pages/apresentacao'];

// Sessão expirada ou revogada: limpa os dados locais e volta ao login (uma vez só).
let redirecting = false;
api.interceptors.response.use(
  response => response,
  error => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const isPublic = path === '/' || PUBLIC_PAGES.some(page => path.startsWith(page));
    if (error?.response?.status === 401 && !isPublic && !redirecting) {
      redirecting = true;
      try {
        sessionStorage.clear();
        sessionStorage.setItem('sessaoExpirada', '1');
      } catch { /* armazenamento indisponível */ }
      window.location.assign('/pages/login');
    }
    return Promise.reject(error);
  }
);

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
