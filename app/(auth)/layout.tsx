import { requireGuest } from "@/lib/auth/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireGuest();
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight">Fintra</span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <blockquote className="text-3xl font-light leading-snug text-background/90">
            "Controle total das suas<br />finanças em um só lugar."
          </blockquote>
          <div className="space-y-4">
            {[
              { label: "Dashboard em tempo real", desc: "Visão completa do seu orçamento" },
              { label: "Categorias inteligentes", desc: "Organize gastos automaticamente" },
              { label: "Alertas de vencimento", desc: "Nunca pague multa de atraso" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm text-background">{item.label}</p>
                  <p className="text-sm text-background/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-sm text-background/40">
          © {new Date().getFullYear()} Fintra. Todos os direitos reservados.
        </p>
      </div>
      {/* Right: Auth form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="text-lg font-semibold">Fintra</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
