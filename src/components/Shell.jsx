import React, { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { initials } from "../lib/data.js";

export default function Shell({ brandRole, user, navItems, page, setPage, onLogout, title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {open && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setOpen(false)} />}
      <div
        className={`fixed md:sticky top-0 h-screen w-64 text-white flex flex-col p-4 z-40 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
        style={{ background: "linear-gradient(180deg,#2E7D32,#245F27)" }}
      >
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5 font-bold text-[15px]">
            <div className="w-11 h-12 rounded-xl bg-white/20 flex items-center justify-center text-lg"><img src="/assets/images/PantauDesa-Tranparan.png" /></div> PantauDesa
          </div>
          <button className="md:hidden text-white/80" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-2.5 mb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {initials(user.name)}
          </div>
          <div className="min-w-0">
            <b className="block text-[13px] truncate">{user.name}</b>
            <span className="text-[11px] opacity-75">{brandRole}</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1">
          {navItems.map(([key, Icon, label]) => (
            <li key={key}>
              <button
                onClick={() => {
                  setPage(key);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-lg text-[13.5px] transition ${page === key ? "bg-white text-green-700 font-bold" : "text-white/85 hover:bg-white/10"
                  }`}
              >
                <Icon size={16} /> {label}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onLogout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-[13px] px-3 py-2.5 rounded-lg mt-2">
          <LogOut size={15} /> Keluar
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-white border-b border-slate-200 px-5 sm:px-7 py-4 flex items-center gap-3 sticky top-0 z-20">
          <button className="md:hidden text-slate-600" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-[17px] sm:text-[19px] leading-tight">{title}</h2>
            <div className="text-[12px] text-slate-400">{subtitle}</div>
          </div>
        </div>
        <div className="p-5 sm:p-7">{children}</div>
      </div>
    </div>
  );
}
