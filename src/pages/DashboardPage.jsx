import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BanknotesIcon,
  Bars3BottomLeftIcon,
  BellIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PencilSquareIcon,
  PlusIcon,
  ShareIcon,
  SunIcon,
  TrashIcon,
  UserCircleIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';
import { saveAsExcel, saveAsMonthlyPdf } from '../utils/reporting';
import { categories, paymentMethods } from '../data/mockData';
import { useApp } from '../context/AppContext';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
);

const navItems = [
  { id: 'overview', label: 'Overview', icon: Bars3BottomLeftIcon },
  { id: 'transactions', label: 'Transactions', icon: CreditCardIcon },
  { id: 'reports', label: 'Reports', icon: ChartBarIcon },
  { id: 'budget', label: 'Budget', icon: ClipboardDocumentCheckIcon },
];

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const formatAmount = (value) => currency.format(value || 0);
const formatCompact = (value) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value || 0,
  );

const parseMonthKey = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
};

const isSameWeek = (date) => {
  const value = new Date(date);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return value >= start && value < end;
};

const buildMonthlyTrend = (transactions) => {
  const months = Array.from({ length: 6 }, (_, index) => {
    const value = new Date();
    value.setMonth(value.getMonth() - (5 - index));
    return {
      key: parseMonthKey(value),
      label: value.toLocaleDateString('en-IN', { month: 'short' }),
      income: 0,
      expense: 0,
    };
  });

  transactions.forEach((transaction) => {
    const month = months.find((item) => item.key === parseMonthKey(transaction.date));
    if (!month) return;
    month[transaction.type] += transaction.amount;
  });

  return months;
};

const buildCategoryBreakdown = (transactions) =>
  categories.map((category) =>
    transactions
      .filter((item) => item.type === 'expense' && item.category === category)
      .reduce((sum, item) => sum + item.amount, 0),
  );

