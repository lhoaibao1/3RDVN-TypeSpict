import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN");
}

export function generateLeadCode() {
  const date = new Date();
  const ymd =
    String(date.getFullYear()).slice(2) +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `LD${ymd}${rand}`;
}

export function generateUid(sequence: number) {
  const now = new Date();
  const ym =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, "0");
  return `UID${ym}${String(sequence).padStart(4, "0")}`;
}

export function generateEmployeeCode(sequence: number) {
  const now = new Date();
  const y = String(now.getFullYear()).slice(2);
  return `RD${y}${String(sequence).padStart(4, "0")}`;
}
