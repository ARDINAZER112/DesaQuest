import React, { useState, useEffect } from "react";
import { Loader2, LayoutDashboard, MessageSquare, Users, Gift, PlusCircle, ClipboardList, CheckCircle2, Trophy, Home, Target, User } from "lucide-react";

import { storageGet, storageSet, onStorageChange } from "./lib/storage.js";
import { DB_KEY, SESSION_KEY, uid, seedDB, todayKey } from "./lib/data.js";
import { Toast } from "./components/ui.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import Shell from "./components/Shell.jsx";
import { AdminDashboard, AdminUsers, AdminRewards } from "./pages/AdminPages.jsx";
import { PetugasDashboard, QuestForm, QuestList, VerifikasiLaporan } from "./pages/PetugasPages.jsx";
import {
  WargaBeranda,
  WargaMisi,
  WargaQuestDetail,
  WargaReward,
  WargaProfil,
} from "./pages/WargaPages.jsx";

const wargaNav = [
  ["beranda", Home, "Beranda"],
  ["misi", Target, "Misi"],
  ["reward", Gift, "Reward"],
  ["profil", User, "Profil"],
];

export default function App() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null); // {userId}
  const [authError, setAuthError] = useState("");
  const [page, setPage] = useState("dashboard");
  const [selectedQuestId, setSelectedQuestId] = useState(null);
  const [editingQuestId, setEditingQuestId] = useState(null); // null | 'new' | id
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  // boot: load db + session from localStorage
  useEffect(() => {
    let d = storageGet(DB_KEY);
    if (!d) {
      d = seedDB();
      storageSet(DB_KEY, d);
    }
    setDb(d);
    const sess = storageGet(SESSION_KEY);
    if (sess && sess.userId && d.users.find((u) => u.id === sess.userId)) {
      setSession(sess);
      const u = d.users.find((u) => u.id === sess.userId);
      setPage(u.role === "warga" ? "beranda" : "dashboard");
    }
    setLoading(false);
  }, []);

  // keep multiple tabs of the same browser in sync automatically
  useEffect(() => {
    const off = onStorageChange(DB_KEY, (fresh) => {
      if (fresh) setDb(fresh);
    });
    return off;
  }, []);

  const persist = (next) => {
    setDb(next);
    storageSet(DB_KEY, next);
  };
  const mutate = (fn) => {
    const next = JSON.parse(JSON.stringify(db));
    fn(next);
    persist(next);
  };

  const user = db && session ? db.users.find((u) => u.id === session.userId) : null;

  /* ---------- auth actions ---------- */
  const doLogin = async (username, password) => {
    const u = db.users.find((x) => x.username.toLowerCase() === username.toLowerCase());
    if (!u || u.password !== password) {
      setAuthError("Username atau kata sandi salah.");
      return;
    }
    const sess = { userId: u.id };
    setSession(sess);
    storageSet(SESSION_KEY, sess);
    setPage(u.role === "warga" ? "beranda" : "dashboard");
  };
  const doRegister = async (name, username, password) => {
    if (db.users.some((x) => x.username.toLowerCase() === username.toLowerCase())) {
      setAuthError("Username sudah digunakan, coba yang lain.");
      return false;
    }
    const newUser = { id: uid("w"), name, username, password, role: "warga", xp: 0 };
    mutate((d) => d.users.push(newUser));
    const sess = { userId: newUser.id };
    setSession(sess);
    storageSet(SESSION_KEY, sess);
    setPage("beranda");
    showToast("Pendaftaran berhasil! Selamat datang di DesaQuest.");
    return true;
  };
  const logout = () => {
    setSession(null);
    storageSet(SESSION_KEY, null);
    setPage("dashboard");
    setSelectedQuestId(null);
    setEditingQuestId(null);
  };

  /* ---------- shared helpers ---------- */
  const hasReportedToday = (questId, userId) => {
    const today = todayKey(Date.now());
    return db.reports.some((r) => r.questId === questId && r.userId === userId && todayKey(r.ts) === today);
  };

  /* ---------- petugas actions ---------- */
  const saveQuest = (data) => {
    if (!data.id) {
      mutate((d) => d.quests.push({ ...data, id: uid("q"), createdBy: session.userId }));
      showToast("Quest baru berhasil dibuat!");
    } else {
      mutate((d) => {
        const q = d.quests.find((x) => x.id === data.id);
        Object.assign(q, data);
      });
      showToast("Quest berhasil diperbarui.");
    }
    setEditingQuestId(null);
    setPage("daftar-quest");
  };
  const deleteQuest = (id) => {
    if (!window.confirm("Hapus quest ini beserta seluruh laporannya?")) return;
    mutate((d) => {
      d.quests = d.quests.filter((q) => q.id !== id);
      d.reports = d.reports.filter((r) => r.questId !== id);
    });
    showToast("Quest dihapus.");
  };
  const verifyReport = (reportId, action, xpInput) => {
    let msg = "";
    mutate((d) => {
      const r = d.reports.find((x) => x.id === reportId);
      if (!r) return;
      if (action === "approve") {
        const q = d.quests.find((x) => x.id === r.questId);
        const xp = parseInt(xpInput, 10) || q.xpBase;
        r.status = "approved";
        r.xpAwarded = xp;
        const u = d.users.find((x) => x.id === r.userId);
        if (u) u.xp = (u.xp || 0) + xp;
        msg = `Laporan disetujui, +${xp} XP untuk ${u ? u.name : "warga"}.`;
      } else {
        r.status = "rejected";
        r.xpAwarded = 0;
        msg = "Laporan ditolak.";
      }
    });
    showToast(msg);
  };

  /* ---------- warga actions ---------- */
  const submitReport = (quest, draft) => {
    const report = {
      id: uid("r"),
      questId: quest.id,
      userId: session.userId,
      photo: draft.photo,
      ts: Date.now(),
      lat: draft.lat,
      lng: draft.lng,
      distance: draft.distance,
      status: "pending",
      xpAwarded: 0,
    };
    mutate((d) => d.reports.push(report));
    showToast("Laporan terkirim! Menunggu verifikasi petugas.");
  };
  const redeemReward = (rewardId) => {
    const rw = db.rewards.find((r) => r.id === rewardId);
    if (!rw || rw.stock <= 0) {
      showToast("Stok reward habis.");
      return;
    }
    if ((user.xp || 0) < rw.xpCost) {
      showToast("XP kamu belum cukup untuk menukar reward ini.");
      return;
    }
    if (!window.confirm(`Tukar ${rw.xpCost} XP dengan "${rw.name}"?`)) return;
    mutate((d) => {
      const u = d.users.find((x) => x.id === session.userId);
      const r = d.rewards.find((x) => x.id === rewardId);
      u.xp -= r.xpCost;
      r.stock -= 1;
      d.redemptions.push({ id: uid("rd"), userId: u.id, rewardId: r.id, ts: Date.now(), status: "menunggu" });
    });
    showToast("Berhasil ditukar! Ambil reward di kantor desa.");
  };

  /* ---------- admin actions ---------- */
  const deleteUser = (id) => {
    if (!window.confirm("Hapus pengguna ini?")) return;
    mutate((d) => {
      d.users = d.users.filter((u) => u.id !== id);
    });
  };
  const addPetugas = (name, username, password) => {
    if (db.users.some((x) => x.username.toLowerCase() === username.toLowerCase())) {
      showToast("Username sudah digunakan.");
      return;
    }
    mutate((d) => d.users.push({ id: uid("p"), name, username, password, role: "petugas" }));
    showToast("Akun petugas baru berhasil dibuat.");
  };
  const saveReward = (editing, data) => {
    if (editing === "new") mutate((d) => d.rewards.push({ ...data, id: uid("rw") }));
    else
      mutate((d) => {
        Object.assign(
          d.rewards.find((r) => r.id === editing),
          data
        );
      });
    showToast("Reward tersimpan.");
  };
  const deleteReward = (id) => {
    if (!window.confirm("Hapus reward ini?")) return;
    mutate((d) => {
      d.rewards = d.rewards.filter((r) => r.id !== id);
    });
  };
  const fulfillRedemption = (id) => {
    mutate((d) => {
      const rd = d.redemptions.find((x) => x.id === id);
      if (rd) rd.status = "diambil";
    });
    showToast("Ditandai sudah diambil.");
  };

  /* ---------- render guards ---------- */
  if (loading || !db) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin" size={18} />
        Memuat DesaQuest...
      </div>
    );
  }

  if (!session || !user) {
    return (
      <>
        <AuthScreen
          onLogin={doLogin}
          onRegister={doRegister}
          quests={db.quests}
          wargaCount={db.users.filter((u) => u.role === "warga").length}
          reportCount={db.reports.length}
          authError={authError}
          setAuthError={setAuthError}
        />
        <Toast message={toast} />
      </>
    );
  }

  /* ---------- ADMIN ---------- */
  if (user.role === "admin") {
    const nav = [
      ["dashboard", LayoutDashboard, "Dashboard"],
      ["pengguna", Users, "Kelola Pengguna"],
      ["reward-admin", Gift, "Kelola Reward"],
    ];
    const titles = {
      dashboard: ["Dashboard Admin", "Ringkasan sistem DesaQuest"],
      pengguna: ["Kelola Pengguna", "Daftar seluruh pengguna sistem"],
      "reward-admin": ["Kelola Reward", "Atur katalog reward & penukaran"],
    };
    const [t, s] = titles[page] || titles.dashboard;
    return (
      <>
        <Shell brandRole="Admin" user={user} navItems={nav} page={page} setPage={setPage} onLogout={logout} title={t} subtitle={s}>
          {page === "pengguna" && <AdminUsers db={db} deleteUser={deleteUser} addPetugas={addPetugas} />}
          {page === "reward-admin" && <AdminRewards db={db} saveReward={saveReward} deleteReward={deleteReward} fulfillRedemption={fulfillRedemption} />}
          {(page === "dashboard" || !["pengguna", "reward-admin"].includes(page)) && <AdminDashboard db={db} />}
        </Shell>
        <Toast message={toast} />
      </>
    );
  }

  /* ---------- PETUGAS ---------- */
  if (user.role === "petugas") {
    const nav = [
      ["dashboard", LayoutDashboard, "Dashboard"],
      ["buat-quest", PlusCircle, "Buat Quest Baru"],
      ["daftar-quest", ClipboardList, "Daftar Quest"],
      ["verifikasi", CheckCircle2, "Verifikasi Laporan"],
    ];
    const titles = {
      dashboard: ["Dashboard Petugas", "Kelola quest pembangunan desa & pantau partisipasi warga"],
      "buat-quest": ["Buat Quest Baru", "Tentukan tugas pemantauan untuk warga"],
      "daftar-quest": ["Daftar Quest", "Semua quest yang pernah dibuat"],
      verifikasi: ["Verifikasi Laporan", "Tinjau laporan foto dari warga"],
    };
    const [t, s] = titles[page] || titles.dashboard;
    return (
      <>
        <Shell
          brandRole="Petugas Desa"
          user={user}
          navItems={nav}
          page={page}
          setPage={(p) => {
            setPage(p);
            if (p === "buat-quest") setEditingQuestId("new");
          }}
          onLogout={logout}
          title={t}
          subtitle={s}
        >
          {page === "buat-quest" && (
            <QuestForm
              quest={editingQuestId && editingQuestId !== "new" ? db.quests.find((q) => q.id === editingQuestId) : null}
              onSave={saveQuest}
              onCancel={() => {
                setEditingQuestId(null);
                setPage("daftar-quest");
              }}
            />
          )}
          {page === "daftar-quest" && (
            <QuestList
              db={db}
              onEdit={(id) => {
                setEditingQuestId(id);
                setPage("buat-quest");
              }}
              onDelete={deleteQuest}
            />
          )}
          {page === "verifikasi" && <VerifikasiLaporan db={db} verify={verifyReport} />}
          {(page === "dashboard" || !["buat-quest", "daftar-quest", "verifikasi", "leaderboard-p"].includes(page)) && <PetugasDashboard db={db} />}
        </Shell>
        <Toast message={toast} />
      </>
    );
  }

  /* ---------- WARGA ---------- */
  const wPage = ["beranda", "misi", "misi-detail", "reward", "profil"].includes(page) ? page : "beranda";
  const wSelectedQuest = wPage === "misi-detail" ? db.quests.find((q) => q.id === selectedQuestId) : null;
  const wTitles = {
    beranda: [`Halo, ${user.name.split(" ")[0]} 👋`, "Terus pantau & bangun desamu."],
    misi: ["Daftar Misi", "Semua misi pemantauan yang bisa kamu ikuti"],
    "misi-detail": ["Detail Misi", wSelectedQuest ? wSelectedQuest.title : ""],
    reward: ["Tukar Reward", `Kamu punya ${(user.xp || 0).toLocaleString("id-ID")} XP`],
    profil: ["Profil", "Profil dan aktivitas kamu"],
  };
  const [wTitle, wSubtitle] = wTitles[wPage];
  return (
    <>
      <Shell
        brandRole="Warga Desa"
        user={user}
        navItems={wargaNav}
        page={wPage === "misi-detail" ? "misi" : wPage}
        setPage={(p) => {
          setPage(p);
          setSelectedQuestId(null);
        }}
        onLogout={logout}
        title={wTitle}
        subtitle={wSubtitle}
      >
        {wPage === "beranda" && (
          <WargaBeranda
            user={user}
            db={db}
            openQuest={(id) => {
              setSelectedQuestId(id);
              setPage("misi-detail");
            }}
            hasReportedToday={hasReportedToday}
          />
        )}
        {wPage === "misi" && (
          <WargaMisi
            user={user}
            db={db}
            openQuest={(id) => {
              setSelectedQuestId(id);
              setPage("misi-detail");
            }}
            hasReportedToday={hasReportedToday}
          />
        )}
        {wPage === "misi-detail" && (
          <WargaQuestDetail
            user={user}
            db={db}
            questId={selectedQuestId}
            back={() => setPage("misi")}
            submitReport={submitReport}
            hasReportedToday={hasReportedToday}
          />
        )}
        {wPage === "reward" && <WargaReward user={user} db={db} redeem={redeemReward} />}
        {wPage === "profil" && <WargaProfil user={user} onLogout={logout} />}
      </Shell>
      <Toast message={toast} />
    </>
  );
}
