const PrintBluethootPos = async (
  cart_data,
  pusat,
  cabang,
  tagihan,
  valInputBayar,
  kembalian,
  valInputPelanggan
) => {
  //
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

  try {
    // ESC/POS Commands
    // const ESC = "\x1B";
    // const fontSmall = `${ESC}!\x01`; // Ukuran font kecil
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

    let pelanggan = (valInputPelanggan ?? "").toString().padStart(16, " ");
    content += `| Pelanggan  ${pelanggan}|\n`;
    content += "=============================" + "\n";

    printDatas.forEach((item) => {
      let nama = item.barang_nama;
      let cart_diskon = item.barang_st_diskon === "yes" ? " (Gros)" : "";
      let qty = String(item.cart_qty).padStart(3, " "); // lebar tetap
      let harga = `${formatRupiah(item.barang_harga_jual)}`.padEnd(8, " ");
      let subTotal = `${formatRupiah(item.cart_subtotal)}`.padStart(10, " ");
      content += `| ${nama}${cart_diskon}\n| ${harga} | ${qty} | ${subTotal}|\n`;
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
    console.log(content);
    // const printData = new TextEncoder().encode(content);
    const printData = new TextEncoder().encode(content + "\n\n");

    // Hubungkan ke perangkat Bluetooth
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
    });

    console.log("Perangkat ditemukan:", device.name);

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(
      "000018f0-0000-1000-8000-00805f9b34fb"
    );
    const characteristic = await service.getCharacteristic(
      "00002af1-0000-1000-8000-00805f9b34fb"
    );

    // Kirim data ke printer
    // await characteristic.writeValue(printData);
    // mambagi dua
    function chunkArrayBuffer(buffer, chunkSize) {
      let chunks = [];
      for (let i = 0; i < buffer.byteLength; i += chunkSize) {
        chunks.push(buffer.slice(i, i + chunkSize));
      }
      return chunks;
    }

    async function sendDataInChunks(characteristic, data) {
      const chunkSize = 64; // Kurangi ukuran chunk
      const chunks = chunkArrayBuffer(data, chunkSize);

      for (const chunk of chunks) {
        // await characteristic.writeValue(chunk);
        await characteristic.writeValueWithoutResponse(chunk);
        await new Promise((resolve) => setTimeout(resolve, 80)); // Tambah jeda waktu
      }
    }
    // end membagi dua
    await sendDataInChunks(characteristic, printData);

    console.log("Nota berhasil dicetak yaa.");
  } catch (error) {
    console.error("Gagal mencetak nota:", error);
  }
};

export default PrintBluethootPos;
