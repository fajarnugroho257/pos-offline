import React, { createContext, useContext, useEffect, useState } from "react";

const QZTrayContext = createContext();

export const useQZTray = () => useContext(QZTrayContext);

export const QZTrayProvider = ({ children }) => {
  const stPrinter = localStorage.getItem("printSelected");
  const [isConnected, setIsConnected] = useState(false);
  const [printer, setPrinter] = useState(null);

  useEffect(() => {
    if (stPrinter === "bluethoot") {
      return;
    }
    const qz = window.qz; // Akses qz dari window

    // Inisialisasi QZ Tray
    const initializeQZ = () => {
      qz.api.setPromiseType((resolver) => new Promise(resolver));
      qz.api.setSha256Type((data) =>
        crypto.subtle
          .digest("SHA-256", new TextEncoder().encode(data))
          .then((hash) =>
            Array.from(new Uint8Array(hash))
              .map((byte) => byte.toString(16).padStart(2, "0"))
              .join("")
          )
      );
    };

    // Hubungkan ke QZ Tray
    const connectQZ = async () => {
      try {
        await qz.websocket.connect();
        try {
          const printerName = "POS-58";
          const foundPrinter = await qz.printers.find(printerName);
          setPrinter(foundPrinter);
          console.log("Printer ditemukan:", foundPrinter);
        } catch (err) {
          console.error("Printer tidak ditemukan:", err);
          alert("Printer tidak ditemukan!");
        }
        console.log("QZ Tray connected");
        setIsConnected(true);
      } catch (err) {
        console.error("Failed to connect to QZ Tray", err);
      }
    };

    initializeQZ();
    connectQZ();

    // Putuskan koneksi saat aplikasi ditutup
    return () => {
      if (qz.websocket.isActive()) {
        qz.websocket.disconnect();
        console.log("QZ Tray disconnected");
      }
    };
  }, []);

  const findPrinter = async (printerName) => {
    const qz = window.qz; // Akses qz dari window
    try {
      const foundPrinter = await qz.printers.find(printerName);
      setPrinter(foundPrinter);
      console.log("Printer ditemukan:", foundPrinter);
    } catch (err) {
      console.error("Printer tidak ditemukan:", err);
      alert("Printer tidak ditemukan!");
    }
  };

  return (
    <QZTrayContext.Provider value={{ isConnected, printer, findPrinter }}>
      {children}
    </QZTrayContext.Provider>
  );
};
