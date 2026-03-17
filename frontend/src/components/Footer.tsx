
interface FooterLink {
    label: string;
    href: string;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const sections: FooterSection[] = [
        {
            title: "Produto",
            links: [
                { label: "Funcionalidades", href: "/funcionalidade" },
                { label: "Preços", href: "#" },
                { label: "Guia", href: "#" },
            ],
        },
        {
            title: "Empresa",
            links: [
                { label: "Sobre nós", href: "#" },
                { label: "Contato", href: "#" },
                { label: "Blog", href: "#" },
            ],
        },
        {
            title: "Legal",
            links: [
                { label: "Privacidade", href: "/privacidade" },
                { label: "Termos", href: "/termos" },
            ],
        },
    ];

    return (
        <footer className="bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Logo / Sobre */}
                    <div className="col-span-2 md:col-span-1">
                        <span className="text-xl font-bold text-blue-600">🥬</span>
                        <p className="mt-4 text-sm text-slate-600">
                            Soluções inteligentes para o seu dia a dia.
                        </p>
                    </div>

                    {/* Seções de Links */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <ul className="mt-4 space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-500">
                        &copy; {currentYear} Dispensa Express. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;