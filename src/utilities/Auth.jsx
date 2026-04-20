// utils/auth.js
export const setToken = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("cabang_id", data.cabang_id);
  localStorage.setItem("cabang_nama", data.cabang_nama);
  localStorage.setItem("toko_pusat_id", data.toko_pusat_id);
  localStorage.setItem("toko_pusat", data.toko_pusat);
  localStorage.setItem("name", data.user.name);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const setPage = (page) => {
  localStorage.setItem("page", page);
};

export const getPusat = () => {
  return localStorage.getItem("toko_pusat");
};

export const getCabang = () => {
  return localStorage.getItem("cabang_nama");
};
