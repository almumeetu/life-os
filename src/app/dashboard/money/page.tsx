import Link from "next/link";
import Image from "next/image";
import { ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, CreditCard, Landmark, Plus, ReceiptText, Trash2, WalletCards } from "lucide-react";
import { CardImageInput } from "@/components/card-image-input";
import { MoneyPaymentPicker } from "@/components/money-payment-picker";
import { RouteNotice } from "@/components/route-notice";
import { Badge, EmptyState, MetricCard, PageHeader, Panel, SubmitButton } from "@/components/ui";
import { deleteFinancialAccount, deleteMoneyCategory, deleteMoneyTransaction, deletePaymentCard, saveFinancialAccount, saveMoneyCategory, saveMoneyTransaction, savePaymentCard } from "@/lib/actions/money";
import { formatMoney } from "@/lib/constants";
import { ensureUserDefaults } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

const moneyTabs = [
  ["overview", "Overview"], ["transactions", "Transactions"], ["categories", "Categories"], ["accounts", "Accounts"], ["cards", "Cards"],
] as const;
type Tab = typeof moneyTabs[number][0];
type SearchParams = Promise<{ tab?: string; month?: string; editTransaction?: string; editAccount?: string; editCard?: string; message?: string; tone?: string }>;
type CategoryRecord = { id: string; name: string; color: string };
type AccountRecord = { id: string; name: string; institution: string; kind: string; last4: string; openingBalanceCents: number; currency: string };
type CardRecord = { id: string; name: string; kind: string; network: string; last4: string; accountId: string | null; imageData: string | null };
type TransactionRecord = { id: string; kind: string; amountCents: number; description: string; note: string; occurredAt: Date; categoryId: string; category: { id: string; name: string }; account: { id: string; name: string } | null; card: { id: string; name: string; last4: string } | null };

function validMonth(value?: string) { return value && /^\d{4}-\d{2}$/.test(value) ? value : new Date().toISOString().slice(0, 7); }
function dateInput(date?: Date | null) { return date ? date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10); }
function tabHref(tab: Tab, month: string) { return `/dashboard/money?tab=${tab}&month=${month}`; }
function valueDollars(cents: number) { return (cents / 100).toFixed(2); }

