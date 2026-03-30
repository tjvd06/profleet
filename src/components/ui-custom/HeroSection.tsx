import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
}

export function HeroSection({ badge, badgeIcon, title, subtitle, children }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-blue-900 text-white pt-20 pb-24 overflow-hidden px-4 md:px-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10 flex flex-col items-center text-center">
        {badge && (
          <Badge className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 mb-6 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            {badgeIcon && <span className="mr-1.5">{badgeIcon}</span>}
            {badge}
          </Badge>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-5 max-w-4xl leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-blue-100/70 max-w-2xl leading-relaxed mb-8">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
