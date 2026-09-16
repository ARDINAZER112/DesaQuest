// Lapisan penyimpanan sederhana berbasis localStorage.
// Cocok untuk prototipe/demo tanpa backend. Data hanya tersimpan di browser
// pengguna masing-masing (tidak sinkron antar perangkat).
// Untuk produksi sungguhan, ganti modul ini dengan panggilan API ke backend
// asli (mis. Supabase, Firebase, atau REST API + database) agar data admin,
// petugas, dan warga benar-benar tersimpan di server bersama.

export function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("storageGet error:", e);
    return null;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("storageSet error:", e);
    return false;
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("storageRemove error:", e);
  }
}

// Memanggil callback setiap kali key berubah di TAB LAIN pada browser yang sama
// (event 'storage' tidak terpicu di tab yang melakukan perubahan itu sendiri).
export function onStorageChange(key, callback) {
  const handler = (e) => {
    if (e.key === key) {
      try {
        callback(e.newValue ? JSON.parse(e.newValue) : null);
      } catch (err) {
        console.error("onStorageChange parse error:", err);
      }
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
