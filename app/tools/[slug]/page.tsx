import { notFound } from "next/navigation";
import { getTool, tools } from "@/lib/tools";
import { ToolShell } from "@/components/ToolShell";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  if (!tool) return { title: "Tool not found" };
  return {
    title: `${tool.name} — DevTools`,
    description: tool.description,
  };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = getTool(params.slug);
  if (!tool) notFound();

  const Component = tool.component;

  return (
    <ToolShell
      name={tool.name}
      description={tool.description}
      icon={tool.icon}
    >
      <Component />
    </ToolShell>
  );
}
