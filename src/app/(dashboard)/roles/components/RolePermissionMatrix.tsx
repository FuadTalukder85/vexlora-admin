"use client";

import React, { useState } from "react";
import { Search, Check } from "lucide-react";
import { Permission } from "@/types/rbac";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface RolePermissionMatrixProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onChange: (selected: string[]) => void;
  readOnly?: boolean;
}

export const RolePermissionMatrix: React.FC<RolePermissionMatrixProps> = ({
  permissions,
  selectedPermissions,
  onChange,
  readOnly = false,
}) => {
  const [filterQuery, setFilterQuery] = useState("");

  const handleTogglePermission = (key: string) => {
    if (readOnly) return;
    if (selectedPermissions.includes(key)) {
      onChange(selectedPermissions.filter((p) => p !== key));
    } else {
      onChange([...selectedPermissions, key]);
    }
  };

  const handleToggleCategory = (cat: string) => {
    if (readOnly) return;
    const catPerms = permissions.filter((p) => p.category === cat).map((p) => p.key);
    const allSelected = catPerms.every((k) => selectedPermissions.includes(k));

    if (allSelected) {
      onChange(selectedPermissions.filter((k) => !catPerms.includes(k)));
    } else {
      onChange(Array.from(new Set([...selectedPermissions, ...catPerms])));
    }
  };

  const handleSelectAll = () => {
    if (readOnly) return;
    if (selectedPermissions.length === permissions.length) {
      onChange([]);
    } else {
      onChange(permissions.map((p) => p.key));
    }
  };

  const filteredPermissions = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const categories = Array.from(new Set(filteredPermissions.map((p) => p.category)));

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-4 rounded-xl border border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search permissions by name, key, or category..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs font-bold text-primary">
            {selectedPermissions.length} of {permissions.length} selected
          </span>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs cursor-pointer"
            >
              {selectedPermissions.length === permissions.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
      </div>

      {/* Permissions List / Table View */}
      <div className="space-y-6">
        {categories.length === 0 ? (
          <div className="p-8 bg-white border border-border rounded-xl text-center text-xs text-secondary">
            No permissions matching &quot;{filterQuery}&quot;
          </div>
        ) : (
          categories.map((cat) => {
            const catPerms = filteredPermissions.filter((p) => p.category === cat);
            const isCatFullySelected = catPerms.every((p) =>
              selectedPermissions.includes(p.key)
            );
            const selectedCountInCat = catPerms.filter((p) =>
              selectedPermissions.includes(p.key)
            ).length;

            return (
              <div
                key={cat}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs"
              >
                {/* Category Header Row */}
                <div className="flex items-center justify-between bg-muted/40 px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {cat}
                    </span>
                    <span className="text-[11px] text-secondary font-medium">
                      ({selectedCountInCat} of {catPerms.length} selected)
                    </span>
                  </div>

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className="text-xs font-semibold text-highlight hover:underline cursor-pointer"
                    >
                      {isCatFullySelected ? "Deselect Category" : "Select Category"}
                    </button>
                  )}
                </div>

                {/* Table / List Layout of Permissions */}
                <div className="divide-y divide-border/60">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-5 py-2 bg-muted/10 text-[11px] font-bold text-secondary uppercase tracking-wider">
                    <div className="col-span-1">Select</div>
                    <div className="col-span-4">Permission Name & Key</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-right">Scope</div>
                  </div>

                  {catPerms.map((perm) => {
                    const isSelected = selectedPermissions.includes(perm.key);

                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 px-5 py-3 items-center transition-colors ${
                          readOnly ? "cursor-default" : "cursor-pointer hover:bg-muted/30"
                        } ${isSelected ? "bg-primary/[0.03]" : "bg-white"}`}
                      >
                        {/* Checkbox */}
                        <div className="col-span-1 flex items-center">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "border-border bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Permission Name & Key */}
                        <div className="col-span-4 min-w-0">
                          <p className="text-xs font-bold text-primary">{perm.name}</p>
                          <p className="text-[11px] font-mono text-secondary mt-0.5">{perm.key}</p>
                        </div>

                        {/* Description */}
                        <div className="col-span-5 min-w-0">
                          <p className="text-xs text-secondary leading-relaxed">
                            {perm.description || "—"}
                          </p>
                        </div>

                        {/* Scope */}
                        <div className="col-span-2 sm:text-right">
                          <Badge variant="neutral" className="text-[10px] font-semibold">
                            {perm.scope}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
