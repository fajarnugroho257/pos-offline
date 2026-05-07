import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";
import { swalConfirm, swalError } from "./Swal";
import isOnline from "./isOnline";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // TOKEN
    const token = localStorage.getItem("token");
    if (isOnline) {
      try {
        const result = await swalConfirm("Yakin?", "Anda akan keluar");
        if (result.isConfirmed) {
          const response = await api.get("/logout", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });
          if (response.status === 200) {
            // Hapus token dari local storage (atau session storage)
            localStorage.removeItem("token");
            // Arahkan ke halaman login
            navigate("/login");
          }
        }
      } catch (error) {
        swalError(
          "Opps..!",
          error?.response?.data?.message ||
            error.message ||
            "Terjadi kesalahan",
        );
      }
    } else {
      swalError("Anda dalam mode offline", "tidak bisa logout");
    }
    //
  };

  return (
    <button onClick={handleLogout} className="font-poppins font-semibold">
      <i className="fa fa-power-off"></i> Logout
    </button>
  );
};

export default Logout;
