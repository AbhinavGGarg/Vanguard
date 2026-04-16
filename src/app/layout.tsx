import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainLayout } from '@/components/main-layout';
import { SimulationProvider } from '@/context/simulation-context';

export const metadata: Metadata = {
  title: 'CloudStrike AI - Threat Modeling',
  description: 'AI-powered sandbox for modeling and analyzing cloud-native attacks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SimulationProvider>
          <SidebarProvider defaultOpen={true}>
              <MainLayout>
                  {children}
              </MainLayout>
          </SidebarProvider>
        </SimulationProvider>
        <Toaster />
      </body>
    </html>
  );
}
