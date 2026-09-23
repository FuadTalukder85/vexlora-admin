"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronRight, ChevronLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { Permission } from "@/types/rbac";
import { Badge } from "@/components/ui/Badge";

interface DualPanePermissionMatrixProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onChange: (selected: string[]) => void;
  readOnly?: boolean;
}

export const DualPanePermissionMatrix: React.FC<DualPanePermissionMatrixProps> = ({
  permissions,
  selectedPermissions,
  onChange,
  readOnly = false,
}) => {
  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");

  // Explicit Selection states
  const [selectedUnassignedKeys, setSelectedUnassignedKeys] = useState<string[]>([]);
  const [selectedAssignedKeys, setSelectedAssignedKeys] = useState<string[]>([]);

  // Split permissions into Unassigned (Left) and Assigned (Right)
  const { unassignedList, assignedList } = useMemo(() => {
    const assignedSet = new Set(selectedPermissions);
    const unassigned: Permission[] = [];
    const assigned: Permission[] = [];

    for (const perm of permissions) {
      if (assignedSet.has(perm.key)) {
        assigned.push(perm);
      } else {
        unassigned.push(perm);
      }
    }

    return { unassignedList: unassigned, assignedList: assigned };
  }, [permissions, selectedPermissions]);

  // Filter lists based on search terms
  const filteredUnassigned = useMemo(() => {
    if (!unassignedSearch.trim()) return unassignedList;
    const query = unassignedSearch.toLowerCase();
    return unassignedList.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.key.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [unassignedList, unassignedSearch]);

  const filteredAssigned = useMemo(() => {
    if (!assignedSearch.trim()) return assignedList;
    const query = assignedSearch.toLowerCase();
    return assignedList.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.key.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [assignedList, assignedSearch]);

  // -------------------------------------------------------------
  // Selection Handlers (Left / Unassigned)
  // -------------------------------------------------------------
  const handleToggleSelectUnassigned = (key: string) => {
    if (readOnly) return;
    setSelectedUnassignedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllUnassigned = () => {
    if (readOnly) return;
    const visibleKeys = filteredUnassigned.map((p) => p.key);
    const allSelected = visibleKeys.length > 0 && visibleKeys.every((k) => selectedUnassignedKeys.includes(k));
    if (allSelected) {
      setSelectedUnassignedKeys((prev) => prev.filter((k) => !visibleKeys.includes(k)));
    } else {
      setSelectedUnassignedKeys((prev) => Array.from(new Set([...prev, ...visibleKeys])));
    }
  };

  // -------------------------------------------------------------
  // Selection Handlers (Right / Assigned)
  // -------------------------------------------------------------
  const handleToggleSelectAssigned = (key: string) => {
    if (readOnly) return;
    setSelectedAssignedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAllAssigned = () => {
    if (readOnly) return;
    const visibleKeys = filteredAssigned.map((p) => p.key);
    const allSelected = visibleKeys.length > 0 && visibleKeys.every((k) => selectedAssignedKeys.includes(k));
    if (allSelected) {
      setSelectedAssignedKeys((prev) => prev.filter((k) => !visibleKeys.includes(k)));
    } else {
      setSelectedAssignedKeys((prev) => Array.from(new Set([...prev, ...visibleKeys])));
    }
  };

  // -------------------------------------------------------------
  // Center Toggle Movement Actions
  // -------------------------------------------------------------
  const handleMoveLeftToRight = () => {
    if (readOnly || selectedUnassignedKeys.length === 0) return;
    const newAssigned = Array.from(new Set([...selectedPermissions, ...selectedUnassignedKeys]));
    onChange(newAssigned);
    setSelectedUnassignedKeys([]);
  };

  const handleMoveRightToLeft = () => {
    if (readOnly || selectedAssignedKeys.length === 0) return;
    const targetSet = new Set(selectedAssignedKeys);
    const newAssigned = selectedPermissions.filter((k) => !targetSet.has(k));
    onChange(newAssigned);
    setSelectedAssignedKeys([]);
  };

  const isAllUnassignedSelected =
    filteredUnassigned.length > 0 &&
    filteredUnassigned.every((p) => selectedUnassignedKeys.includes(p.key));

  const isAllAssignedSelected =
    filteredAssigned.length > 0 &&
    filteredAssigned.every((p) => selectedAssignedKeys.includes(p.key));

  return (
    <div className="w-full">
      {/* 3-Part Dual-Pane Layout with Center Toggle Controls */}
      <div className="flex flex-col lg:flex-row items-center gap-3 w-full">
        {/* ============================================================ */}
        {/* LEFT SECTION: Not Assigned List */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 w-full bg-white border border-border rounded-2xl flex flex-col h-[560px] shadow-xs overflow-hidden">
          {/* Pane Header */}
          <div className="p-4 bg-muted/30 border-b border-border space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                    Not Assigned
                  </h3>
                  <p className="text-[13px] text-secondary">
                    {unassignedList.length} permissions available
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search unassigned permissions..."
                value={unassignedSearch}
                onChange={(e) => setUnassignedSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Sticky Table Column Headers */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/50 border-b border-border text-xs font-bold text-secondary uppercase tracking-wider shrink-0 items-center">
            <div className="col-span-2 flex items-center gap-1.5">
              <input
                type="checkbox"
                disabled={readOnly || filteredUnassigned.length === 0}
                checked={isAllUnassignedSelected}
                onChange={handleSelectAllUnassigned}
                className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                title="Select all unassigned"
              />
              <span>Select</span>
            </div>
            <div className="col-span-7">Permission & Key</div>
            <div className="col-span-3 text-right">Category</div>
          </div>

          {/* Scrollable List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredUnassigned.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center text-secondary space-y-1.5">
                <ShieldCheck className="w-9 h-9 text-secondary/30" />
                <p className="text-sm font-semibold text-primary">
                  {unassignedList.length === 0 ? "All permissions are assigned" : "No matching permissions found"}
                </p>
                <p className="text-[13px]">
                  {unassignedList.length === 0
                    ? "Every system permission is enabled on the right pane."
                    : "Try adjusting your search query."}
                </p>
              </div>
            ) : (
              filteredUnassigned.map((perm) => {
                const isSelected = selectedUnassignedKeys.includes(perm.key);
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleToggleSelectUnassigned(perm.key)}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/[0.08] border-l-3 border-l-primary"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {/* Select Checkbox */}
                    <div className="col-span-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={isSelected}
                        onChange={() => handleToggleSelectUnassigned(perm.key)}
                        className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                      />
                      <span className={`text-xs ${isSelected ? "font-bold text-primary" : "text-secondary"}`}>
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </div>

                    {/* Permission Name & Key */}
                    <div className="col-span-7 min-w-0 pr-2">
                      <p className={`text-sm leading-tight ${isSelected ? "font-bold text-primary" : "font-semibold text-primary/90"}`}>
                        {perm.name}
                      </p>
                      <p className="text-xs font-mono text-secondary truncate mt-0.5">
                        {perm.key}
                      </p>
                      {perm.description && (
                        <p className="text-xs text-secondary/80 line-clamp-1 mt-0.5">
                          {perm.description}
                        </p>
                      )}
                    </div>

                    {/* Category / Scope */}
                    <div className="col-span-3 text-right flex items-center justify-end">
                      <Badge variant="neutral" className="text-[11px] font-semibold uppercase px-2 py-0.5">
                        {perm.category}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER COLUMN: Toggle Action Controls */}
        {/* ============================================================ */}
        <div className="flex flex-row lg:flex-col items-center justify-center gap-3 shrink-0 py-2">
          {/* Toggle Move Right (Left -> Right) */}
          <button
            type="button"
            disabled={readOnly || selectedUnassignedKeys.length === 0}
            onClick={handleMoveLeftToRight}
            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer"
            title="Move selected to Assigned (Right)"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Toggle Move Left (Right -> Left) */}
          <button
            type="button"
            disabled={readOnly || selectedAssignedKeys.length === 0}
            onClick={handleMoveRightToLeft}
            className="w-10 h-10 rounded-xl bg-highlight text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-highlight/90 hover:scale-105 active:scale-95 cursor-pointer"
            title="Move selected to Not Assigned (Left)"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* RIGHT SECTION: Assigned List */}
        {/* ============================================================ */}
        <div className="flex-1 min-w-0 w-full bg-white border border-primary/30 rounded-2xl flex flex-col h-[560px] shadow-xs overflow-hidden">
          {/* Pane Header */}
          <div className="p-4 bg-primary/[0.04] border-b border-primary/20 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider">
                    Assigned Permissions
                  </h3>
                  <p className="text-[13px] text-secondary">
                    {assignedList.length} of {permissions.length} active
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assigned permissions..."
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Sticky Table Column Headers */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-primary/[0.02] border-b border-primary/10 text-xs font-bold text-primary uppercase tracking-wider shrink-0 items-center">
            <div className="col-span-2 flex items-center gap-1.5">
              <input
                type="checkbox"
                disabled={readOnly || filteredAssigned.length === 0}
                checked={isAllAssignedSelected}
                onChange={handleSelectAllAssigned}
                className="w-4 h-4 rounded border-border text-primary cursor-pointer"
                title="Select all assigned"
              />
              <span>Select</span>
            </div>
            <div className="col-span-7">Permission & Key</div>
            <div className="col-span-3 text-right">Category</div>
          </div>

          {/* Scrollable List Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60 bg-primary/[0.01]">
            {filteredAssigned.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center text-secondary space-y-1.5">
                <ShieldAlert className="w-9 h-9 text-secondary/30" />
                <p className="text-sm font-semibold text-primary">
                  {assignedList.length === 0 ? "No permissions assigned yet" : "No matching permissions found"}
                </p>
                <p className="text-[13px]">
                  {assignedList.length === 0
                    ? "Select permissions on the left and click the center toggle button to assign them."
                    : "Try adjusting your search query."}
                </p>
              </div>
            ) : (
              filteredAssigned.map((perm) => {
                const isSelected = selectedAssignedKeys.includes(perm.key);
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleToggleSelectAssigned(perm.key)}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-highlight/[0.08] border-l-3 border-l-highlight"
                        : "hover:bg-highlight/5"
                    }`}
                  >
                    {/* Select Checkbox */}
                    <div className="col-span-2 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={isSelected}
                        onChange={() => handleToggleSelectAssigned(perm.key)}
                        className="w-4 h-4 rounded border-border text-highlight cursor-pointer"
                      />
                      <span className={`text-xs ${isSelected ? "font-bold text-highlight" : "text-secondary"}`}>
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </div>

                    {/* Permission Name & Key */}
                    <div className="col-span-7 min-w-0 pr-2">
                      <p className={`text-sm leading-tight ${isSelected ? "font-bold text-highlight" : "font-semibold text-primary"}`}>
                        {perm.name}
                      </p>
                      <p className="text-xs font-mono text-primary/80 truncate mt-0.5">
                        {perm.key}
                      </p>
                      {perm.description && (
                        <p className="text-xs text-secondary/80 line-clamp-1 mt-0.5">
                          {perm.description}
                        </p>
                      )}
                    </div>

                    {/* Category / Scope */}
                    <div className="col-span-3 text-right flex items-center justify-end">
                      <Badge variant="primary" className="text-[11px] font-semibold uppercase px-2 py-0.5">
                        {perm.category}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
