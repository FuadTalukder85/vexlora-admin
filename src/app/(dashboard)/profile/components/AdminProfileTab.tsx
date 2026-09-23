"use client";

import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ImageUploadDropzone } from "@/components/ui/ImageUploadDropzone";
import { User } from "@/types/auth";
import { toast } from "sonner";

import { useAdminStore } from "@/stores/useAdminStore";

interface AdminProfileTabProps {
  user: User & { phone?: string | null; image?: string | null; isSuperAdmin?: boolean };
  onUpdateProfile: (data: { name?: string; phone?: string | null }) => Promise<any>;
  onUploadAvatar: (file: File) => Promise<any>;
  onRemoveAvatar: () => Promise<any>;
  isUpdating: boolean;
}

export const AdminProfileTab: React.FC<AdminProfileTabProps> = ({
  user,
  onUpdateProfile,
  onUploadAvatar,
  onRemoveAvatar,
  isUpdating,
}) => {
  const { user: storeUser } = useAdminStore();
  const [adminName, setAdminName] = useState(user.name || "");
  const [adminPhone, setAdminPhone] = useState(user.phone || "");

  const customRoleName =
    user.assignedRoles?.[0] ||
    user.userRoles?.[0]?.role?.name ||
    storeUser?.assignedRoles?.[0] ||
    storeUser?.userRoles?.[0]?.role?.name;

  useEffect(() => {
    setAdminName(user.name || "");
    setAdminPhone(user.phone || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      await onUpdateProfile({
        name: adminName.trim(),
        phone: adminPhone.trim() || null,
      });
      toast.success("Admin profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Administrator Avatar" subtitle="Stored securely on Cloudinary and displayed across audit logs">
        <ImageUploadDropzone
          label="Admin Avatar"
          aspectRatio="square"
          currentUrl={user.image || user.avatar}
          helperText="Square image • Max 5MB"
          onUpload={onUploadAvatar}
          onRemove={onRemoveAvatar}
        />
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Admin Identity & Contact" subtitle="Administrative personal credentials">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              placeholder="e.g. Master Administrator"
              required
            />
            <Input
              label="Contact Phone"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Official Admin Email"
                value={user.email}
                disabled
                helperText="Administrator email is locked to system identity"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary tracking-wide block mb-1">
                Authorization Tier & Delegated Role
              </label>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {user.isSuperAdmin ? (
                  <Badge variant="success" className="font-bold">SUPER ADMIN</Badge>
                ) : (
                  <>
                    <Badge variant="neutral" className="text-xs font-semibold">
                      Platform Admin
                    </Badge>
                    {customRoleName && (
                      <Badge variant="primary" className="text-xs font-bold uppercase bg-primary text-white">
                        Role: {customRoleName}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={isUpdating}>
            <Save className="w-4 h-4" />
            Save Admin Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
