export default function Footer() {
  return (
    <footer className="border-t border-slate-200 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <LogoMark className="w-5 h-5 text-brand-600" />
          <span>CST College &middot; Student Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Phuentsholing, Bhutan</span>
          <span>&copy; {new Date().getFullYear()} CST College</span>
        </div>
      </div>
    </footer>
  );
}

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Zm0 9.5L4.5 9 12 5.5 19.5 9 12 12.5ZM5 12.18v3.6c0 .3.15.58.4.75C6.6 17.4 9.1 19 12 19s5.4-1.6 6.6-2.47c.25-.17.4-.45.4-.75v-3.6l-7 3.18-7-3.18Z"
        fill="currentColor"
      />
    </svg>
  );
}
