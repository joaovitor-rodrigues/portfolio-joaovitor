import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { get } from "@/lib/sobre";
import { resolveImageUrl } from "@/lib/gdrive";
import { applyCropStyles } from "@/lib/fotoCrop";

export default function SobrePage() {
  const sobre = get();

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl font-normal text-[#111118] mb-16">Sobre</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Coluna esquerda: bio + habilidades */}
          <div>
            {sobre.mostrarBio && (
              <>
                <h2 className="font-display text-3xl font-normal text-[#111118] mb-6">
                  {sobre.titulo}
                </h2>
                <div className="space-y-4 text-[#374151] leading-relaxed">
                  {sobre.paragrafos.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              </>
            )}

            {sobre.mostrarHabilidades && (
              <div className={sobre.mostrarBio ? "mt-10" : ""}>
                <h3 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider mb-4">
                  Habilidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sobre.habilidades.map((h) => (
                    <span
                      key={h}
                      className="px-3 py-1.5 bg-[#F8F8FA] border border-[#E5E7EB] text-sm text-[#374151] rounded-full"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna direita: foto + stats */}
          {(sobre.mostrarFoto || sobre.mostrarStats) && (
            <div>
              {sobre.mostrarFoto && (
                <div className="aspect-[3/4] bg-[#F8F8FA] rounded-2xl border border-[#E5E7EB] overflow-hidden">
                  {sobre.fotoUrl && (() => {
                    const { imgStyle } = applyCropStyles(
                      sobre.fotoCrop ?? { x: 50, y: 50, scale: 1 }
                    );
                    return (
                      <img
                        src={resolveImageUrl(sobre.fotoUrl)}
                        alt="Foto de perfil"
                        style={imgStyle}
                      />
                    );
                  })()}
                </div>
              )}

              {sobre.mostrarStats && (
                <div className={`grid grid-cols-3 gap-4 text-center ${sobre.mostrarFoto ? "mt-6" : ""}`}>
                  {sobre.stats.map((stat) => (
                    <div key={stat.label} className="p-4 bg-[#F8F8FA] rounded-xl border border-[#E5E7EB]">
                      <p className="font-display text-2xl font-normal text-purple-600">{stat.valor}</p>
                      <p className="text-xs text-[#9CA3AF] mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
