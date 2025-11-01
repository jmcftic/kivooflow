import React from "react";

const Help: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1f1f1f] text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-6 text-center shadow-lg backdrop-blur-md">
        <h1 className="text-2xl font-bold text-[#FFF100]">Ayuda</h1>
        <p className="mt-3 text-sm text-white/80">
          Este módulo estará próximamente disponible.
        </p>
      </div>
    </div>
  );
};

export default Help;

