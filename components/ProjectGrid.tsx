import { Projeto } from "@/lib/projetos";
import { Categoria } from "@/lib/categorias";
import ProjectCard from "./ProjectCard";

interface Props {
  projetos: Projeto[];
  categorias: Categoria[];
}

export default function ProjectGrid({ projetos, categorias }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projetos.map((projeto) => (
        <ProjectCard key={projeto.slug} projeto={projeto} categorias={categorias} />
      ))}
    </div>
  );
}
