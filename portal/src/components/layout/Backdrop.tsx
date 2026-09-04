/**
 * The room the product sits in: soft accent auras over a faint grid, with a
 * vignette pulling focus to the centre. Purely decorative and non-interactive.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ground">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--c-accent) / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-accent) / 0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 70% 55% at 50% 30%, #000 20%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 55% at 50% 30%, #000 20%, transparent 80%)',
        }}
      />
      <div
        className="absolute -top-[20%] left-[6%] h-[44vw] w-[44vw] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--c-accent) / 0.22), transparent 66%)' }}
      />
      <div
        className="absolute right-[-10%] top-[30%] h-[36vw] w-[36vw] rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--c-accent-bright) / 0.14), transparent 68%)' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_10%,rgb(var(--c-ground)/0.5)_58%,rgb(var(--c-ground))_100%)]" />
    </div>
  );
}
