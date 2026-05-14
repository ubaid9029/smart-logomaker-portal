export default function Footer() {
  return (
    <footer className="w-full shrink-0 bg-white/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-xs font-bold text-foreground">
            Smart Logo Maker <span className="text-muted-foreground font-medium">Admin Portal</span>
          </p>
          <p className="text-[10px] text-muted-foreground">
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> DevSinn Technologies. All rights reserved.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="text-[11px] font-bold text-muted-foreground transition-colors hover:text-brand-primary">Support</a>
          <a href="#" className="text-[11px] font-bold text-muted-foreground transition-colors hover:text-brand-primary">Documentation</a>
          <a href="#" className="text-[11px] font-bold text-muted-foreground transition-colors hover:text-brand-primary">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
