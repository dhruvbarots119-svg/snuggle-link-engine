import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/floors", label: "Floors" },
  { to: "/story", label: "Story" },
  { to: "/amenities", label: "Amenities" },
  { to: "/explorer", label: "Explorer" },
] as const;

export function PageFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="fixed inset-0 bg-white">
      <iframe
        src={src}
        title={title}
        className="w-full h-full border-0"
      />
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 rounded-full bg-black/80 px-2 py-1.5 backdrop-blur-md shadow-lg">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="px-3 py-1.5 text-xs font-medium text-white/70 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            activeProps={{ className: "px-3 py-1.5 text-xs font-medium rounded-full bg-white text-black" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
