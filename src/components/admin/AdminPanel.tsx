"use client";

import type { BusinessUnit, Project, Role, User } from "@prisma/client";
import { Building2, FolderKanban, Users } from "lucide-react";
import { useState } from "react";

import { BusinessUnitsTab } from "@/components/admin/BusinessUnitsTab";
import { ProjectsTab } from "@/components/admin/ProjectsTab";
import { UsersTab } from "@/components/admin/UsersTab";
import { cn } from "@/lib/utils";

export type SafeUser = Omit<User, "passwordHash"> & { businessUnit: BusinessUnit | null };
export type AdminProject = Project & {
  businessUnit: BusinessUnit;
  champion: { id: string; name: string; email: string } | null;
};

const TABS = [
  { key: "users", label: "Users", icon: Users },
  { key: "business-units", label: "Business Units", icon: Building2 },
  { key: "projects", label: "Projects", icon: FolderKanban },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AdminPanel({
  businessUnits,
  users,
  projects,
}: {
  businessUnits: BusinessUnit[];
  users: SafeUser[];
  projects: AdminProject[];
}) {
  const [tab, setTab] = useState<TabKey>("users");

  return (
    <div>
      <div className="mb-6 flex gap-1 border-b border-surface-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition",
              tab === key
                ? "border-gold-500 text-gold-400"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersTab users={users} businessUnits={businessUnits} />}
      {tab === "business-units" && <BusinessUnitsTab businessUnits={businessUnits} />}
      {tab === "projects" && (
        <ProjectsTab
          projects={projects}
          businessUnits={businessUnits}
          champions={users.filter((u) => u.role === ("AI_CHAMPION" as Role))}
        />
      )}
    </div>
  );
}