export default async function MoneyPage({ searchParams }: { searchParams: SearchParams }) {
  const [user, query] = await Promise.all([requireCurrentUser(), searchParams]);
  await ensureUserDefaults(user.id);
  const tab = moneyTabs.some(([key]) => key === query.tab) ? query.tab as Tab : "overview";
  const month = validMonth(query.month);
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  const [categories, accounts, cards, monthTransactions, accountFlows, transactionCount, income, expenses, editingTransaction, editingAccount, editingCard] = await Promise.all([
    prisma.moneyCategory.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.financialAccount.findMany({ where: { userId: user.id }, orderBy: [{ kind: "asc" }, { name: "asc" }] }),
    prisma.paymentCard.findMany({ where: { userId: user.id }, include: { account: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.moneyTransaction.findMany({ where: { userId: user.id, occurredAt: { gte: start, lt: end } }, include: { category: true, account: { select: { id: true, name: true } }, card: { select: { id: true, name: true, last4: true } } }, orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }] }),
    prisma.moneyTransaction.groupBy({ by: ["accountId", "kind"], where: { userId: user.id, accountId: { not: null } }, _sum: { amountCents: true } }),
    prisma.moneyTransaction.count({ where: { userId: user.id, occurredAt: { gte: start, lt: end } } }),
    prisma.moneyTransaction.aggregate({ where: { userId: user.id, kind: "Income", occurredAt: { gte: start, lt: end } }, _sum: { amountCents: true } }),
    prisma.moneyTransaction.aggregate({ where: { userId: user.id, kind: "Expense", occurredAt: { gte: start, lt: end } }, _sum: { amountCents: true } }),
    query.editTransaction ? prisma.moneyTransaction.findFirst({ where: { id: query.editTransaction, userId: user.id } }) : Promise.resolve(null),
    query.editAccount ? prisma.financialAccount.findFirst({ where: { id: query.editAccount, userId: user.id } }) : Promise.resolve(null),
    query.editCard ? prisma.paymentCard.findFirst({ where: { id: query.editCard, userId: user.id } }) : Promise.resolve(null),
  ]);
  const incomeCents = income._sum.amountCents || 0;
  const expenseCents = expenses._sum.amountCents || 0;
  const accountBalance = new Map(accounts.map((account) => [account.id, account.openingBalanceCents]));
  for (const flow of accountFlows) {
    if (!flow.accountId) continue;
    const current = accountBalance.get(flow.accountId) || 0;
    const amount = flow._sum.amountCents || 0;
    accountBalance.set(flow.accountId, current + (flow.kind === "Income" ? amount : -amount));
  }
  const categoryTotals = new Map<string, number>();
  for (const transaction of monthTransactions) if (transaction.kind === "Expense") categoryTotals.set(transaction.categoryId, (categoryTotals.get(transaction.categoryId) || 0) + transaction.amountCents);
  const monthLabel = new Intl.DateTimeFormat("en-BD", { month: "long", year: "numeric" }).format(start);

  return <>
    <PageHeader eyebrow="A CLEARER VIEW OF YOUR MONEY" title="Money" description="Track transactions, accounts, categories and cards in one place." actions={<span className="badge"><WalletCards size={12} /> {accounts.length} account{accounts.length === 1 ? "" : "s"}</span>} />
    <RouteNotice searchParams={searchParams} />
    <nav className="section-tabs" aria-label="Money sections">{moneyTabs.map(([key, label]) => <Link className={`section-tab ${tab === key ? "active" : ""}`} aria-current={tab === key ? "page" : undefined} href={tabHref(key, month)} key={key}>{label}</Link>)}</nav>
    <div className="money-period-row"><div><b>{monthLabel}</b><small> · Change the period to review another month</small></div><form method="get" className="period-form"><input type="hidden" name="tab" value={tab} /><input className="input" type="month" name="month" defaultValue={month} aria-label="Choose month" /><button className="button button-secondary button-small" type="submit">Go</button></form></div>
    <div className="money-summary">
      <MetricCard label="Income" value={formatMoney(incomeCents)} note="Money received" icon={<ArrowDownLeft size={15} />} tone="positive-value" />
      <MetricCard label="Expenses" value={formatMoney(expenseCents)} note="Money spent" icon={<ArrowUpRight size={15} />} tone="negative-value" />
      <MetricCard label="Net for month" value={formatMoney(incomeCents - expenseCents)} note="Income minus expenses" icon={<ArrowLeftRight size={15} />} />
      <MetricCard label="Transactions" value={transactionCount} note="For the selected month" icon={<ReceiptText size={15} />} />
    </div>

    {tab === "overview" && <MoneyOverview month={month} transactions={monthTransactions} categories={categories} accounts={accounts} cards={cards} balances={accountBalance} categoryTotals={categoryTotals} />}
    {tab === "transactions" && <TransactionsView month={month} transactions={monthTransactions} categories={categories} accounts={accounts} cards={cards} editing={editingTransaction} />}
    {tab === "categories" && <CategoriesView categories={categories} categoryTotals={categoryTotals} />}
    {tab === "accounts" && <AccountsView accounts={accounts} balances={accountBalance} editing={editingAccount} />}
    {tab === "cards" && <CardsView cards={cards} accounts={accounts} editing={editingCard} />}
  </>;
}

function MoneyOverview({ month, transactions, categories, accounts, cards, balances, categoryTotals }: { month: string; transactions: TransactionRecord[]; categories: CategoryRecord[]; accounts: AccountRecord[]; cards: CardRecord[]; balances: Map<string, number>; categoryTotals: Map<string, number> }) {
  const topCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const largest = topCategories[0]?.[1] || 1;
  return <div className="stack money-content">
    <Panel title="Your accounts" subtitle="Current balances include the opening balance and saved transactions" action={<Link className="text-link" href={tabHref("accounts", month)}>Manage accounts <ArrowRight size={13} /></Link>}>
      {accounts.length ? <div className="account-grid">{accounts.slice(0, 3).map((account) => <div className="account-card" key={account.id}><div className="account-card-top"><span className="account-mark"><Landmark size={16} /></span><Badge>{account.kind}</Badge></div><b className="account-balance">{formatMoney(balances.get(account.id) || 0, account.currency)}</b><small>{account.name}{account.institution ? ` · ${account.institution}` : ""}{account.last4 ? ` · •••• ${account.last4}` : ""}</small></div>)}</div> : <EmptyState title="Add your first account" description="Start with cash, a bank account or a mobile wallet." icon={<Landmark size={17} />} />}
    </Panel>
    <div className="dashboard-grid">
      <Panel title="Spending by category" subtitle={`Expenses in ${new Intl.DateTimeFormat("en-BD", { month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00`))}`} action={<Link className="text-link" href={tabHref("categories", month)}>Manage <ArrowRight size={13} /></Link>}>
        {topCategories.length ? topCategories.map(([id, amount]) => { const category = categories.find((item) => item.id === id); return <div className="category-line" key={id}><b>{category?.name || "Other"}</b><div className="progress-track"><i style={{ width: `${Math.round(amount / largest * 100)}%` }} /></div><small>{formatMoney(amount)}</small></div>; }) : <EmptyState title="No spending yet" description="Add an expense to see the breakdown here." icon={<ArrowUpRight size={17} />} />}
      </Panel>
      <Panel title="Your cards" subtitle="Cards available for transactions" action={<Link className="text-link" href={tabHref("cards", month)}>Manage <ArrowRight size={13} /></Link>}>
        {cards.length ? <div className="list">{cards.slice(0, 3).map((card) => <div className="list-row" key={card.id}><span className="panel-icon"><CreditCard size={15} /></span><div className="list-main"><b>{card.name}</b><small>{card.kind}{card.last4 ? ` · •••• ${card.last4}` : ""}</small></div></div>)}</div> : <EmptyState title="No cards yet" description="Add a card if you want to attach it to an expense." icon={<CreditCard size={17} />} />}
      </Panel>
    </div>
    <Panel title="Recent transactions" subtitle={`${transactions.length} entries · ${new Intl.DateTimeFormat("en-BD", { month: "long", year: "numeric" }).format(new Date(`${month}-01T12:00:00`))}`} action={<Link className="text-link" href={tabHref("transactions", month)}>All transactions <ArrowRight size={13} /></Link>}>
      <TransactionTable transactions={transactions.slice(0, 7)} month={month} />
    </Panel>
  </div>;
}

function TransactionForm({ month, categories, accounts, cards, editing }: { month: string; categories: CategoryRecord[]; accounts: AccountRecord[]; cards: CardRecord[]; editing: { id: string; kind: string; amountCents: number; categoryId: string; accountId: string | null; cardId: string | null; description: string; occurredAt: Date; note: string } | null }) {
  return <Panel title={editing ? "Edit transaction" : "Add a transaction"} subtitle="Enter the amount, type and category; add account or card details when useful.">
    <form action={saveMoneyTransaction}>
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <div className="form-grid">
        <label className="form-field col-6"><span>Description</span><input className="input" name="description" required maxLength={160} defaultValue={editing?.description} placeholder="e.g. Groceries, salary or IELTS fee" /></label>
        <label className="form-field col-3"><span>Amount (৳)</span><input className="input" name="amount" type="number" inputMode="decimal" min="0.01" max="20000000" step="0.01" required defaultValue={editing ? valueDollars(editing.amountCents) : ""} placeholder="0.00" /></label>
        <label className="form-field col-3"><span>Type</span><select className="select" name="kind" defaultValue={editing?.kind || "Expense"}><option>Expense</option><option>Income</option></select></label>
        <label className="form-field col-3"><span>Category</span><select className="select" name="categoryId" required defaultValue={editing?.categoryId || categories[0]?.id}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <MoneyPaymentPicker accounts={accounts.map(({ id, name, kind }) => ({ id, name, kind }))} cards={cards.map(({ id, name, last4, accountId }) => ({ id, name, last4, accountId }))} initialAccountId={editing?.accountId || accounts.find((account) => account.name === "Cash wallet")?.id || accounts[0]?.id || ""} initialCardId={editing?.cardId || ""} />
        <label className="form-field col-3"><span>Date</span><input className="input" name="occurredAt" type="date" required defaultValue={dateInput(editing?.occurredAt || new Date(`${month}-01T12:00:00Z`))} /></label>
        <label className="form-field col-12"><span>Note</span><input className="input" name="note" maxLength={1200} defaultValue={editing?.note} placeholder="Optional note, reference or context" /></label>
      </div>
      <div className="form-actions"><SubmitButton>{editing ? "Save transaction" : <><Plus size={14} />Save transaction</>}</SubmitButton>{editing && <Link className="button button-secondary" href={tabHref("transactions", month)}>Cancel</Link>}</div>
    </form>
  </Panel>;
}

function TransactionsView({ month, transactions, categories, accounts, cards, editing }: { month: string; transactions: TransactionRecord[]; categories: CategoryRecord[]; accounts: AccountRecord[]; cards: CardRecord[]; editing: { id: string; kind: string; amountCents: number; categoryId: string; accountId: string | null; cardId: string | null; description: string; occurredAt: Date; note: string } | null }) {
  return <div className="stack money-content"><TransactionForm month={month} categories={categories} accounts={accounts} cards={cards} editing={editing} /><Panel title="Transaction history" subtitle={`${transactions.length} entries for the selected month`}><TransactionTable transactions={transactions} month={month} /></Panel></div>;
}

function TransactionTable({ transactions, month }: { transactions: TransactionRecord[]; month: string }) {
  if (!transactions.length) return <EmptyState title="No transactions in this month" description="Add an income or expense above to get started." icon={<ReceiptText size={17} />} />;
  return <div className="table-wrap"><table className="data-table"><thead><tr><th>Transaction</th><th>Category</th><th>Account / card</th><th>Date</th><th>Amount</th><th>Actions</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id}><td><b>{transaction.description}</b>{transaction.note && <small className="table-note">{transaction.note}</small>}</td><td>{transaction.category.name}</td><td>{transaction.account?.name || "Cash / unassigned"}{transaction.card && <small className="table-note">{transaction.card.name}{transaction.card.last4 ? ` · •••• ${transaction.card.last4}` : ""}</small>}</td><td>{new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short" }).format(transaction.occurredAt)}</td><td className={transaction.kind === "Income" ? "positive-value" : "negative-value"}>{transaction.kind === "Income" ? "+" : "−"}{formatMoney(transaction.amountCents)}</td><td><div className="table-actions"><Link className="button button-quiet button-small" href={`${tabHref("transactions", month)}&editTransaction=${transaction.id}`}>Edit</Link><form action={deleteMoneyTransaction}><input type="hidden" name="id" value={transaction.id} /><button className="icon-button row-delete" type="submit" aria-label={`Delete ${transaction.description}`}><Trash2 size={13} /></button></form></div></td></tr>)}</tbody></table></div>;
}

function CategoriesView({ categories, categoryTotals }: { categories: CategoryRecord[]; categoryTotals: Map<string, number> }) {
  return <div className="dashboard-grid money-content">
    <Panel title="Manage categories" subtitle="Rename categories or create a category that fits your life.">
      <form action={saveMoneyCategory} className="inline-form"><input className="input" name="name" required minLength={2} maxLength={60} placeholder="New category" /><SubmitButton><Plus size={14} />Add category</SubmitButton></form>
      <div className="category-manage-list">{categories.map((category) => <div className="category-manage-row" key={category.id}><form action={saveMoneyCategory} className="inline-form"><input type="hidden" name="id" value={category.id} /><input className="input" name="name" required minLength={2} maxLength={60} defaultValue={category.name} aria-label={`Rename ${category.name}`} /><button className="button button-secondary button-small" type="submit">Save</button></form><small>{formatMoney(categoryTotals.get(category.id) || 0)} this month</small>{category.name !== "Other" && <form action={deleteMoneyCategory}><input type="hidden" name="id" value={category.id} /><button className="icon-button row-delete" type="submit" aria-label={`Delete ${category.name}`}><Trash2 size={14} /></button></form>}</div>)}</div>
    </Panel>
    <Panel title="Where your money goes" subtitle="Monthly spending by category">
      {categories.map((category) => <div className="category-line" key={category.id}><b>{category.name}</b><div className="progress-track"><i style={{ width: `${Math.min(100, (categoryTotals.get(category.id) || 0) / Math.max(1, ...categoryTotals.values()) * 100)}%` }} /></div><small>{formatMoney(categoryTotals.get(category.id) || 0)}</small></div>)}
    </Panel>
  </div>;
}

function AccountsView({ accounts, balances, editing }: { accounts: AccountRecord[]; balances: Map<string, number>; editing: AccountRecord | null }) {
  return <div className="stack money-content">
    <Panel title={editing ? "Edit account" : "Add an account"} subtitle="Track a bank account, mobile wallet, savings account or cash balance. Use only the last four digits.">
      <form action={saveFinancialAccount}>{editing && <input type="hidden" name="id" value={editing.id} />}<div className="form-grid">
        <label className="form-field col-4"><span>Account name</span><input className="input" name="name" required minLength={2} maxLength={80} defaultValue={editing?.name} placeholder="e.g. Salary account" /></label>
        <label className="form-field col-4"><span>Bank or provider</span><input className="input" name="institution" maxLength={100} defaultValue={editing?.institution} placeholder="e.g. City Bank" /></label>
        <label className="form-field col-4"><span>Account type</span><select className="select" name="kind" defaultValue={editing?.kind || "Bank"}>{["Bank", "Mobile wallet", "Cash", "Savings", "Other"].map((kind) => <option key={kind}>{kind}</option>)}</select></label>
        <label className="form-field col-4"><span>Last four digits</span><input className="input" name="last4" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" defaultValue={editing?.last4} placeholder="Optional" /></label>
        <label className="form-field col-4"><span>Opening balance (৳)</span><input className="input" name="openingBalance" type="number" min="-20000000" max="20000000" step="0.01" defaultValue={editing ? valueDollars(editing.openingBalanceCents) : "0.00"} /></label>
        <div className="form-actions col-4"><SubmitButton>{editing ? "Save account" : <><Plus size={14} />Add account</>}</SubmitButton>{editing && <Link className="button button-secondary" href="/dashboard/money?tab=accounts">Cancel</Link>}</div>
      </div></form>
    </Panel>
    <Panel title="Your accounts" subtitle="Current balance = opening balance + income − expenses">
      {accounts.length ? <div className="account-grid">{accounts.map((account) => <article className="account-card" key={account.id}><div className="account-card-top"><span className="account-mark"><Landmark size={16} /></span><Badge>{account.kind}</Badge></div><b className="account-balance">{formatMoney(balances.get(account.id) || 0, account.currency)}</b><small>{account.name}{account.institution ? ` · ${account.institution}` : ""}{account.last4 ? ` · •••• ${account.last4}` : ""}</small><div className="account-actions"><Link className="button button-secondary button-small" href={`/dashboard/money?tab=accounts&editAccount=${account.id}`}>Edit</Link>{account.name !== "Cash wallet" && <form action={deleteFinancialAccount}><input type="hidden" name="id" value={account.id} /><button className="button button-quiet button-small danger-text" type="submit">Remove</button></form>}</div></article>)}</div> : <EmptyState title="No accounts yet" description="Add an account above to get started." icon={<Landmark size={17} />} />}
    </Panel>
  </div>;
}

function CardsView({ cards, accounts, editing }: { cards: CardRecord[]; accounts: AccountRecord[]; editing: CardRecord | null }) {
  return <div className="stack money-content">
    <Panel title={editing ? "Edit card" : "Add a card"} subtitle="Save a card nickname and optional image. Never enter a full card number or CVV.">
      <form action={savePaymentCard}>{editing && <input type="hidden" name="id" value={editing.id} />}<div className="form-grid">
        <label className="form-field col-4"><span>Card name</span><input className="input" name="name" required minLength={2} maxLength={80} defaultValue={editing?.name} placeholder="e.g. Everyday debit" /></label>
        <label className="form-field col-3"><span>Card type</span><select className="select" name="kind" defaultValue={editing?.kind || "Debit"}>{["Debit", "Credit", "Prepaid"].map((kind) => <option key={kind}>{kind}</option>)}</select></label>
        <label className="form-field col-2"><span>Network</span><input className="input" name="network" maxLength={40} defaultValue={editing?.network} placeholder="Visa" /></label>
        <label className="form-field col-3"><span>Last four digits</span><input className="input" name="last4" inputMode="numeric" maxLength={4} pattern="[0-9]{4}" defaultValue={editing?.last4} placeholder="Optional" /></label>
        <label className="form-field col-4"><span>Linked account</span><select className="select" name="accountId" defaultValue={editing?.accountId || ""}><option value="">No linked account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label>
        <div className="col-8"><CardImageInput initialImage={editing?.imageData || ""} /></div>
      </div><div className="form-actions"><SubmitButton>{editing ? "Save card" : <><Plus size={14} />Add card</>}</SubmitButton>{editing && <Link className="button button-secondary" href="/dashboard/money?tab=cards">Cancel</Link>}</div></form>
    </Panel>
    <Panel title="Your cards" subtitle={`${cards.length} saved payment method${cards.length === 1 ? "" : "s"}`}>
      {cards.length ? <div className="card-grid">{cards.map((card) => <article className="payment-card" key={card.id}>{card.imageData ? <Image unoptimized width={800} height={450} className="payment-card-image" src={card.imageData} alt={`${card.name} card image`} /> : <div className="payment-card-face"><span className="payment-card-brand">{card.network || "LIFE OS"}</span><div className="payment-card-meta"><div><b>{card.name}</b><small>{card.kind}{card.last4 ? ` · •••• ${card.last4}` : ""}</small></div><CreditCard size={20} /></div></div>}<div className="payment-card-meta below-image"><div><b>{card.name}</b><small>{card.kind} · {card.accountId ? accounts.find((account) => account.id === card.accountId)?.name || "Account" : "No linked account"}</small></div><div className="account-actions"><Link className="button button-quiet button-small" href={`/dashboard/money?tab=cards&editCard=${card.id}`}>Edit</Link><form action={deletePaymentCard}><input type="hidden" name="id" value={card.id} /><button className="button button-quiet button-small" type="submit">Remove</button></form></div></div></article>)}</div> : <EmptyState title="No cards yet" description="Add a card nickname and optional image. You can link it to an account and attach it to a transaction." icon={<CreditCard size={17} />} />}
    </Panel>
  </div>;
}
