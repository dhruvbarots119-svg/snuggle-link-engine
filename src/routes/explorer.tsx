import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/PageFrame";

export const Route = createFileRoute("/explorer")({
  head: () => ({
    meta: [
      { title: "Floor Explorer | Tatvarth Heights" },
      { name: "description", content: "Interactive floor explorer for Tatvarth Heights." },
      { property: "og:title", content: "Floor Explorer | Tatvarth Heights" },
      { property: "og:description", content: "Interactive floor explorer." },
    ],
  }),
  component: () => <PageFrame src="/pages/explorer.html" title="Floor Explorer" />,
});
