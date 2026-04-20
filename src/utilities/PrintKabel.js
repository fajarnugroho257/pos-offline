function padCenter(text, width, padChar = " ") {
  let padding = width - text.length;
  let padStart = Math.floor(padding / 2);
  let padEnd = padding - padStart;
  return padChar.repeat(padStart) + text + padChar.repeat(padEnd);
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(angka)
    .replace(/\s+/g, "");
}

const PrintKabel = async (
  cart_data,
  pusat,
  cabang,
  tagihan,
  valInputBayar,
  kembalian
) => {
  try {
    // start content
    const printDatas = cart_data;
    // Format tabel dengan padding
    const pusat_nama = pusat;
    const cabang_nama = cabang;
    //
    const now = new Date();
    //
    let content = padCenter(pusat_nama, 30, " ") + "\n";
    content += padCenter(cabang_nama, 30, " ") + "\n";
    content += padCenter(`${now.toLocaleString()}`, 30, " ") + "\n";
    content += "=============================" + "\n";
    content += "| Item     |Qty| Price       |" + "\n";
    content += "=============================" + "\n";

    printDatas.forEach((item) => {
      let nama = item.cart_nama;
      let cart_diskon = item.cart_diskon === "yes" ? " (Grosir)" : "";
      let qty = String(item.cart_qty).padStart(1, " ");
      let harga = `${formatRupiah(item.cart_harga_jual)}`.padEnd(8, " ");
      let subTotal = `${formatRupiah(item.cart_subtotal)}`.padStart(11, " ");
      content += `| ${nama}${cart_diskon}\n| ${harga} | ${qty} | ${subTotal} |\n`;
    });

    content += "=============================" + "\n";
    content +=
      "| Total".padEnd(13, " ") +
      `${formatRupiah(tagihan)}`.padStart(15, " ") +
      " |\n";
    content += "-----------------------------" + "\n";
    content +=
      "| Bayar".padEnd(13, " ") +
      `${formatRupiah(valInputBayar)}`.padStart(15, " ") +
      " |\n";
    content +=
      "| Kembalian".padEnd(13, " ") +
      `${formatRupiah(kembalian)}`.padStart(15, " ") +
      " |\n";
    content += "=============================" + "\n";
    content += padCenter("Terimakasih", 30, " ") + "\n\n";
    // end content
    // Data dummy sebagai pengganti respons API Laravel
    const printData = {
      options: {
        printer: "POS-58", // Nama printer
        "font-size": 11, // Ukuran font
      },
      content: content,
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

export default PrintKabel;
