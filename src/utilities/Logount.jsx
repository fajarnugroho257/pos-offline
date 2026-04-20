import { useNavigate } from "react-router-dom";
import api from "../utilities/axiosInterceptor";
import { swalConfirm } from "./Swal";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // TOKEN
    const token = localStorage.getItem("token");
    //
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
    } catch (error) {}
  };

  return (
    <button onClick={handleLogout} className="font-poppins font-semibold">
      <i className="fa fa-power-off"></i> Logout
    </button>
  );
};

export default Logout;
