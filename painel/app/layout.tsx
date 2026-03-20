import './globals.css';
import type { Metadata } from 'next';
import AdminShell from '@/components/AdminShell';

export const metadata: Metadata = {
  title: 'Painel - Bot Bruna',
  description: 'Painel administrativo do bot de atendimento WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 bg-beauty-pattern">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
