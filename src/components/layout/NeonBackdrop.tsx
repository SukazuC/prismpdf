"use client";

type Variant = "default" | "editor" | "success";

const variantGradients: Record<Variant, { cyan: string; violet: string; magenta: string }> = {
  default: {
    cyan: "radial-gradient(ellipse 600px 400px at 15% 20%, rgba(53,213,255,0.12) 0%, transparent 70%)",
    violet: "radial-gradient(ellipse 500px 500px at 80% 30%, rgba(124,60,255,0.10) 0%, transparent 70%)",
    magenta: "radial-gradient(ellipse 400px 400px at 50% 80%, rgba(236,76,255,0.08) 0%, transparent 70%)",
  },
  editor: {
    cyan: "radial-gradient(ellipse 500px 500px at 10% 10%, rgba(53,213,255,0.10) 0%, transparent 65%)",
    violet: "radial-gradient(ellipse 600px 600px at 70% 20%, rgba(124,60,255,0.12) 0%, transparent 65%)",
    magenta: "radial-gradient(ellipse 400px 400px at 90% 80%, rgba(236,76,255,0.08) 0%, transparent 65%)",
  },
  success: {
    cyan: "radial-gradient(ellipse 500px 500px at 30% 30%, rgba(53,213,255,0.10) 0%, transparent 65%)",
    violet: "radial-gradient(ellipse 500px 500px at 60% 30%, rgba(124,60,255,0.10) 0%, transparent 65%)",
    magenta: "radial-gradient(ellipse 500px 500px at 50% 70%, rgba(53,242,166,0.10) 0%, transparent 65%)",
  },
};

export function NeonBackdrop({ variant = "default" }: { variant?: Variant }) {
  const gradients = variantGradients[variant];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base dark gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #020617 0%, #050b1d 40%, #071226 100%)",
        }}
      />
      {/* Glow layers */}
      <div className="absolute inset-0" style={{ background: gradients.cyan }} />
      <div className="absolute inset-0" style={{ background: gradients.violet }} />
      <div className="absolute inset-0" style={{ background: gradients.magenta }} />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `repeating-conic-gradient(#fff 0.0000001%, transparent 0.0000002%, transparent 99.9999999%)`,
          backgroundSize: "4px 4px",
        }}
      />
    </div>
  );
}
