import React from "react";
import { useQZTray } from "./QZTrayContext";

const ThermalPrinter = () => {
  const { isConnected, printer, findPrinter } = useQZTray();

  const printThermal = async () => {
    try {
      if (!printer) {
        alert("Printer belum dipilih!");
        return;
      }

      // Data dummy sebagai pengganti respons API Laravel
      const printData = {
        options: {
          printer: "POS-58", // Nama printer
          "font-size": 12, // Ukuran font
        },
        content: `
          Terima Kasih!
        `,
      };

      console.log("Print Data (Dummy):", printData);
      const qz = window.qz; // Akses qz dari window
      // Konfigurasi printer
      const config = qz.configs.create(printData.options.printer, {
        fontSize: printData.options["font-size"], // Sesuaikan opsi lainnya
      });

      // Data yang akan dicetak
      const data = [
        {
          type: "raw",
          format: "plain",
          data: printData.content,
        },
      ];

      // Kirim perintah cetak
      await qz.print(config, data);
      console.log("Print job successful");
      alert("Print job sent successfully!");
    } catch (error) {
      console.error("Error during printing:", error);
      alert("Error during printing: " + error.message);
    }
  };

  return (
    <div>
      <h1>Thermal Printer</h1>
      <button onClick={() => findPrinter("POS-58")}>Find Printer</button>
      <button onClick={printThermal} disabled={!isConnected}>
        Print Thermal
      </button>
      <div>
        <h2>Status:</h2>
        <p>QZ Tray: {isConnected ? "Connected" : "Disconnected"}</p>
        <p>Printer: {printer || "Not Found"}</p>
      </div>
    </div>
  );
};

export default ThermalPrinter;

// content: `
//           =================================
//           Nama Toko       : Toko Dummy
//           Tanggal Transaksi: 2025-01-23
//           =================================
//           Produk           Qty     Harga
//           ---------------------------------
//           Produk A          2     Rp 20,000
//           Produk B          1     Rp 15,000
//           ---------------------------------
//           Total                   Rp 55,000
//           =================================
//           Terima Kasih!
//         `,
