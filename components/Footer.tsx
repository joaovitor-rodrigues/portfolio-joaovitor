import { get as getContato } from "@/lib/contato";
import { TIPOS_LINK } from "@/lib/contatoIcons";

export default function Footer() {
  const contato = getContato();

  // Exibe no rodapé todos os links exceto e-mail
  const socialLinks = contato.links.filter((l) => l.tipo !== "email");

  // Usa o label do tipo como texto (ex: "Instagram", "LinkedIn")
  function tipoLabel(tipo: string) {
    return TIPOS_LINK.find((t) => t.value === tipo)?.label ?? tipo;
  }

  return (
    <footer className="border-t border-[#E5E7EB] bg-white mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
        <p>© {new Date().getFullYear()} João Vitor Rodrigues.</p>
        <p className="text-[#9CA3AF]">Porto Alegre, RS</p>
        {socialLinks.length > 0 ? (
          <div className="flex gap-6 flex-wrap justify-center">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-600 transition-colors"
              >
                {tipoLabel(link.tipo)}
              </a>
            ))}
          </div>
        ) : (
          <div />
        )}
      </div>
    </footer>
  );
}
