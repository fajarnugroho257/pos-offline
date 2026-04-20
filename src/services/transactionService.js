import { dbPromise } from "./db";

// simpan transaksi
export const saveTransaction = async (data) => {
  const db = await dbPromise;
  return db.add("transactions", data);
};

// ambil semua transaksi
export const getTransactions = async () => {
  const db = await dbPromise;
  return db.getAll("transactions");
};

// hapus transaksi (optional)
export const deleteTransaction = async (id) => {
  const db = await dbPromise;
  return db.delete("transactions", id);
};
