import { openDB } from "idb";

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
    console.log("aa");
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
  return alldatas.find((item) => item.trans_st == "draft");
};
