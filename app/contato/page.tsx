import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { get } from "@/lib/contato";
import { ContatoIcon } from "@/lib/contatoIcons";

export default function ContatoPage() {
  const contato = get();

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
            <form
              action={`https://formspree.io/f/${contato.formspreeId}`}
              method="POST"
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Nome</label>
                <input
                  type="text"
                  name="nome"
                  required
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-1">Mensagem</label>
                <textarea
                  name="mensagem"
                  required
                  rows={5}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition resize-none"
                  placeholder="Conte sobre seu projeto..."
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Enviar mensagem
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
