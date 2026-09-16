import React from "react";

export const Tag = ({ status }) => {
  const map = {
    aktif: ["bg-green-100 text-green-700", "Aktif"],
    selesai: ["bg-blue-100 text-blue-700", "Selesai"],
    draft: ["bg-slate-200 text-slate-600", "Draft"],
    pending: ["bg-yellow-100 text-yellow-800", "Menunggu"],
    approved: ["bg-green-100 text-green-700", "Disetujui"],
    rejected: ["bg-red-100 text-red-700", "Ditolak"],
    baru: ["bg-yellow-100 text-yellow-800", "Baru"],
    diproses: ["bg-blue-100 text-blue-700", "Diproses"],
    selesaifb: ["bg-green-100 text-green-700", "Selesai"],
  };
  const [cls, label] = map[status] || ["bg-slate-200 text-slate-600", status];
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
};

export const Btn = ({ children, variant = "green", size = "md", className = "", ...props }) => {
  const base =
    "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { md: "px-4 py-2.5 text-sm", sm: "px-3 py-1.5 text-xs" };
  const variants = {
    green: "bg-green-700 text-white hover:bg-green-800",
    outline: "bg-white text-green-700 border border-green-700 hover:bg-green-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Field = ({ label, children }) => (
  <div className="mb-3.5">
    <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
    {children}
  </div>
);

export const inputCls =
  "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600";

export const Panel = ({ title, action, children, className = "" }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        {title && <h3 className="font-bold text-slate-800 text-[15px]">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export const StatCard = ({ icon, value, label }) => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-700 mb-2.5">{icon}</div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-xs text-slate-400">{label}</div>
  </div>
);

export const Empty = ({ icon, text, action }) => (
  <div className="text-center py-10 px-4 text-slate-400">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-sm">{text}</div>
    {action}
  </div>
);

export const Toast = ({ message }) =>
  message ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-3 rounded-xl text-sm shadow-xl z-50 max-w-[90vw] text-center">
      {message}
    </div>
  ) : null;
