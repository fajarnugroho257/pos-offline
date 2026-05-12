import axios from "axios";
const endPoint = "https://sameeramart.com/app-pos/api";
// const endPoint = "http://127.0.0.1:8000/api";

// Instance Axios
const api = axios.create({
  baseURL: endPoint, // Ganti dengan URL backend Anda
});

// Interceptor untuk menangani error
api.interceptors.response.use(
  (response) => response, // Jika berhasil, lanjutkan
  (error) => {
    if (error.response && error.response.status === 401) {
      // console.log(error);
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/app-kasir/login"; // Redirect ke login
    }
    // Jangan tampilkan stack trace di konsol
    return Promise.reject({ handled: true });
  },
);

export default api;
