import Link from "next/link";

const features = [
  {
    href: "/register",
    title: "Create your account",
    desc: "Set up your student account with your Student ID and a secure password.",
    icon: UserIcon,
  },
  {
    href: "/payment",
    title: "Pay your tuition",
    desc: "Pay via Mobile Banking and upload your payment confirmation for verification.",
    icon: CardIcon,
  },
  {
    href: "/registration",
    title: "Register for modules",
    desc: "Enroll once your payment, clearance and the registration window all line up.",
    icon: BookIcon,
  },
  {
    href: "/results",
    title: "Check your results",
    desc: "View your grades online and download an official results sheet as a PDF.",
    icon: ChartIcon,
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Your student journey, <span className="text-brand-600">all in one place</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Register, pay tuition, enroll in your modules, and view your results &mdash; the CST College
            Student Portal keeps everything a click away.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Get started
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="card hover:border-brand-400 hover:shadow-md transition block">
              <f.icon className="w-9 h-9 text-brand-600 mb-3" />
              <h2 className="font-semibold text-slate-900">{f.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 card bg-slate-50 border-dashed">
          <p className="text-sm font-medium text-slate-700">Want to explore without creating an account?</p>
          <p className="text-sm text-slate-500 mt-1">
            Try the portal with a sample account &mdash; Student ID <code className="font-mono">02240353</code>,
            password <code className="font-mono">Cst2026a</code>.
          </p>
          <Link href="/login" className="btn-secondary mt-3 inline-flex">
            Sign in with sample account
          </Link>
        </div>
      </section>
    </div>
  );
}

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
