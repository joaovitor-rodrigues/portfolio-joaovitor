import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Mensagem enviada — João Vitor Rodrigues",
  description: "Sua mensagem foi recebida com sucesso.",
};

export default function ObrigadoPage() {
  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-16 min-h-[calc(100vh-4rem-theme(spacing.24))] flex items-center">
        <div className="max-w-xl">
          {/* Ícone de confirmação */}
          <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-8">
            <svg
              className="w-7 h-7 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-display text-4xl font-normal text-[#111118] mb-4">
            Mensagem recebida!
          </h1>
          <p className="text-[#6B7280] mb-10 leading-relaxed">
            Assim que possível retorno o contato, obrigado!
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar para o início
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
