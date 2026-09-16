import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck, UserPlus, Loader2 } from "lucide-react";
import { Btn, Field, inputCls } from "./ui.jsx";

export default function AuthScreen({ onLogin, onRegister, quests, wargaCount, reportCount, authError, setAuthError }) {
  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [reg, setReg] = useState({ name: "", username: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const submitLogin = async () => {
    setAuthError("");
    if (!login.username.trim() || !login.password) {
      setAuthError("Isi username dan kata sandi.");
      return;
    }
    setBusy(true);
    await onLogin(login.username.trim(), login.password);
    setBusy(false);
  };

  const submitRegister = async () => {
    setAuthError("");
    if (!reg.name.trim() || !reg.username.trim() || !reg.password) {
      setAuthError("Lengkapi semua data.");
      return;
    }
    if (reg.password.length < 6) {
      setAuthError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (reg.password !== reg.confirm) {
      setAuthError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setBusy(true);
    const ok = await onRegister(reg.name.trim(), reg.username.trim(), reg.password);
    setBusy(false);
    if (ok) setMode("login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{ background: "linear-gradient(160deg,#2E7D32 0%,#245F27 45%,#1B4A1E 100%)" }}
    >
      <div className="bg-white rounded-[24px] max-w-5xl w-full grid md:grid-cols-2 overflow-hidden shadow-2xl">
        {/* Hero panel — hidden on mobile */}
        <div
          className="hidden md:flex flex-col justify-between p-9 text-white"
          style={{ background: "linear-gradient(150deg,#66BB6A,#2E7D32 60%)" }}
        >
          <div>
            <div className="flex items-center gap-2.5 font-bold text-[15px] mb-9">
              <div className="w-11 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg"><img src="/assets/images/PantauDesa-Tranparan.png" /></div>
              PantauDesa
            </div>
            <h1 className="text-[28px] leading-tight font-bold mb-3">
              Mari bersama<br />membangun desa.
            </h1>
            <p className="text-[14px] leading-relaxed opacity-90">
              PantauDesa adalah platform untuk membangun desa bersama. Petugas membuat quest pembangunan, warga memantau langsung di lapangan lewat foto & GPS, lalu
              mengumpulkan XP untuk ditukarkan ke reward nyata.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap mt-6">
            <div className="bg-white/15 rounded-xl px-3.5 py-2.5 min-w-[92px]">
              <b className="block text-lg">{quests.filter((q) => q.status === "aktif").length}</b>
              <span className="text-[11px] opacity-85">Quest Aktif</span>
            </div>
            <div className="bg-white/15 rounded-xl px-3.5 py-2.5 min-w-[92px]">
              <b className="block text-lg">{reportCount}</b>
              <span className="text-[11px] opacity-85">Laporan Warga</span>
            </div>
            <div className="bg-white/15 rounded-xl px-3.5 py-2.5 min-w-[92px]">
              <b className="block text-lg">{wargaCount}</b>
              <span className="text-[11px] opacity-85">Warga Terlibat</span>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-7 sm:p-9">
          <div className="flex items-center gap-2 font-bold text-green-700 mb-1 md:hidden">
            <span className="w-11 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg"><img src="/assets/images/PantauDesa-Tranparan.png" /></span> PantauDesa
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">
            {mode === "login" ? "Masuk ke Akun" : "Daftar sebagai Warga"}
          </h2>
          <p className="text-[13px] text-slate-400 mb-5">
            {mode === "login" ? "Gunakan akun admin, petugas, atau warga untuk masuk." : "Ikuti quest pembangunan desa & kumpulkan XP."}
          </p>

          {authError && (
            <div className="bg-red-50 text-red-600 text-[13px] font-medium rounded-lg px-3.5 py-2.5 mb-4">{authError}</div>
          )}

          {mode === "login" ? (
            <>
              <Field label="Username">
                <input
                  className={inputCls}
                  value={login.username}
                  onChange={(e) => setLogin({ ...login, username: e.target.value })}
                  placeholder="Nama Anda"
                />
              </Field>
              <Field label="Kata Sandi">
                <div className="relative">
                  <input
                    className={inputCls + " pr-10"}
                    type={showPw ? "text" : "password"}
                    value={login.password}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === "Enter" && submitLogin()}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
              <Btn variant="green" className="w-full mt-1" onClick={submitLogin} disabled={busy}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Masuk
              </Btn>

              <button
                className="text-xs text-green-700 font-semibold mt-4 underline decoration-dotted"
                onClick={() => setShowDemo(!showDemo)}
              >
                {showDemo ? "Sembunyikan" : "Lihat"} akun demo untuk uji coba
              </button>
              {showDemo && (
                <div className="mt-2.5 bg-slate-50 rounded-lg p-3 text-[12px] text-slate-500 space-y-1">
                  <div><b>Admin</b> — admin / admin123</div>
                  <div><b>Petugas</b> — rudi / petugas123</div>
                  <div><b>Warga</b> — budi / warga123</div>
                </div>
              )}

              <div className="text-center text-[13px] text-slate-500 mt-6 pt-5 border-t border-slate-100">
                Warga belum punya akun?{" "}
                <button
                  className="text-green-700 font-bold"
                  onClick={() => {
                    setMode("register");
                    setAuthError("");
                  }}
                >
                  Daftar di sini
                </button>
              </div>
            </>
          ) : (
            <>
              <Field label="Nama Lengkap">
                <input className={inputCls} value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} placeholder="Nama sesuai KTP" />
              </Field>
              <Field label="Username">
                <input className={inputCls} value={reg.username} onChange={(e) => setReg({ ...reg, username: e.target.value })} placeholder="Buat username unik" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kata Sandi">
                  <input className={inputCls} type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} placeholder="Min. 6 karakter" />
                </Field>
                <Field label="Konfirmasi">
                  <input className={inputCls} type="password" value={reg.confirm} onChange={(e) => setReg({ ...reg, confirm: e.target.value })} placeholder="Ulangi sandi" />
                </Field>
              </div>
              <Btn variant="green" className="w-full mt-1" onClick={submitRegister} disabled={busy}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Daftar sebagai Warga
              </Btn>
              <div className="text-center text-[13px] text-slate-500 mt-6 pt-5 border-t border-slate-100">
                Sudah punya akun?{" "}
                <button
                  className="text-green-700 font-bold"
                  onClick={() => {
                    setMode("login");
                    setAuthError("");
                  }}
                >
                  Masuk di sini
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
