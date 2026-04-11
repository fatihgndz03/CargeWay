import { Twitter, Instagram, Linkedin } from 'lucide-react';

const socials = [
  { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com/cargeway' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/cargeway' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/cargeway' },
];

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      {socials.map(({ icon: Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-zinc-700 text-zinc-500 hover:border-green-500/60 hover:text-green-400 hover:bg-green-500/5 transition-all duration-200 active:scale-95"
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}
    </div>
  );
}