function ShellCard({ title, action, className = '', children }) {
  return (
    <section className={`rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,19,37,0.96),rgba(11,13,25,0.94))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.28)] ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-200">{title}</p>
        {action}
      </div>
      {children}
    </section>
  );
}

function TinyStat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const {
    currentUser,
    defaultTransaction,
    theme,
    addTransaction,
    deleteTransaction,
    logout,
    setBudget,
    toggleTheme,
    updateTransaction,
  } = useApp();

  const [activeSection, setActiveSection] = useState('overview');
  const [form, setForm] = useState(defaultTransaction);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [budgetInput, setBudgetInput] = useState(String(currentUser?.budget || 0));
  const [toast, setToast] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('all');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setBudgetInput(String(currentUser?.budget || 0));
  }, [currentUser?.budget]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [activeSection]);

  const transactions = useMemo(
    () => [...currentUser.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [currentUser.transactions],
  );

  const totalIncome = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const remainingBalance = totalIncome - totalExpenses;
  const latestMonthKey = transactions.length ? parseMonthKey(transactions[0].date) : parseMonthKey(new Date());
  const monthlyIncome = transactions.filter((item) => item.type === 'income' && parseMonthKey(item.date) === latestMonthKey).reduce((sum, item) => sum + item.amount, 0);
  const monthlyExpenses = transactions.filter((item) => item.type === 'expense' && parseMonthKey(item.date) === latestMonthKey).reduce((sum, item) => sum + item.amount, 0);
  const monthlySavings = Math.max(monthlyIncome - monthlyExpenses, 0);
  const monthlyLabel = transactions.length ? new Date(transactions[0].date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'This month';
  const incomeSpentLabel = formatCompact(monthlyIncome) + ' / ' + formatCompact(monthlyExpenses);
  const weeklyExpenses = transactions.filter((item) => item.type === 'expense' && isSameWeek(item.date)).reduce((sum, item) => sum + item.amount, 0);
  const monthlyTrend = buildMonthlyTrend(transactions);
  const categoryBreakdown = buildCategoryBreakdown(transactions);
  const recentTransactions = transactions.slice(0, 5);
  const quickHistoryTransactions = recentTransactions.filter((transaction) => {
    if (historyTypeFilter === 'all') return true;
    if (historyTypeFilter === 'income') return transaction.type === 'income';
    return transaction.type === 'expense';
  });
  const topExpenseCategories = categories
    .map((category, index) => ({ category, amount: categoryBreakdown[index] }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    ;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      transaction.notes.toLowerCase().includes(deferredSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || transaction.category === categoryFilter;
    const matchesDate = !dateFilter || transaction.date === dateFilter;
    return matchesSearch && matchesCategory && matchesDate;
  });

  const budgetUsage = currentUser.budget ? Math.min((monthlyExpenses / currentUser.budget) * 100, 100) : 0;
  const budgetStatus = !currentUser.budget
    ? 'Set your monthly budget to start receiving alerts.'
    : monthlyExpenses > currentUser.budget
      ? 'Overspending warning: this month has crossed your planned budget.'
      : monthlyExpenses > currentUser.budget * 0.85
        ? 'Budget alert: you are nearing your monthly limit.'
        : 'Budget is healthy and within your planned limit.';

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {
      x: { ticks: { color: '#71768f' }, grid: { display: false } },
      y: { ticks: { color: '#71768f' }, grid: { color: 'rgba(255,255,255,0.06)' } },
    },
  };

  const lineData = {
    labels: monthlyTrend.map((item) => item.label),
    datasets: [
      {
        label: 'Balance Flow',
        data: monthlyTrend.map((item) => Math.max(item.income - item.expense, 0)),
        borderColor: '#f8fafc',
        backgroundColor: 'rgba(148,163,184,0.08)',
        borderWidth: 2,
        tension: 0.45,
        fill: true,
      },
    ],
  };

  const budgetBarData = {
    labels: monthlyTrend.map((item) => item.label),
    datasets: [
      { label: 'Income', data: monthlyTrend.map((item) => item.income), backgroundColor: 'rgba(195,181,255,0.92)', borderRadius: 10 },
      { label: 'Spent', data: monthlyTrend.map((item) => item.expense), backgroundColor: 'rgba(108,92,231,0.62)', borderRadius: 10 },
    ],
  };

  const ringSource = topExpenseCategories.length > 0 ? topExpenseCategories : [{ category: 'Other', amount: 1 }];
  const spendingRingData = {
    labels: ringSource.map((item) => item.category),
    datasets: [{ data: ringSource.map((item) => item.amount), backgroundColor: ['#8b5cf6', '#60a5fa', '#f9a8d4', '#c4b5fd', '#22d3ee', '#f59e0b', '#34d399', '#fb7185', '#94a3b8'], borderWidth: 0 }],
  };

  const reportBarData = {
    labels: ['Weekly', 'Monthly', 'Savings'],
    datasets: [{ data: [weeklyExpenses, monthlyExpenses, monthlySavings], backgroundColor: ['#7dd3fc', '#fda4af', '#6ee7b7'], borderRadius: 12 }],
  };

  const polarData = {
    labels: categories,
    datasets: [{ data: categoryBreakdown.map((item) => (item === 0 ? 200 : item)), backgroundColor: ['rgba(96,165,250,0.7)', 'rgba(139,92,246,0.72)', 'rgba(244,114,182,0.72)', 'rgba(192,132,252,0.72)', 'rgba(45,212,191,0.72)', 'rgba(251,191,36,0.72)', 'rgba(248,113,113,0.72)', 'rgba(165,180,252,0.72)', 'rgba(148,163,184,0.72)'], borderWidth: 0 }],
  };

  const resetForm = () => {
    setForm(defaultTransaction);
    setEditingId(null);
    setFormError('');
  };

  const validateTransactionForm = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.date) return 'Date is required.';
    if (!form.category) return 'Category is required.';
    if (!form.paymentMethod) return 'Payment method is required.';

    const amountValue = Number(form.amount);
    if (!Number.isFinite(amountValue)) return 'Amount must be a valid number.';
    if (amountValue <= 0) return 'Amount must be greater than 0.';

    return '';
  };

  const setFormField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError('');
  };

  const handleTransactionSubmit = (event) => {
    event.preventDefault();

    const validationMessage = validateTransactionForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      amount: Number(form.amount),
      notes: form.notes.trim(),
    };

    if (editingId) {
      updateTransaction(editingId, payload);
      setToast('Transaction updated successfully.');
    } else {
      addTransaction(payload);
      setToast(`${payload.type === 'income' ? 'Income' : 'Expense'} added successfully.`);
    }
    resetForm();
  };

  const startEdit = (transaction) => {
    setEditingId(transaction.id);
    setForm({ ...transaction });
    setActiveSection('transactions');
    setToast(`Editing ${transaction.title}`);
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    if (editingId === id) resetForm();
    setToast('Transaction deleted.');
  };

  const handleBudgetSave = (event) => {
    event.preventDefault();
    setBudget(Number(budgetInput) || 0);
    setToast('Monthly budget updated.');
  };

  const handleExportExcel = async () => {
    await saveAsExcel(currentUser.name, filteredTransactions);
    setToast('Excel report exported.');
  };

  const handleExportPdf = async () => {
    await saveAsMonthlyPdf(currentUser.name, transactions);
    setToast('Monthly statement downloaded.');
  };

  const handleShareReport = async () => {
    const summary = [`${currentUser.name} report`, `Income: ${formatAmount(totalIncome)}`, `Expenses: ${formatAmount(totalExpenses)}`, `Savings: ${formatAmount(monthlySavings)}`, `Budget: ${budgetStatus}`].join('\n');
    if (navigator.share) await navigator.share({ title: 'Expance Report', text: summary });
    else if (navigator.clipboard) await navigator.clipboard.writeText(summary);
    setToast('Report summary ready to share.');
  };

  const handleSearchJump = () => {
    setActiveSection('transactions');
    setToast('Jumped to transaction search.');
  };

  const handleNotificationClick = () => {
    setActiveSection('budget');
    setToast(budgetStatus);
  };

  const handleCardAction = (action) => {
    if (action === 'Top Up') {
      setActiveSection('transactions');
      setForm((prev) => ({ ...prev, type: 'income', title: 'Wallet Top Up', category: 'Other', paymentMethod: 'Card' }));
      setToast('Top Up preset applied in the form.');
      return;
    }
    setActiveSection('transactions');
    setForm((prev) => ({ ...prev, type: 'expense', title: 'Transfer', category: 'Other', paymentMethod: 'Net Banking' }));
    setToast('Transfer preset applied in the form.');
  };

  const handleAddCardClick = () => {
    setActiveSection('reports');
    setToast('Virtual card slot added to your dashboard plan.');
  };

  const handleRefreshClick = () => {
    resetForm();
    setHistoryTypeFilter('all');
    setSearch('');
    setCategoryFilter('All');
    setDateFilter('');
    setToast('Dashboard widgets refreshed.');
  };

  const avatarSet = recentTransactions.slice(0, 5).map((item) => item.title.slice(0, 1).toUpperCase());

  return (
    <div className="min-h-screen bg-black px-2 py-3 text-white sm:px-4 sm:py-4 lg:px-8">
      <div className="mx-auto max-w-[1440px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(77,52,113,0.28),transparent_20%),radial-gradient(circle_at_top_right,rgba(80,120,255,0.08),transparent_22%),linear-gradient(180deg,#06070f_0%,#111322_100%)] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.62)] sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[64px_minmax(0,1fr)]">
          {mobileSidebarOpen ? (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            />
          ) : null}
          <aside className={`${mobileSidebarOpen ? 'flex' : 'hidden'} fixed inset-y-3 left-2 z-30 w-[84px] flex-col items-center justify-between rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,18,31,0.98),rgba(10,11,20,0.98))] px-2 py-4 shadow-2xl lg:static lg:flex lg:min-h-[820px] lg:w-auto lg:shadow-none`}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950">
                <WalletIcon className="h-5 w-5" />
              </div>
              <button type="button" onClick={handleRefreshClick} className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 lg:flex">
                <ArrowPathIcon className="h-4 w-4" />
              </button>
            </div>

            <nav className="grid grid-cols-1 gap-2">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => { setActiveSection(id); setMobileSidebarOpen(false); }}
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${activeSection === id ? 'border-white/20 bg-white/10 text-white' : 'border-transparent bg-transparent text-slate-500 hover:border-white/10 hover:bg-white/5 hover:text-slate-200'}`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </nav>

            <div className="flex flex-col items-center gap-2">
              <button type="button" onClick={() => { toggleTheme(); setToast(theme === 'dark' ? 'Light accents enabled.' : 'Dark accents enabled.'); }} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              <button type="button" onClick={logout} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                <UserCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </aside>

          <div className="space-y-3">
            <header className="flex flex-col gap-3 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,18,31,0.88),rgba(12,13,24,0.9))] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 lg:hidden"
                >
                  <Bars3BottomLeftIcon className="h-4 w-4" />
                </button>
                <p className="text-lg font-semibold">Expance</p>
                <span className="text-sm text-slate-500">Dashboard</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleSearchJump} className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-2 text-sm text-slate-400 transition hover:bg-white/10 sm:flex">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  Search insights
                </button>
                <button type="button" onClick={handleSearchJump} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={handleNotificationClick} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                  <BellIcon className="h-4 w-4" />
                </button>
              </div>
            </header>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.18fr_0.96fr_0.95fr]">
              <ShellCard title="Total balance" className="min-h-[260px]">
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <p className="text-[42px] font-semibold leading-none">{formatCompact(remainingBalance)} <span className="text-lg text-slate-400">INR</span></p>
                    <div className="mt-4 inline-flex items-center rounded-xl bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">
                      Earnings +{totalIncome ? ((monthlySavings / totalIncome) * 100).toFixed(1) : '0'}%
                    </div>
                  </div>
                  <div className="h-[120px]">
                    <Line data={lineData} options={lineOptions} />
                  </div>
                </div>
              </ShellCard>

              <ShellCard title="Top spending" className="min-h-[260px]">
                <div className="grid h-full gap-4 sm:grid-cols-[0.95fr_1.05fr] sm:items-center">
                  <div className="mx-auto h-[150px] w-[150px] sm:h-[180px] sm:w-[180px]">
                    <Doughnut data={spendingRingData} options={{ responsive: true, cutout: '72%', plugins: { legend: { display: false } } }} />
                  </div>
                  <div className="space-y-3">
                    <p className="text-3xl font-semibold text-white">{formatAmount(monthlyExpenses)}</p>
                    {ringSource.map((item, index) => (
                      <div key={item.category} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${['bg-violet-400','bg-sky-400','bg-pink-300','bg-indigo-300'][index]}`} />
                          <span className="text-slate-300">{item.category}</span>
                        </div>
                        <span className="text-slate-500">{formatAmount(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ShellCard>

              <div className="grid gap-3 md:col-span-2 md:grid-cols-[1fr_88px] xl:col-span-1 xl:grid-cols-[1fr_74px]">
                <ShellCard title="Cards" className="min-h-[260px]">
                  <div className="space-y-4">
                    <div className="rounded-[24px] bg-[linear-gradient(135deg,#8b5cf6_0%,#a78bfa_52%,#d8b4fe_100%)] p-4 text-white shadow-[0_20px_40px_rgba(139,92,246,0.32)]">
                      <div className="flex items-start justify-between">
                        <span className="rounded-full bg-white/20 px-2 py-1 text-[11px]">Expense Bank</span>
                        <span className="h-5 w-5 rounded-full border border-white/40 bg-white/30" />
                      </div>
                      <p className="mt-8 break-all text-base tracking-[0.18em] sm:text-xl sm:tracking-[0.22em]">8765 4562 6612 0123</p>
                      <div className="mt-5 flex items-center justify-between text-xs text-white/80">
                        <div>
                          <p>Card Holder</p>
                          <p className="mt-1 text-sm font-medium text-white">{currentUser.name}</p>
                        </div>
                        <div>
                          <p>Expiry</p>
                          <p className="mt-1 text-sm font-medium text-white">02/30</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['Top Up', 'Transfer'].map((item) => (
                        <button type="button" key={item} onClick={() => handleCardAction(item)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10">{item}</button>
                      ))}
                    </div>
                  </div>
                </ShellCard>
                <button type="button" onClick={handleAddCardClick} className="flex min-h-[96px] flex-row items-center justify-center gap-3 rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,19,37,0.96),rgba(11,13,25,0.94))] text-slate-400 transition hover:bg-white/[0.06] md:min-h-[260px] md:flex-col">
                  <span className="text-3xl">+</span>
                  <span className="text-xs tracking-[0.3em] md:mt-2 md:rotate-90 md:text-sm">ADD</span>
                </button>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.18fr_0.96fr_0.95fr]">
              <ShellCard title="Budget" action={<button type="button" onClick={() => setActiveSection('budget')} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:bg-white/10">Open</button>} className="min-h-[220px]">
                <div className="h-[150px]">
                  <Bar data={budgetBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8f94ab' } } }, scales: { x: { ticks: { color: '#71768f' }, grid: { display: false } }, y: { ticks: { color: '#71768f' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} />
                </div>
              </ShellCard>

              <ShellCard
                title="Monthly analytics"
                action={
                  <button
                    type="button"
                    onClick={() => setActiveSection('reports')}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 transition hover:bg-white/10"
                  >
                    Open
                  </button>
                }
                className="min-h-[220px]"
              >
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TinyStat label="Active Month" value={monthlyLabel} accent="text-white" />
                    <TinyStat
                      label="Income vs Spent"
                      value={incomeSpentLabel}
                      accent="text-sky-300"
                    />
                  </div>
                  <div className="h-[150px]">
                    <Line
                      data={{
                        labels: monthlyTrend.map((item) => item.label),
                        datasets: [
                          {
                            label: 'Income',
                            data: monthlyTrend.map((item) => item.income),
                            borderColor: '#7dd3fc',
                            tension: 0.4,
                            borderWidth: 2,
                            pointRadius: 2,
                          },
                          {
                            label: 'Expense',
                            data: monthlyTrend.map((item) => item.expense),
                            borderColor: '#f9a8d4',
                            tension: 0.4,
                            borderWidth: 2,
                            pointRadius: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: '#8f94ab' } } },
                        scales: {
                          x: { ticks: { color: '#71768f' }, grid: { display: false } },
                          y: {
                            ticks: { color: '#71768f' },
                            grid: { color: 'rgba(255,255,255,0.05)' },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </ShellCard>

              <ShellCard title="Transaction history" action={<button type="button" onClick={() => { setHistoryTypeFilter('all'); setToast('Quick history reset to all transactions.'); }} className="text-xs text-slate-500 transition hover:text-slate-300">Filter</button>} className="min-h-[220px]">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { label: 'All', value: 'all' },
                      { label: 'Income', value: 'income' },
                      { label: 'Spending', value: 'expense' },
                    ].map((item) => (
                      <button type="button" key={item.value} onClick={() => setHistoryTypeFilter(item.value)} className={`rounded-full px-3 py-1 transition ${historyTypeFilter === item.value ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}>{item.label}</button>
                    ))}
                  </div>
                                    {quickHistoryTransactions.length ? (
                    quickHistoryTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex flex-col gap-3 rounded-2xl bg-white/[0.03] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-slate-200">
                            {transaction.title.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-slate-100">{transaction.title}</p>
                            <p className="mt-1 text-[11px] text-slate-500">{transaction.date} • {transaction.category}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>{transaction.type === 'income' ? '+' : '-'}{formatCompact(transaction.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 px-3 py-6 text-center text-sm text-slate-500">
                      No transactions match this quick filter.
                    </div>
                  )}
                </div>
              </ShellCard>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.18fr_0.96fr_0.95fr]">
              <ShellCard title="Performance" className="min-h-[160px]">
                <div className="grid gap-4 md:grid-cols-[1fr_1.2fr] md:items-end">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <TinyStat label="Transactions" value={String(transactions.length)} accent="text-white" />
                    <TinyStat label="Success rate" value={`${Math.max(84, Math.min(99, 100 - Math.round((weeklyExpenses / Math.max(totalIncome, 1)) * 10)))}%`} accent="text-emerald-300" />
                    <TinyStat label="Alerts" value={monthlyExpenses > currentUser.budget && currentUser.budget ? '3' : '1'} accent="text-pink-300" />
                  </div>
                  <div className="h-[90px]">
                    <Line data={{ labels: monthlyTrend.map((item) => item.label), datasets: [{ data: monthlyTrend.map((item) => item.expense || item.income / 2), borderColor: '#ffffff', tension: 0.42, borderWidth: 2, pointRadius: 2 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#71768f' }, grid: { display: false } }, y: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.04)' } } } }} />
                  </div>
                </div>
              </ShellCard>

              <ShellCard title="Category radar" className="min-h-[160px]">
                <div className="mx-auto h-[120px] max-w-[220px]">
                  <PolarArea data={polarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.08)' }, angleLines: { color: 'rgba(255,255,255,0.06)' } } } }} />
                </div>
              </ShellCard>

              <ShellCard title="Quick transfer" className="min-h-[160px]">
                <div className="space-y-4">
                  <div className="flex -space-x-3">
                    {avatarSet.map((avatar, index) => (
                      <div key={`${avatar}-${index}`} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#121424] bg-gradient-to-br from-slate-100 to-violet-200 text-sm font-semibold text-slate-900">{avatar}</div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <span>Ready to send monthly summary</span>
                    <button type="button" onClick={handleShareReport} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20">Share</button>
                  </div>
                </div>
              </ShellCard>
            </section>

            <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,18,31,0.88),rgba(12,13,24,0.92))] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">Management workspace</p>
                  <p className="mt-1 text-sm text-slate-500">The dashboard stays fully dark, all controls are interactive, and the cards adapt better to real expense data.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {navItems.map(({ id, label }) => (
                    <button key={id} type="button" onClick={() => { setActiveSection(id); setMobileSidebarOpen(false); }} className={`rounded-full px-4 py-2 text-sm transition ${activeSection === id ? 'bg-white text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>{label}</button>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="space-y-4">
                  {(activeSection === 'overview' || activeSection === 'transactions') && (
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-white">{editingId ? 'Edit transaction' : 'Add transaction'}</p>
                          <p className="text-sm text-slate-500">Income and expenses share one form.</p>
                        </div>
                        {editingId ? <button type="button" onClick={resetForm} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10">Reset</button> : null}
                      </div>
                      <form className="grid gap-3 md:grid-cols-2" onSubmit={handleTransactionSubmit}>
                        <select value={form.type} onChange={(event) => setFormField('type', event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none"><option value="expense">Expense</option><option value="income">Income</option></select>
                        <input required value={form.title} onChange={(event) => setFormField('title', event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none" placeholder="Expense title" />
                        <input required min="0" type="number" value={form.amount} onChange={(event) => setFormField('amount', event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none" placeholder="Amount" />
                        <select value={form.category} onChange={(event) => setFormField('category', event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none">{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                        <input required type="date" value={form.date} onChange={(event) => setFormField('date', event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none" />
                        <select value={form.paymentMethod} onChange={(event) => setFormField('paymentMethod', event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none">{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select>
                        <textarea rows="4" value={form.notes} onChange={(event) => setFormField('notes', event.target.value)} className="md:col-span-2 rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none" placeholder="Notes / Description" />
                        {formError ? (
                          <div className="md:col-span-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                            {formError}
                          </div>
                        ) : null}
                        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"><PlusIcon className="h-4 w-4" />{editingId ? 'Update transaction' : 'Save transaction'}</button>
                      </form>
                    </div>
                  )}

                  {(activeSection === 'overview' || activeSection === 'transactions') && (
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="mb-4 grid gap-3 md:grid-cols-3">
                        <input value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none" placeholder="Search transactions" />
                        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none"><option value="All">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select>
                        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none" />
                      </div>
                      <div className="overflow-x-auto rounded-[18px] border border-white/8">
                        <table className="min-w-full text-left text-sm text-slate-300">
                          <thead className="bg-white/5 text-slate-500"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Actions</th></tr></thead>
                          <tbody>
                            {filteredTransactions.map((transaction) => (
                              <tr key={transaction.id} className="border-t border-white/8">
                                <td className="px-4 py-4"><p className="text-white">{transaction.title}</p><p className="mt-1 text-xs text-slate-500">{transaction.notes || 'No notes'}</p></td>
                                <td className="px-4 py-4">{transaction.category}</td>
                                <td className="px-4 py-4">{transaction.date}</td>
                                <td className="px-4 py-4">{transaction.paymentMethod}</td>
                                <td className={`px-4 py-4 font-semibold ${transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>{transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}</td>
                                <td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={() => startEdit(transaction)} className="rounded-xl border border-white/10 p-2 transition hover:bg-white/10"><PencilSquareIcon className="h-4 w-4" /></button><button type="button" onClick={() => handleDelete(transaction.id)} className="rounded-xl border border-rose-400/20 p-2 text-rose-300 transition hover:bg-rose-400/10"><TrashIcon className="h-4 w-4" /></button></div></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {(activeSection === 'overview' || activeSection === 'reports') && (
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-base font-semibold text-white">Reports center</p>
                          <p className="text-sm text-slate-500">Weekly report, monthly report, export and share actions.</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"><ArrowDownTrayIcon className="h-4 w-4" />Excel</button>
                          <button type="button" onClick={handleExportPdf} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"><BanknotesIcon className="h-4 w-4" />PDF</button>
                          <button type="button" onClick={handleShareReport} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"><ShareIcon className="h-4 w-4" />Share</button>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <TinyStat label="Weekly" value={formatAmount(weeklyExpenses)} accent="text-sky-300" />
                        <TinyStat label={`Monthly (${monthlyLabel})`} value={formatAmount(monthlyExpenses)} accent="text-pink-300" />
                        <TinyStat label="Savings" value={formatAmount(monthlySavings)} accent="text-emerald-300" />
                      </div>
                      <div className="mt-4 h-[220px]"><Bar data={reportBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#71768f' }, grid: { display: false } }, y: { ticks: { color: '#71768f' }, grid: { color: 'rgba(255,255,255,0.05)' } } } }} /></div>
                    </div>
                  )}

                  {(activeSection === 'overview' || activeSection === 'budget') && (
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-base font-semibold text-white">Budget planner</p>
                      <p className="mt-1 text-sm text-slate-500">Monthly budget alerts and overspending warnings.</p>
                      <form className="mt-4 space-y-3" onSubmit={handleBudgetSave}>
                        <input type="number" min="0" value={budgetInput} onChange={(event) => setBudgetInput(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#15182d] px-4 py-3 text-slate-200 outline-none" placeholder="Set monthly budget" />
                        <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950">Save budget</button>
                      </form>
                      <div className="mt-4 rounded-[18px] border border-white/8 bg-[#13172a] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">Usage this month</p>
                            <p className="mt-2 text-2xl font-semibold text-white">{currentUser.budget ? `${budgetUsage.toFixed(0)}%` : '0%'}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-300">{formatAmount(monthlyExpenses)} / {formatAmount(currentUser.budget)}</div>
                        </div>
                        <div className="mt-4 h-3 rounded-full bg-white/10"><div className={`h-3 rounded-full ${monthlyExpenses > currentUser.budget ? 'bg-rose-400' : monthlyExpenses > currentUser.budget * 0.85 ? 'bg-amber-300' : 'bg-emerald-300'}`} style={{ width: `${currentUser.budget ? budgetUsage : 0}%` }} /></div>
                        <p className="mt-4 text-sm text-slate-400">{budgetStatus}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {toast ? <div className="fixed bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-[#0f1325] px-4 py-3 text-sm text-white shadow-2xl sm:left-auto sm:right-4 sm:w-auto">{toast}</div> : null}
    </div>
  );
}





















