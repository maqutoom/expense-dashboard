import { useState } from 'react';
import { ArrowTrendingUpIcon, ShieldCheckIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';

const initialAuthState = {
  name: '',
  email: '',
  password: '',
};

const featureCards = [
  {
    icon: WalletIcon,
    title: 'Personal finance control',
    description: 'Track income, expenses, budgets, and savings from one polished workspace.',
  },
  {
    icon: ArrowTrendingUpIcon,
    title: 'Live analytics',
    description: 'See category breakdowns, monthly trends, and budget health at a glance.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'User-based privacy',
    description: 'Every account only sees its own transactions stored in a separate profile.',
  },
];

export default function AuthPage() {
  const { login, signup } = useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialAuthState);
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage('');

    const result =
      mode === 'login'
        ? login({ email: form.email, password: form.password })
        : signup(form);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    setForm(initialAuthState);
  };

  return (
    <main className="min-h-screen bg-aurora px-4 py-8 text-slate-50 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="flex flex-col justify-between rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur xl:p-10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-mint" />
              Expance Fintech Dashboard
            </div>
            <h1 className="mt-8 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Manage expenses, income, budgets, and reports in one responsive workspace.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
              Built for individuals who want a clean modern dashboard with budgeting,
              exportable reports, and category-level insights.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-3xl border border-white/10 bg-slate-950/40 p-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-6 w-6 text-mint" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-100">
            Demo accounts: <span className="font-semibold">aarav@example.com</span> / demo123 and <span className="font-semibold">meera@example.com</span> / demo123
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[32px] border border-white/10 bg-slate-950/70 p-8 shadow-glow backdrop-blur xl:p-10">
            <div className="flex rounded-2xl border border-white/10 bg-white/5 p-1">
              {['login', 'signup'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setMode(tab);
                    setMessage('');
                  }}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium capitalize transition ${
                    mode === tab
                      ? 'bg-white text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-3xl font-semibold text-white">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {mode === 'login'
                  ? 'Sign in to view your personal finance dashboard.'
                  : 'Set up your expense workspace in under a minute.'}
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {mode === 'signup' ? (
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-300">Full name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-mint"
                    placeholder="Enter your name"
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-mint"
                  placeholder="name@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Password</span>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-mint"
                  placeholder="Enter your password"
                />
              </label>

              {message ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-mint to-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
              >
                {mode === 'login' ? 'Login to dashboard' : 'Create account'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
