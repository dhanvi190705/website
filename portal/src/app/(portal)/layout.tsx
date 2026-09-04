import { AssistantWidget } from '@/components/assistant/AssistantWidget';
import { TopNav } from '@/components/layout/TopNav';
import { requireUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Every authenticated screen sits inside this layout, so the session check
 * happens once rather than being repeated (and forgotten) per page.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <TopNav
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          businessUnitName: user.businessUnitName,
        }}
      />
      <main className="mx-auto max-w-[1400px] px-5 py-10 lg:px-8 lg:py-12">{children}</main>
      <AssistantWidget />
    </div>
  );
}
