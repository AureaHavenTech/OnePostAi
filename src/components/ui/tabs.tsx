"use client";

import React, { createContext, useContext, useState } from "react";

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export function Tabs({ children, defaultValue, className = "", onValueChange: externalOnChange }: { children: React.ReactNode; defaultValue: string; className?: string; onValueChange?: (val: string) => void }) {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (val: string) => {
    setValue(val);
    externalOnChange?.(val);
  };
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex space-x-1 border-b border-slate-800 ${className}`}>{children}</div>;
}

export function TabsTrigger({ children, value, className = "" }: { children: React.ReactNode; value: string; className?: string }) {
  const ctx = useContext(TabsContext);
  const isActive = ctx?.value === value;
  return (
    <button
      onClick={() => ctx?.onValueChange(value)}
      className={`px-4 py-2 text-sm font-medium transition-colors ${
        isActive ? "text-brand-400 border-b-2 border-brand-500" : "text-slate-400 hover:text-slate-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className = "" }: { children: React.ReactNode; value: string; className?: string }) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div className={`pt-4 ${className}`}>{children}</div>;
}