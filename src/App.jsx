import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import Splash from "./Splash";
import { Route, Routes } from "react-router-dom";
import AuthRoute from "./utilities/AuthRoute";

import Header from "./components/Header";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";
import Pos from "./page/Pos";
import Penjualan from "./page/Penjualan";
import Setting from "./page/Settings";
import DraftPenjualan from "./page/DraftPenjualan";
import Hutang from "./page/Hutang";
import HeaderCopy from "./components/HeaderCopy";
import Laporan from "./page/Laporan";
import Barang from "./page/Barang";

function App() {
  const location = useLocation();
  const uri = location.pathname;
  // console.log(uri);
  const status = uri === "/login" || uri === "/" ? "hidden" : "";
  return (
    <div className="h-screen">
      <Header status={status} />
      {/* <main className="pt-[60px] pb-[60px] h-screen flex flex-col"> */}
      <main className="pb-[60px] h-screen flex flex-col">
        <Routes>
          <Route
            path="/login"
            element={<AuthRoute element={<Login />} isPrivate={false} />}
          />
          <Route
            path="/"
            element={<AuthRoute element={<Splash />} isPrivate={false} />}
          />
          {/* route yang di authentikasi */}
          <Route
            path="/dashboard"
            element={<AuthRoute element={<Dashboard />} isPrivate={true} />}
          />
          <Route
            path="/pos"
            element={<AuthRoute element={<Pos />} isPrivate={true} />}
          />
          <Route
            path="/penjualan"
            element={<AuthRoute element={<Penjualan />} isPrivate={true} />}
          />
          <Route
            path="/settings"
            element={<AuthRoute element={<Setting />} isPrivate={true} />}
          />
          <Route
            path="/barang"
            element={<AuthRoute element={<Barang />} isPrivate={true} />}
          />
          <Route
            path="/hutang"
            element={<AuthRoute element={<Hutang />} isPrivate={true} />}
          />
          <Route
            path="/draft-penjualan"
            element={
              <AuthRoute element={<DraftPenjualan />} isPrivate={true} />
            }
          />
          <Route
            path="/laporan"
            element={<AuthRoute element={<Laporan />} isPrivate={true} />}
          />
        </Routes>
      </main>
      <Footer status={status} />
    </div>
  );
}

export default App;
