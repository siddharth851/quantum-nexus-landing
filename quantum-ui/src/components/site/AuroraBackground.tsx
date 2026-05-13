export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/30 blur-[140px] animate-aurora" />
      <div className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-secondary/25 blur-[160px] animate-aurora [animation-delay:-6s]" />
      <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-accent/30 blur-[140px] animate-aurora [animation-delay:-12s]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_30%,var(--background)_85%)]" />
    </div>
  );
}
