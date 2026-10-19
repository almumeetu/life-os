"use client";

import { useMemo, useState } from "react";
import { translate, type Locale } from "@/lib/i18n";

type AccountOption = { id: string; name: string; kind: string };
type CardOption = { id: string; name: string; last4: string; accountId: string | null };

export function MoneyPaymentPicker({ accounts, cards, initialAccountId, initialCardId, locale }: { accounts: AccountOption[]; cards: CardOption[]; initialAccountId: string; initialCardId: string; locale: Locale }) {
  const t = (message: string) => translate(locale, message);
  const [accountId, setAccountId] = useState(initialAccountId);
  const compatibleCards = useMemo(() => cards.filter((card) => !card.accountId || card.accountId === accountId), [cards, accountId]);
  const [cardId, setCardId] = useState(initialCardId && compatibleCards.some((card) => card.id === initialCardId) ? initialCardId : "");

  return <>
    <label className="form-field col-3"><span>{t("Account")}</span><select className="select" name="accountId" value={accountId} onChange={(event) => { setAccountId(event.target.value); setCardId(""); }} required><option value="" disabled>{t("Select account")}</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {t(account.kind)}</option>)}</select></label>
    <label className="form-field col-3"><span>{t("Card")}</span><select className="select" name="cardId" value={cardId} onChange={(event) => setCardId(event.target.value)}><option value="">{t("None / cash")}</option>{compatibleCards.map((card) => <option key={card.id} value={card.id}>{card.name}{card.last4 ? ` · •••• ${card.last4}` : ""}</option>)}</select></label>
  </>;
}
