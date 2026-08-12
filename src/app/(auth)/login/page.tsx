"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Check UID exists (simplified - real system would call API)
  async function handleUidSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!uid.trim()) {
      setError("Vui lòng nhập UID / Username");
      return;
    }
    setLoading(true);
    // In production: call /api/auth/check-uid
    // For now go to step 2
    setUserName(uid.trim());
    setStep(2);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      uid: uid.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("UID hoặc mật khẩu không đúng");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 text-white text-2xl font-bold mb-4">
              3R
            </div>
            <h1 className="text-2xl font-bold text-gray-900">3RD Fintech CRM</h1>
            <p className="text-gray-500 text-sm mt-1">Fintech CRM — TypeScript Edition</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleUidSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  UID / Username / Email
                </label>
                <Input
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="UID25080001 hoặc admin"
                  autoFocus
                  autoComplete="username"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Đang kiểm tra..." : "Tiếp tục"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-800">
                  Xin chào, <span className="font-semibold">{userName}</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mật khẩu
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoFocus
                  autoComplete="current-password"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep(1);
                    setPassword("");
                    setError("");
                  }}
                >
                  Quay lại
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-400">
            Demo: <code className="bg-gray-100 px-1 rounded">UID25080001</code> /{" "}
            <code className="bg-gray-100 px-1 rounded">Admin@123456</code>
          </div>
        </div>
      </div>
    </div>
  );
}
