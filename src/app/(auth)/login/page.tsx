"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAdminStore } from "@/stores/useAdminStore";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, fetchProfile, isAuthenticated, isInitialChecking, user } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!isInitialChecking && isAuthenticated && user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      router.replace("/");
    }
  }, [isAuthenticated, isInitialChecking, user, router]);

  if (isInitialChecking || (isAuthenticated && user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN"))) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your admin email and password");
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user.name || "Administrator"}!`);
      router.replace("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed. Invalid credentials.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-primary to-slate-950">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-highlight to-rose-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-900/30">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-primary tracking-tight">Vexlora Control Center</h1>
          <p className="text-xs text-secondary font-medium">
            Authorized administrative access only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Admin Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            placeholder="admin@vexlora.com"
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full h-11 text-xs font-bold"
            isLoading={isLoading}
          >
            Access Admin Portal
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
