import React, { useState, useRef } from "react";
import {
  Camera,
  MapPin,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Pencil,
  LogOut,
  Star,
  Trophy,
  Target,
} from "lucide-react";
import { Panel, StatCard, Tag, Btn, Empty, inputCls } from "../components/ui.jsx";
import { levelInfo, fmtDate, initials, haversine } from "../lib/data.js";

function QuestCard({ q, extra, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex gap-3 items-start ${onClick ? "cursor-pointer hover:border-green-200" : ""}`}
    >
      <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-xl flex-shrink-0">
        {q.icon}
      </div>
      <div className="min-w-0 flex-1">
        <b className="text-[13.5px] block">{q.title}</b>
        <span className="text-[11.5px] text-slate-400">{extra.top}</span>
        <div className="inline-block bg-yellow-50 text-yellow-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1.5">
          {extra.badge}
        </div>
      </div>
    </div>
  );
}

export function WargaBeranda({ user, db, openQuest, hasReportedToday }) {
  const lvl = levelInfo(user.xp);
  const myReports = db.reports.filter((r) => r.userId === user.id).sort((a, b) => b.ts - a.ts);
  const activeWithProgress = db.quests.filter(
    (q) => q.status === "aktif" && myReports.some((r) => r.questId === q.id)
  );
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-2">
        <StatCard
          icon={<Star size={16} />}
          value={(user.xp || 0).toLocaleString("id-ID")}
          label="XP Kamu"
        />
        <StatCard icon={<Trophy size={16} />} value={lvl.level} label="Level" />
        <StatCard
          icon={<Target size={16} />}
          value={activeWithProgress.length}
          label="Misi Diikuti"
        />
        <StatCard
          icon={<CheckCircle2 size={16} />}
          value={myReports.filter((r) => r.status === "approved").length}
          label="Laporan Disetujui"
        />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5">
        <div className="flex justify-between items-baseline mb-2">
          <b className="text-2xl text-green-700">{(user.xp || 0).toLocaleString("id-ID")} XP</b>
          <span className="bg-green-50 text-green-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Level {lvl.level}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden max-w-md">
          <div className="h-full bg-green-600 rounded-full" style={{ width: lvl.pct + "%" }} />
        </div>
        <small className="text-[11px] text-slate-400">
          {lvl.need - lvl.into} XP lagi menuju Level {lvl.level + 1}
        </small>
      </div>

      <Panel title="Misi Aktif Kamu">
        {activeWithProgress.length === 0 ? (
          <Empty icon="🎯" text="Kamu belum ikut misi apa pun." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeWithProgress.map((q) => {
              const myR = myReports.filter((r) => r.questId === q.id);
              const already = hasReportedToday(q.id, user.id);
              return (
                <QuestCard
                  key={q.id}
                  q={q}
                  onClick={() => openQuest(q.id)}
                  extra={{
                    top: `${myR.length} laporan terkirim${already ? " · ✅ hari ini sudah lapor" : ""}`,
                    badge: `+${q.xpBase} XP / laporan`,
                  }}
                />
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Aktivitas Terbaru">
        {myReports.slice(0, 4).length === 0 ? (
          <Empty icon="🕑" text="Belum ada aktivitas." />
        ) : (
          myReports.slice(0, 4).map((r) => {
            const q = db.quests.find((x) => x.id === r.questId);
            return (
              <div
                key={r.id}
                className="flex gap-2.5 items-start py-2.5 border-b border-slate-50 last:border-0 text-[13px]"
              >
                <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center text-sm flex-shrink-0">
                  {r.status === "approved" ? "✅" : r.status === "rejected" ? "❌" : "⏳"}
                </div>
                <div>
                  Laporan untuk <b>{q ? q.title : "-"}</b>{" "}
                  {r.status === "approved"
                    ? `disetujui, +${r.xpAwarded} XP`
                    : r.status === "rejected"
                      ? "ditolak"
                      : "menunggu verifikasi"}{" "}
                  · <span className="text-slate-400">{fmtDate(r.ts)}</span>
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </>
  );
}

export function WargaMisi({ user, db, openQuest, hasReportedToday }) {
  const [filter, setFilter] = useState("");
  const [cat, setCat] = useState("");
  let list = db.quests.filter((q) => q.status === "aktif");
  if (cat) list = list.filter((q) => q.category === cat);
  if (filter) list = list.filter((q) => q.title.toLowerCase().includes(filter.toLowerCase()));
  const cats = [...new Set(db.quests.map((q) => q.category))];
  return (
    <Panel title="Daftar Misi Aktif">
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <input
          className={inputCls + " sm:flex-1 sm:max-w-xs"}
          placeholder="Cari misi..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          className={inputCls + " sm:w-auto"}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {cats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {list.length === 0 ? (
        <Empty icon="🔍" text="Tidak ada misi ditemukan." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {list.map((q) => {
            const already = hasReportedToday(q.id, user.id);
            return (
              <QuestCard
                key={q.id}
                q={q}
                onClick={() => openQuest(q.id)}
                extra={{
                  top: (
                    <>
                      <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10.5px] font-bold mr-1">
                        {q.category}
                      </span>
                      radius {q.radius} m
                    </>
                  ),
                  badge: `+${q.xpBase} XP${already ? " · ✅ sudah lapor hari ini" : ""}`,
                }}
              />
            );
          })}
        </div>
      )}
    </Panel>
  );
}

export function WargaQuestDetail({ user, db, questId, back, submitReport, hasReportedToday }) {
  const q = db.quests.find((x) => x.id === questId);
  const [draft, setDraft] = useState({});
  const [gpsBusy, setGpsBusy] = useState(false);
  const fileRef = useRef(null);

  if (!q)
    return (
      <Panel>
        <button onClick={back} className="text-sm text-green-700 font-bold mb-2">
          ← Kembali
        </button>
        <p>Misi tidak ditemukan.</p>
      </Panel>
    );

  const myR = db.reports
    .filter((r) => r.userId === user.id && r.questId === q.id)
    .sort((a, b) => b.ts - a.ts);
  const already = hasReportedToday(q.id, user.id);
  const valid = draft.distance !== undefined ? draft.distance <= q.radius : null;

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 480;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        setDraft((d) => ({ ...d, photo: canvas.toDataURL("image/jpeg", 0.6) }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  const checkGPS = () => {
    setGpsBusy(true);
    if (!navigator.geolocation) {
      setGpsBusy(false);
      setDraft((d) => ({ ...d, gpsError: "no-geo" }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = Math.round(
          haversine(pos.coords.latitude, pos.coords.longitude, q.loc.lat, q.loc.lng)
        );
        setDraft((d) => ({
          ...d,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          distance: dist,
          gpsError: null,
        }));
        setGpsBusy(false);
      },
      () => {
        setGpsBusy(false);
        setDraft((d) => ({ ...d, gpsError: "denied" }));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  const simulateLocation = (mode) => {
    let lat, lng;
    if (mode === "valid") {
      lat = q.loc.lat + (Math.random() - 0.5) * 0.0006;
      lng = q.loc.lng + (Math.random() - 0.5) * 0.0006;
    } else {
      lat = q.loc.lat + 0.02 + Math.random() * 0.01;
      lng = q.loc.lng + 0.02;
    }
    const dist = Math.round(haversine(lat, lng, q.loc.lat, q.loc.lng));
    setDraft((d) => ({ ...d, lat, lng, distance: dist, gpsError: null }));
  };
  const send = () => {
    if (!draft.photo || draft.distance === undefined || draft.distance > q.radius) return;
    submitReport(q, draft);
    setDraft({});
  };

  const infoCards = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      <div className="bg-white rounded-xl p-3.5 border border-slate-100">
        <span className="text-[11px] text-slate-400 block">Status</span>
        <Tag status={q.status} />
      </div>
      <div className="bg-white rounded-xl p-3.5 border border-slate-100">
        <span className="text-[11px] text-slate-400 block">Kategori</span>
        <b className="text-[13px]">{q.category}</b>
      </div>
      <div className="bg-white rounded-xl p-3.5 border border-slate-100">
        <span className="text-[11px] text-slate-400 block">Periode</span>
        <b className="text-[13px]">
          {q.start} – {q.end}
        </b>
      </div>
      <div className="bg-white rounded-xl p-3.5 border border-slate-100">
        <span className="text-[11px] text-slate-400 block">Radius Wajib</span>
        <b className="text-[13px]">{q.radius} meter</b>
      </div>
    </div>
  );

  return (
    <div>
      <button onClick={back} className="text-[12px] text-green-700 font-bold mb-2">
        ← Kembali ke Daftar Misi
      </button>
      <h2 className="font-bold text-slate-800 text-xl mb-1">
        {q.icon} {q.title}
      </h2>
      <p className="text-[13px] text-slate-500 mb-5 max-w-2xl">{q.desc}</p>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <div>
          {infoCards}
          <Panel title="Lokasi Proyek">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-2.5">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-green-300 bg-green-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                  📍
                </div>
              </div>
              <small className="text-slate-400 text-xs">
                Foto laporan wajib diambil dalam radius <b>{q.radius} meter</b> dari titik lokasi
                proyek.
              </small>
            </div>
          </Panel>
          <Panel title="Riwayat Laporanmu di Misi Ini">
            {myR.length === 0 ? (
              <Empty icon="📄" text="Belum ada laporan." />
            ) : (
              myR.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-2.5 py-2.5 border-b border-slate-100 last:border-0"
                >
                  {r.photo ? (
                    <img src={r.photo} className="w-11 h-11 rounded-lg object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100" />
                  )}
                  <div className="flex-1">
                    <b className="text-[12.5px] block">{fmtDate(r.ts)}</b>
                    <span className="text-[11px] text-slate-400">{r.distance} m dari lokasi</span>
                  </div>
                  <Tag status={r.status} />
                </div>
              ))
            )}
          </Panel>
        </div>

        <div>
          {already ? (
            <Panel>
              <div className="text-center">
                <div className="text-lg mb-1">
                  ✅ <b>Kamu sudah mengirim laporan hari ini.</b>
                </div>
                <small className="text-slate-400">Kembali lagi besok untuk melapor lagi.</small>
              </div>
            </Panel>
          ) : (
            <Panel title="Kirim Laporan Foto Hari Ini">
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-[12.5px] cursor-pointer"
              >
                {draft.photo ? (
                  <>
                    <img src={draft.photo} className="max-h-36 mx-auto rounded-lg mb-2" />
                    <span>Ganti foto</span>
                  </>
                ) : (
                  <>
                    <Camera className="mx-auto mb-1.5" size={28} />
                    <span>Klik untuk ambil / unggah foto bukti</span>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhoto}
              />

              <div className="mt-3">
                {draft.distance === undefined ? (
                  <>
                    <Btn variant="outline" className="w-full" disabled={gpsBusy} onClick={checkGPS}>
                      {gpsBusy ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <MapPin size={15} />
                      )}{" "}
                      {gpsBusy ? "Mengambil lokasi..." : "Cek Lokasi GPS Saya"}
                    </Btn>
                    {draft.gpsError && (
                      <div className="mt-2.5 text-[12px] text-slate-500">
                        ⚠️ Browser menolak/tidak mendukung akses GPS. Gunakan simulasi untuk mencoba
                        alur validasi, atau izinkan akses lokasi di pengaturan browser:
                        <div className="flex gap-2 mt-2">
                          <Btn
                            size="sm"
                            variant="green"
                            className="flex-1"
                            onClick={() => simulateLocation("valid")}
                          >
                            Simulasi: Di Lokasi
                          </Btn>
                          <Btn
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => simulateLocation("invalid")}
                          >
                            Simulasi: Di Luar Radius
                          </Btn>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      className={`rounded-xl px-3.5 py-2.5 text-[13px] font-semibold flex items-center gap-2 ${
                        valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {valid ? <CheckCircle2 size={15} /> : <XCircle size={15} />} Jarak kamu{" "}
                      {draft.distance} m dari lokasi —{" "}
                      {valid ? "dalam radius, valid!" : `di luar radius (${q.radius} m).`}
                    </div>
                    <button
                      className="text-xs text-green-700 font-semibold mt-2"
                      onClick={() => setDraft((d) => ({ ...d, distance: undefined }))}
                    >
                      Cek Ulang Lokasi
                    </button>
                  </>
                )}
              </div>
              <Btn
                variant="green"
                className="w-full mt-3"
                disabled={!draft.photo || draft.distance === undefined || draft.distance > q.radius}
                onClick={send}
              >
                <Send size={15} /> Kirim Laporan
              </Btn>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

export function WargaReward({ user, db, redeem }) {
  const myRedemptions = db.redemptions
    .filter((rd) => rd.userId === user.id)
    .slice()
    .reverse();
  return (
    <>
      <Panel
        title="Katalog Reward"
        action={
          <span className="text-[12.5px] text-slate-500">
            Kamu punya <b className="text-green-700">{(user.xp || 0).toLocaleString("id-ID")} XP</b>
          </span>
        }
      >
        <div className="grid sm:grid-cols-2 gap-3.5">
          {db.rewards.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-xl flex-shrink-0">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <b className="text-[13.5px] block">{r.name}</b>
                <span className="text-[11.5px] text-slate-400">
                  {r.xpCost.toLocaleString("id-ID")} XP · stok {r.stock}
                </span>
              </div>
              <Btn
                size="sm"
                variant={user.xp >= r.xpCost && r.stock > 0 ? "green" : "outline"}
                disabled={user.xp < r.xpCost || r.stock <= 0}
                onClick={() => redeem(r.id)}
              >
                Tukar
              </Btn>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Riwayat Penukaran">
        {myRedemptions.length === 0 ? (
          <Empty icon="🎁" text="Belum ada penukaran." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-slate-400 text-[11px] uppercase border-b border-slate-100">
                  <th className="py-2 pr-3">Reward</th>
                  <th className="py-2 pr-3">Tanggal</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {myRedemptions.map((rd) => {
                  const r = db.rewards.find((x) => x.id === rd.rewardId);
                  return (
                    <tr key={rd.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 pr-3">{r ? `${r.icon} ${r.name}` : "-"}</td>
                      <td className="py-2.5 pr-3">{fmtDate(rd.ts)}</td>
                      <td className="py-2.5">
                        <Tag status={rd.status === "diambil" ? "approved" : "pending"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

export function WargaProfil({ user, onLogout, sendFeedback }) {
  const lvl = levelInfo(user.xp);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  return (
    <>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5 max-w-md">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
            {initials(user.name)}
          </div>
          <div>
            <b className="text-[16px] block">{user.name}</b>
            <span className="text-[12.5px] text-slate-400">Warga · Level {lvl.level}</span>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3.5">
          <div className="h-full bg-green-600 rounded-full" style={{ width: lvl.pct + "%" }} />
        </div>
        <small className="text-[11px] text-slate-400">
          {(user.xp || 0).toLocaleString("id-ID")} XP total
        </small>
      </div>

      <Panel title="Kirim Kritik & Saran ke Admin" className="max-w-md">
        {showForm ? (
          <>
            <textarea
              className={inputCls}
              rows={3}
              placeholder="Tulis masukanmu..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <Btn
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowForm(false);
                  setText("");
                }}
              >
                Batal
              </Btn>
              <Btn
                variant="green"
                size="sm"
                className="flex-1"
                onClick={() => {
                  sendFeedback(text);
                  setShowForm(false);
                  setText("");
                }}
              >
                Kirim
              </Btn>
            </div>
          </>
        ) : (
          <Btn variant="outline" className="w-full" onClick={() => setShowForm(true)}>
            <Pencil size={14} />
            Tulis Masukan
          </Btn>
        )}
      </Panel>
      <div className="max-w-md">
        <Btn variant="outline" className="w-full" onClick={onLogout}>
          <LogOut size={14} />
          Keluar
        </Btn>
      </div>
    </>
  );
}
