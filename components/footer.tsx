export function Footer() {
    return (
        <footer className="hidden md:block mt-auto border-t border-border bg-background/50 backdrop-blur-lg py-6">
            <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <p>Precast Inc. © 2026. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                    <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                    <a href="#" className="hover:text-foreground transition-colors">Docs</a>
                </div>
            </div>
        </footer>
    )
}
