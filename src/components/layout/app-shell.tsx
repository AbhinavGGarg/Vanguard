'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ChevronDown,
  Cloud,
  Crosshair,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSimulation } from '@/context/simulation-context';
import { useToast } from '@/hooks/use-toast';
import { clearSessionCookie } from '@/lib/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attack', label: 'Attack Generator', icon: Sparkles },
  { href: '/sandbox', label: 'Threat Sandbox', icon: Crosshair },
  { href: '/analysis', label: 'Analysis', icon: ShieldCheck },
  { href: '/security-events', label: 'Security Events', icon: ShieldAlert },
  { href: '/cloud-services', label: 'Cloud Services', icon: Cloud },
] as const;

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/attack': 'Attack Generator',
  '/sandbox': 'Threat Sandbox',
  '/analysis': 'Analysis & Defense',
  '/security-events': 'Security Events',
  '/cloud-services': 'Cloud Services',
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { script, description, startSimulation, isLoading } = useSimulation();
  const [env, setEnv] = useState<'AWS' | 'GCP' | 'Azure'>('AWS');
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(
    () => pageTitles[pathname] ?? 'Vanguard',
    [pathname]
  );

  const runScenario = async () => {
    if (!script.trim()) {
      toast({
        variant: 'destructive',
        title: 'No Script Available',
        description: 'Generate an attack script on the Attack page before running a scenario.',
      });
      return;
    }

    await startSimulation(script, description || 'Scenario from dashboard action');
    router.push('/analysis');
  };

  const logout = () => {
    clearSessionCookie();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen text-foreground">
      <div className="mx-auto flex max-w-[1680px] gap-4 p-4 md:p-6">
        <aside className="hidden h-[calc(100vh-3rem)] w-72 shrink-0 flex-col rounded-2xl border border-border bg-card/80 shadow-md backdrop-blur md:flex">
          <div className="px-4 pb-4 pt-5">
            <img src="/vanguard-logo.svg" alt="Vanguard" className="h-8 w-auto object-contain" />
            <p className="mt-2 text-xs text-muted-foreground">
              AI-native cloud threat modeling
            </p>
          </div>
          <Separator />
          <div className="flex-1 space-y-4 px-3 py-4">
            <SidebarNav />
          </div>
          <div className="border-t border-border p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-11 w-full justify-between rounded-xl px-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>AG</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium">Abhinav</p>
                      <p className="text-xs text-muted-foreground">Owner</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-300">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-3rem)] flex-1 flex-col gap-4">
          <header className="sticky top-4 z-10 rounded-2xl border border-border bg-card/80 px-4 py-3 shadow-md backdrop-blur md:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open navigation</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 border-border bg-[#111827]">
                    <SheetHeader>
                      <SheetTitle>
                        <img src="/vanguard-logo.svg" alt="Vanguard" className="h-8 w-auto" />
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <SidebarNav onNavigate={() => setMobileOpen(false)} />
                    </div>
                  </SheetContent>
                </Sheet>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Vanguard</p>
                  <h1 className="text-lg font-semibold">{pageTitle}</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="hidden gap-2 sm:flex">
                      <Activity className="h-4 w-4" />
                      {env}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {(['AWS', 'GCP', 'Azure'] as const).map((provider) => (
                      <DropdownMenuItem key={provider} onClick={() => setEnv(provider)}>
                        {provider}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={runScenario} disabled={!script || isLoading}>
                    Run Full Scenario
                  </Button>
                </motion.div>
              </div>
            </div>
          </header>

          <main className="flex-1 rounded-2xl border border-border bg-card/60 p-4 shadow-md md:p-6">
            {isLoading && (
              <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/20">
                Running simulation...
              </Badge>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
