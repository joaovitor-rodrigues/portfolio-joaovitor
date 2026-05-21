"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ContatoFormProps {
  formspreeId: string;
}

export default function ContatoForm({ formspreeId }: ContatoFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const form = e.currentTarget;

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        router.push("/contato/obrigado");
      } else {
        setError(true);
        setSubmitting(false);
      }
    } catch {
      setError(true);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      {error && (
        <p className="text-sm text-red-500">
          Erro ao enviar. Tente novamente ou entre em contato diretamente.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
      >
        {submitting ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
