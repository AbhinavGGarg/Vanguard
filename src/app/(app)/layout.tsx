import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { SimulationProvider } from '@/context/simulation-context';
import { AlertProvider } from '@/context/alert-context';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('vanguard_session')?.value;

  if (!session) {
    redirect('/login');
  }

  return (
    <AlertProvider>
      <SimulationProvider>
        <AppShell>{children}</AppShell>
      </SimulationProvider>
    </AlertProvider>
  );
}
