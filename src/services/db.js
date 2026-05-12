import { openDB } from "idb";
import { getCabangId } from "../utilities/Auth";
import dayjs from "dayjs";
import { swalError } from "../utilities/Swal";

const cabangId = getCabangId();
export const dbPromise = openDB("pos-db", 2, {
  upgrade(db) {
    // tabel transaksi
    if (!db.objectStoreNames.contains("transactions")) {
      const store = db.createObjectStore("transactions", {
        keyPath: "id",
        autoIncrement: true,
      });

      store.createIndex("cart_id", "cart_id", { unique: true });
    }

    // tabel produk (optional cache)
    if (!db.objectStoreNames.contains("barangMaster")) {
      db.createObjectStore("barangMaster", {
        keyPath: "id",
      });
    }
  },
});

export const saveOrUpdateTransaction = async (data) => {
  const db = await dbPromise;
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");
  const index = store.index("cart_id");

  const existing = await index.get(data.cart_id);

  if (existing) {
    // ✅ update (pakai id lama)
    const updated = {
      ...existing,
      ...data,
      id: existing.id,
    };
    await store.put(updated);
  } else {
    // ✅ insert baru
    await store.add(data);
  }

  await tx.done;
};

export const updatePartialByCartId = async (cart_id, payload) => {
  const db = await dbPromise;
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");
  const index = store.index("cart_id");

  const existing = await index.get(cart_id);

  if (!existing) return;

  const updated = {
    ...existing,
    ...payload,
  };

  await store.put(updated);
  await tx.done;
};

export const findBarang = async (barang_cabang_id) => {
  const db = await dbPromise;
  const alldatas = await db.getAll("barangMaster");
  return alldatas.find((item) => item.barang_cabang_id == barang_cabang_id);
};

export const findCartDraft = async () => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");
  return alldatas.find(
    (item) => item.cart_st === "draft" && item.cabang_id === cabangId,
  );
};

export const listPembayaran = async (cart_st) => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");

  const filtered = alldatas.filter((item) => {
    return item.cart_st === cart_st && item.cabang_id === cabangId;
  });
  return filtered;
};

export const listPembayaranUploadSt = async () => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");

  const filtered = alldatas.filter((item) => {
    return item.cart_st === "yes" && item.upload_st === "no";
  });
  return filtered;
};

export const listAllTransaction = async () => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");

  const filtered = alldatas.filter((item) => {
    return item.upload_st === "no";
  });
  return filtered;
};

export const deleteDataTransactionOffline = async (status) => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");

  const filtered = alldatas.filter((item) => {
    return item.cart_st === status && item.upload_st === "yes";
  });
  if (filtered.length === 0) {
    return {
      success: false,
      message:
        "Silahkan untuk mengupload data terlebih dahulu untuk menghapus data..!",
    };
  }
  // hapus
  let jmlDeleted = 0;
  for (const item of filtered) {
    console.log(item.id);
    const success = await db.delete("transactions", item.id);
    if (success) {
      jmlDeleted++;
    }
  }
  return {
    success: true,
    deleted: jmlDeleted,
    message: "Data berhasil dihapus sebanyak",
  };
};

export const findCartBooking = async () => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");

  const filtered = alldatas.filter((item) => {
    return item.cart_st === "booking" && item.cabang_id === cabangId;
  });
  return filtered;
};

export const findCartHutang = async () => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");

  const filtered = alldatas.filter((item) => {
    return item.cart_st === "hutang" && item.cabang_id === cabangId;
  });
  return filtered;
};

export const findCartById = async (cart_id) => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");
  return alldatas.find((item) => item.cart_id == cart_id);
};

export const deleteById = async (cart_id) => {
  const db = await dbPromise;
  const alldatas = await db.getAll("transactions");
  const detail = alldatas.find((item) => item.cart_id == cart_id);
  const success = await db.delete("transactions", detail.id);
  return {
    status: true,
    message: "Data berhasil dihapus",
  };
};

export const updateHutangLunas = async (cart_id) => {
  const db = await dbPromise;
  const tx = db.transaction("transactions", "readwrite");
  const store = tx.objectStore("transactions");
  const index = store.index("cart_id");

  const existing = await index.get(cart_id);
  if (existing.upload_st === "yes") {
    swalError(
      "Opps..!",
      "Data ini sudah terupload ke server, Silahkan untuk melakukan pelunasan di server.",
    );
    return;
  }
  if (!existing) return;
  const detailCicilan = existing.detail_cicilan ?? [];
  const detailTagihan = existing.draft_uang_sisa;
  // total cicilan
  const totalCicilan = detailCicilan.reduce(
    (sum, row) => sum + (parseFloat(row.cicilan) || 0),
    0,
  );
  if (totalCicilan < detailTagihan) {
    return {
      success: false,
      message: "Maaf uang cicilan belum lunas",
    };
  }
  // update
  const kembalian = totalCicilan - detailTagihan;

  const trans_bayar =
    parseInt(totalCicilan) + parseInt(existing.draft_uang_muka);
  const payload = {
    trans_total: existing.ttlBayar,
    trans_date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    trans_bayar: trans_bayar.toString(),
    trans_kembalian: kembalian,
    trans_pelanggan: existing.trans_pelanggan,
    trans_st: "yes",
    cart_st: "yes",
  };

  const updated = {
    ...existing,
    ...payload,
  };

  await store.put(updated);
  await tx.done;
  return {
    success: true,
    message: "Data berhasil dilunasi",
  };
};
