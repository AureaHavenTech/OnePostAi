"use client";

import React, { useState, useEffect } from "react";

export default function CheckDeployPage() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("/api/check-deploy")
      .then(r => r.json())
      .then(d => setStatus(d.theme))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#c9a84c] to-[#e8c97a] flex items-center justify-center shadow-xl shadow-[#c9a84c]/20 mb-4">
          <span className="text-2xl font-bold text-[#1a1614]">O</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1a1614]">OnePost AI</h1>
        <p className="text-[#6b5a5e] mt-2">Premium content agency. One subscription.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <a href="/login" className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#1a1614] text-[#faf7f2] hover:bg-[#2d2824] transition-all">
            Start 3-Day Trial
          </a>
        </div>
      </div>
    </div>
  );
}