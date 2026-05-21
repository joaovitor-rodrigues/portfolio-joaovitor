import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContatoForm from "@/components/ContatoForm";
import { get } from "@/lib/contato";
import { ContatoIcon } from "@/lib/contatoIcons";

export default async function ContatoPage() {
  const contato = await get();

  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl font-normal text-[#111118] mb-4">Contato</h1>
          <p className="text-[#6B7280] mb-12">{contato.intro}</p>

          {/* Links dinâmicos */}
          {contato.links.length > 0 && (
            <div className="space-y-4 mb-12">
              {contato.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.tipo === "email" ? undefined : "_blank"}
                  rel={link.tipo === "email" ? undefined : "noopener noreferrer"}
                  className="flex items-center gap-3 text-[#374151] hover:text-purple-600 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition-colors flex-shrink-0">
                    <ContatoIcon
                      tipo={link.tipo}
                      className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors"
                    />
                  </div>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Formulário */}
          <div className="border-t border-[#E5E7EB] pt-10">
            <h2 className="font-display text-2xl font-normal text-[#111118] mb-6">Enviar mensagem</h2>
            <ContatoForm formspreeId={contato.formspreeId} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
