"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface BroadcastAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (data: { target: "ALL" | "VENDORS" | "CUSTOMERS"; title: string; message: string; type: string }) => Promise<any>;
}

export const BroadcastAnnouncementModal: React.FC<BroadcastAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onBroadcast,
}) => {
  const [target, setTarget] = useState<"ALL" | "VENDORS" | "CUSTOMERS">("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("SYSTEM_ANNOUNCEMENT");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Broadcast message is required");
      return;
    }

    try {
      setIsBroadcasting(true);
      await onBroadcast({
        target,
        title: title.trim() || "System Announcement",
        message: message.trim(),
        type,
      });
      toast.success(`Broadcast successfully sent to ${target.toLowerCase()}!`);
      onClose();
      setTitle("");
      setMessage("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send broadcast notification");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Marketplace Broadcast Announcement">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-primary block mb-1">Target Audience *</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as any)}
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-primary focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Platform Users (Vendors & Customers)</option>
            <option value="VENDORS">All Active Vendors Only</option>
            <option value="CUSTOMERS">All Customers Only</option>
          </select>
        </div>

        <Input
          label="Announcement Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Scheduled System Maintenance Notice"
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-primary tracking-wide">Message Content *</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write the full broadcast announcement text..."
            className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-sm text-primary focus:outline-none focus:border-primary resize-none"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isBroadcasting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isBroadcasting}>
            <Send className="w-4 h-4" />
            Broadcast Now
          </Button>
        </div>
      </form>
    </Modal>
  );
};
