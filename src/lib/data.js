export const DB_KEY = "desaquest_db_v1";
export const SESSION_KEY = "desaquest_session_v1";

export function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

export function seedDB() {
  const base = { lat: -6.8974, lng: 112.0649 }; // Desa Sukamaju, Tuban (fiktif)
  const off = (dl, dg) => ({ lat: base.lat + dl, lng: base.lng + dg });
  const now = Date.now();
  const days = (n) => now - n * 86400000;
  return {
    users: [
      { id: "admin1", name: "Admin Desa", username: "admin", password: "admin123", role: "admin" },
      { id: "petugas1", name: "Rudi Pratama", username: "rudi", password: "petugas123", role: "petugas" },
      { id: "w1", name: "Budi Santoso", username: "budi", password: "warga123", role: "warga", xp: 2450 },
      { id: "w2", name: "Siti Aminah", username: "siti", password: "warga123", role: "warga", xp: 1980 },
      { id: "w3", name: "Andi Wijaya", username: "andi", password: "warga123", role: "warga", xp: 1650 },
      { id: "w4", name: "Rina Marlina", username: "rina", password: "warga123", role: "warga", xp: 1250 },
      { id: "w5", name: "Dedi Kurniawan", username: "dedi", password: "warga123", role: "warga", xp: 980 },
    ],
    quests: [
      { id: "q1", title: "Pembangunan Jalan RT 03", desc: "Pantau kondisi pembangunan jalan di RT 03. Ambil foto kondisi terkini di lapangan.", category: "Jalan", icon: "🛣️", loc: off(0, 0), radius: 100, xpBase: 100, xpBonus: 20, start: "2024-09-01", end: "2024-09-30", status: "aktif", createdBy: "petugas1" },
      { id: "q2", title: "Renovasi Balai Desa", desc: "Pantau progres renovasi balai desa Sukamaju.", category: "Fasilitas Umum", icon: "🏛️", loc: off(0.003, -0.002), radius: 80, xpBase: 100, xpBonus: 10, start: "2024-09-01", end: "2024-09-25", status: "aktif", createdBy: "petugas1" },
      { id: "q3", title: "Pembangunan Drainase RT 01", desc: "Pantau kondisi pembangunan drainase / saluran air di RT 01.", category: "Drainase", icon: "💧", loc: off(-0.004, 0.003), radius: 100, xpBase: 90, xpBonus: 15, start: "2024-09-01", end: "2024-09-25", status: "aktif", createdBy: "petugas1" },
      { id: "q4", title: "Pembangunan Jembatan RT 02", desc: "Pembangunan jembatan penghubung RT 02 telah selesai.", category: "Jembatan", icon: "🌉", loc: off(0.006, 0.004), radius: 100, xpBase: 120, xpBonus: 20, start: "2024-08-25", end: "2024-09-15", status: "selesai", createdBy: "petugas1" },
      { id: "q5", title: "Rehab Posyandu", desc: "Rencana rehabilitasi gedung posyandu desa.", category: "Fasilitas Umum", icon: "🏥", loc: off(-0.002, -0.005), radius: 100, xpBase: 80, xpBonus: 10, start: "2024-09-10", end: "2024-09-20", status: "draft", createdBy: "petugas1" },
    ],
    reports: [
      { id: "r1", questId: "q1", userId: "w1", photo: null, ts: days(2), lat: base.lat + 0.0002, lng: base.lng + 0.0001, distance: 22, status: "approved", xpAwarded: 100 },
      { id: "r2", questId: "q1", userId: "w2", photo: null, ts: days(1), lat: base.lat + 0.0003, lng: base.lng + 0.0002, distance: 31, status: "approved", xpAwarded: 100 },
      { id: "r3", questId: "q3", userId: "w3", photo: null, ts: days(0.4), lat: base.lat - 0.0038, lng: base.lng + 0.0031, distance: 45, status: "pending", xpAwarded: 0 },
    ],
    rewards: [
      { id: "rw1", name: "Minyak Goreng 1 Liter", icon: "🧴", xpCost: 500, stock: 20 },
      { id: "rw2", name: "Beras 5 Kg", icon: "🌾", xpCost: 800, stock: 15 },
      { id: "rw3", name: "Voucher Pulsa Rp25.000", icon: "📱", xpCost: 300, stock: 30 },
      { id: "rw4", name: "Paket Sembako", icon: "🛒", xpCost: 1200, stock: 10 },
    ],
    redemptions: [],
    feedback: [
      { id: "f1", userId: "w4", message: "Kalau bisa quest pembangunan jalan di RT 05 juga ditambahkan, jalannya rusak parah.", ts: days(3), status: "baru" },
    ],
  };
}

export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function levelInfo(xp) {
  const perLevel = 500;
  const level = Math.floor((xp || 0) / perLevel) + 1;
  const into = (xp || 0) % perLevel;
  return { level, into, need: perLevel, pct: Math.round((into / perLevel) * 100) };
}

export function fmtDate(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

export function todayKey(ts) {
  return new Date(ts).toISOString().slice(0, 10);
}

export function initials(name) {
  return (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
