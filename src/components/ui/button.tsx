import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-600 border border-slate-700",
    outline: "bg-transparent text-slate-100 hover:bg-slate-900 border border-slate-800 hover:border-slate-700",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-lg shadow-rose-600/20",
    accent: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-lg shadow-accent-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-1.5 text-xs",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
