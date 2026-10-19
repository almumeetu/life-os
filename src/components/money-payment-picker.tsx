"use client";

import { useMemo, useState } from "react";

type AccountOption = { id: string; name: string; kind: string };
type CardOption = { id: string; name: string; last4: string; accountId: string | null };

export function MoneyPaymentPicker({ accounts, cards, initialAccountId, initialCardId }: { accounts: AccountOption[]; cards: CardOption[]; initialAccountId: string; initialCardId: string }) {
  const [accountId, setAccountId] = useState(initialAccountId);
  const compatibleCards = useMemo(() => cards.filter((card) => !card.accountId || card.accountId === accountId), [cards, accountId]);
  const [cardId, setCardId] = useState(initialCardId && compatibleCards.some((card) => card.id === initialCardId) ? initialCardId : "");

  return <>
    <label className="form-field col-3"><span>Account</span><select className="select" name="accountId" value={accountId} onChange={(event) => { setAccountId(event.target.value); setCardId(""); }} required><option value="" disabled>Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.kind}</option>)}</select></label>
    <label className="form-field col-3"><span>Card</span><select className="select" name="cardId" value={cardId} onChange={(event) => setCardId(event.target.value)}><option value="">None / cash</option>{compatibleCards.map((card) => <option key={card.id} value={card.id}>{card.name}{card.last4 ? ` · •••• ${card.last4}` : ""}</option>)}</select></label>
  </>;
}
