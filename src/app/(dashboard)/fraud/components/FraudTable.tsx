"use client";

import React, { useState } from "react";
import { Eye, CheckCircle2, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PaginateTable, ColumnDef } from "@/components/ui/PaginateTable";
import { TableActions, TableActionButton } from "@/components/ui/TableActions";
import { formatDate } from "@/lib/utils";
import { FraudLog } from "@/types/fraud";
import { FraudSkeleton } from "./FraudSkeleton";
import { toast } from "sonner";

const mockFraudLogs: FraudLog[] = [
  {
    id: "f-1",
    entityType: "ORDER",
    entityId: "ORD-9021",
    riskScore: 88,
    riskLevel: "HIGH",
    flagReason: "Multiple rapid card checkout attempts with mismatched billing addresses",
    status: "INVESTIGATING",
    detectedAt: "2026-09-17T12:00:00Z",
  },
  {
    id: "f-2",
    entityType: "REVIEW",
    entityId: "rev-492",
    riskScore: 95,
    riskLevel: "CRITICAL",
    flagReason: "Automated bot review submission from blacklisted IP cluster",
    status: "BLOCKED",
    detectedAt: "2026-09-16T14:20:00Z",
  },
  {
    id: "f-3",
    entityType: "SELLER",
    entityId: "v-4",
    riskScore: 65,
    riskLevel: "MEDIUM",
    flagReason: "Sudden spike in high-value orders followed by refund disputes",
    status: "RESOLVED",
    detectedAt: "2026-09-10T09:15:00Z",
  },
];

export const FraudTable: React.FC = () => {
  const [logs, setLogs] = useState<FraudLog[]>(mockFraudLogs);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading] = useState(false);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.flagReason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "ALL" ||
      l.riskLevel === activeTab ||
      l.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const columns: ColumnDef<FraudLog>[] = [
    {
      header: "SL",
      cell: (_, idx) => (
        <span className="font-semibold text-slate-500 text-xs">{idx + 1}</span>
      ),
    },
    {
      header: "Entity & Flag Reason",
      cell: (l) => (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-primary font-mono">{l.entityId}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-secondary">
              {l.entityType}
            </span>
          </div>
          <p className="text-[11px] text-secondary mt-0.5 max-w-md">{l.flagReason}</p>
        </div>
      ),
    },
    {
      header: "Risk Score",
      cell: (l) => (
        <span
          className={
            l.riskScore > 80
              ? "font-bold text-rose-600 text-sm"
              : l.riskScore > 50
                ? "font-bold text-amber-600 text-sm"
                : "font-bold text-emerald-600 text-sm"
          }
        >
          {l.riskScore}/100
        </span>
      ),
    },
    {
      header: "Risk Level",
      cell: (l) => (
        <Badge variant={l.riskLevel === "CRITICAL" || l.riskLevel === "HIGH" ? "danger" : "warning"}>
          {l.riskLevel}
        </Badge>
      ),
    },
    {
      header: "Status",
      cell: (l) => <Badge variant="neutral">{l.status}</Badge>,
    },
    {
      header: "Detected",
      cell: (l) => <span className="text-primary">{formatDate(l.detectedAt)}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (l) => (
        <TableActions>
          <TableActionButton onClick={() => toast.info(`Investigating entity ${l.entityId}`)} title="Inspect Case">
            <Eye className="w-4 h-4" />
          </TableActionButton>
          {l.status === "INVESTIGATING" && (
            <TableActionButton
              hoverVariant="emerald"
              onClick={() => {
                setLogs((prev) =>
                  prev.map((item) => (item.id === l.id ? { ...item, status: "RESOLVED" } : item))
                );
                toast.success(`Risk flag for ${l.entityId} resolved`);
              }}
              title="Resolve Risk Alert"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </TableActionButton>
          )}
        </TableActions>
      ),
    },
  ];

  if (isLoading) {
    return <FraudSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full space-y-4">
      <PaginateTable
        data={filteredLogs}
        columns={columns}
        keyExtractor={(l) => l.id}
        defaultPageSize={20}
        className="flex-1 min-h-0"
        headerContent={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Risk / Status Tabs */}
            <div className="border-b border-slate-200/80 pb-2 flex items-center gap-6 overflow-x-auto">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "INVESTIGATING", "RESOLVED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs font-bold transition-all border-b-2 pb-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "ALL" ? "All Alerts" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entity ID or flag reason..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        }
      />
    </div>
  );
};
