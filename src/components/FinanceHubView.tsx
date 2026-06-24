import React, { useState } from "react";
import { 
  PlusCircle, CreditCard, Laptop, Calendar, Trash2, Edit, Save, 
  Plus, Copy, Check, CheckCircle2, DollarSign, Clock, Key
} from "lucide-react";
import { BankInfo, Asset, Subscription } from "../types";

interface FinanceHubViewProps {
  banks: BankInfo[];
  assets: Asset[];
  subscriptions: Subscription[];
  onSaveBanks: (updated: BankInfo[]) => void;
  onSaveAssets: (updated: Asset[]) => void;
  onSaveSubscriptions: (updated: Subscription[]) => void;
}

export default function FinanceHubView({ 
  banks, assets, subscriptions, 
  onSaveBanks, onSaveAssets, onSaveSubscriptions 
}: FinanceHubViewProps) {

  const [activeSubTab, setActiveSubTab] = useState<"banks" | "assets" | "subs">("banks");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [bankForm, setBankForm] = useState<Partial<BankInfo>>({});
  const [assetForm, setAssetForm] = useState<Partial<Asset>>({});
  const [subForm, setSubForm] = useState<Partial<Subscription>>({});

  const startEditBank = (b: BankInfo) => {
    setBankForm({ ...b });
    setEditingId(b.id);
    setIsAddingNew(false);
  };

  const startAddBank = () => {
    setBankForm({ bankName: "", accountName: "", accountNumber: "", routingNumber: "", iban: "", swiftCode: "", type: "Checking" });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const startEditAsset = (a: Asset) => {
    setAssetForm({ ...a });
    setEditingId(a.id);
    setIsAddingNew(false);
  };

  const startAddAsset = () => {
    setAssetForm({ name: "", serialNumber: "", purchaseDate: "", cost: 0, warrantyExpiry: "", type: "Hardware" });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const startEditSub = (s: Subscription) => {
    setSubForm({ ...s });
    setEditingId(s.id);
    setIsAddingNew(false);
  };

  const startAddSub = () => {
    setSubForm({ serviceName: "", cost: 0, billingCycle: "Monthly", nextRenewal: "", active: true });
    setIsAddingNew(true);
    setEditingId(null);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountNumber) return;

    let updated: BankInfo[];
    if (isAddingNew) {
      const entry: BankInfo = {
        id: `bnk-${Date.now()}`,
        bankName: bankForm.bankName,
        accountName: bankForm.accountName || "",
        accountNumber: bankForm.accountNumber,
        routingNumber: bankForm.routingNumber || "",
        iban: bankForm.iban || "",
        swiftCode: bankForm.swiftCode || "",
        type: bankForm.type as any || "Checking"
      };
      updated = [...banks, entry];
    } else {
      updated = banks.map(b => b.id === editingId ? { ...b, ...bankForm } as BankInfo : b);
    }
    onSaveBanks(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDeleteBank = (id: string) => {
    if (confirm("Delete this bank info?")) {
      onSaveBanks(banks.filter(b => b.id !== id));
    }
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name) return;

    let updated: Asset[];
    if (isAddingNew) {
      const entry: Asset = {
        id: `ast-${Date.now()}`,
        name: assetForm.name,
        serialNumber: assetForm.serialNumber || "",
        purchaseDate: assetForm.purchaseDate || "",
        cost: Number(assetForm.cost) || 0,
        warrantyExpiry: assetForm.warrantyExpiry || "",
        type: assetForm.type as any || "Hardware"
      };
      updated = [...assets, entry];
    } else {
      updated = assets.map(a => a.id === editingId ? { ...a, ...assetForm } as Asset : a);
    }
    onSaveAssets(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("Delete this asset?")) {
      onSaveAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleSaveSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subForm.serviceName || !subForm.cost) return;

    let updated: Subscription[];
    if (isAddingNew) {
      const entry: Subscription = {
        id: `sub-${Date.now()}`,
        serviceName: subForm.serviceName,
        cost: Number(subForm.cost) || 0,
        billingCycle: subForm.billingCycle as any || "Monthly",
        nextRenewal: subForm.nextRenewal || "",
        active: subForm.active !== undefined ? subForm.active : true
      };
      updated = [...subscriptions, entry];
    } else {
      updated = subscriptions.map(s => s.id === editingId ? { ...s, ...subForm } as Subscription : s);
    }
    onSaveSubscriptions(updated);
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleDeleteSub = (id: string) => {
    if (confirm("Delete this subscription?")) {
      onSaveSubscriptions(subscriptions.filter(s => s.id !== id));
    }
  };

  // Monthly subscription cost calculator
  const totalMonthlySaaS = subscriptions
    .filter(s => s.active)
    .reduce((sum, s) => {
      if (s.billingCycle === "Monthly") return sum + s.cost;
      if (s.billingCycle === "Annual") return sum + (s.cost / 12);
      return sum;
    }, 0);

  return (
    <div className="space-y-6" id="finance-hub-pane">
      
      {/* Sub tabs selectors & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-2 space-y-2 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => { setActiveSubTab("banks"); setEditingId(null); setIsAddingNew(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeSubTab === "banks"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
            }`}
          >
            Bank Vault
          </button>
          <button
            onClick={() => { setActiveSubTab("assets"); setEditingId(null); setIsAddingNew(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeSubTab === "assets"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
            }`}
          >
            Asset Manager
          </button>
          <button
            onClick={() => { setActiveSubTab("subs"); setEditingId(null); setIsAddingNew(false); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              activeSubTab === "subs"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
            }`}
          >
            Subscription Tracker
          </button>
        </div>

        {!editingId && !isAddingNew && (
          <button
            onClick={() => {
              if (activeSubTab === "banks") startAddBank();
              else if (activeSubTab === "assets") startAddAsset();
              else startAddSub();
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-lg transition-all inline-flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {/* 1. BANK ACCOUNTS TAB */}
      {activeSubTab === "banks" && (
        <div className="space-y-4">
          {(editingId || isAddingNew) ? (
            <form onSubmit={handleSaveBank} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-2xl text-xs">
              <h3 className="font-bold">{isAddingNew ? "Add Bank Entry" : "Edit Bank Entry"}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Bank Name</label>
                  <input type="text" value={bankForm.bankName || ""} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Account Owner Name</label>
                  <input type="text" value={bankForm.accountName || ""} onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Account Number</label>
                  <input type="text" value={bankForm.accountNumber || ""} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Routing Number / Sort Code</label>
                  <input type="text" value={bankForm.routingNumber || ""} onChange={e => setBankForm({ ...bankForm, routingNumber: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">IBAN</label>
                  <input type="text" value={bankForm.iban || ""} onChange={e => setBankForm({ ...bankForm, iban: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">SWIFT / BIC Code</label>
                  <input type="text" value={bankForm.swiftCode || ""} onChange={e => setBankForm({ ...bankForm, swiftCode: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Account Type</label>
                  <select value={bankForm.type || "Checking"} onChange={e => setBankForm({ ...bankForm, type: e.target.value as any })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded">
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Details</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banks.map(b => (
                <div key={b.id} className="relative group overflow-hidden bg-neutral-900 text-white border border-neutral-850 p-6 rounded-2xl space-y-4 shadow-lg">
                  {/* Subtle visual card lines */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-bold tracking-wider font-serif uppercase">{b.bankName}</span>
                    </div>
                    <span className="text-[10px] bg-zinc-800 text-neutral-300 px-2 py-0.5 rounded-full uppercase font-mono">
                      {b.type}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-[10px] text-neutral-400">ACCOUNT HOLDER</p>
                    <p className="font-bold tracking-tight text-neutral-100">{b.accountName}</p>
                  </div>

                  {/* Account detail line copy widgets */}
                  <div className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-3.5 text-[10px] font-mono text-zinc-400">
                    <div className="space-y-1">
                      <p className="text-[9px] text-neutral-500">ACCOUNT NO</p>
                      <button 
                        onClick={() => handleCopyText(b.accountNumber, `${b.id}-acc`)}
                        className="flex items-center space-x-1.5 hover:text-white"
                      >
                        <span className="truncate max-w-[100px]">{b.accountNumber}</span>
                        {copiedId === `${b.id}-acc` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    {b.routingNumber && (
                      <div className="space-y-1">
                        <p className="text-[9px] text-neutral-500">ROUTING / SORT</p>
                        <button 
                          onClick={() => handleCopyText(b.routingNumber!, `${b.id}-rt`)}
                          className="flex items-center space-x-1.5 hover:text-white"
                        >
                          <span className="truncate max-w-[100px]">{b.routingNumber}</span>
                          {copiedId === `${b.id}-rt` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}

                    {b.iban && (
                      <div className="space-y-1 col-span-2">
                        <p className="text-[9px] text-neutral-500">IBAN</p>
                        <button 
                          onClick={() => handleCopyText(b.iban!, `${b.id}-ib`)}
                          className="flex items-center space-x-1.5 hover:text-white w-full justify-start"
                        >
                          <span className="truncate max-w-[200px]">{b.iban}</span>
                          {copiedId === `${b.id}-ib` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions overlay menu */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditBank(b)} className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-neutral-300">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteBank(b.id)} className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ASSET MANAGER TAB */}
      {activeSubTab === "assets" && (
        <div className="space-y-4">
          {(editingId || isAddingNew) ? (
            <form onSubmit={handleSaveAsset} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-2xl text-xs">
              <h3 className="font-bold">{isAddingNew ? "Add Asset Entry" : "Edit Asset Details"}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Asset Name</label>
                  <input type="text" placeholder="e.g. MacBook Pro M3" value={assetForm.name || ""} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Serial Number / License Key</label>
                  <input type="text" value={assetForm.serialNumber || ""} onChange={e => setAssetForm({ ...assetForm, serialNumber: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Purchase Date</label>
                  <input type="date" value={assetForm.purchaseDate || ""} onChange={e => setAssetForm({ ...assetForm, purchaseDate: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Asset Cost ($)</label>
                  <input type="number" value={assetForm.cost || 0} onChange={e => setAssetForm({ ...assetForm, cost: Number(e.target.value) })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Warranty / Support Expiration</label>
                  <input type="date" value={assetForm.warrantyExpiry || ""} onChange={e => setAssetForm({ ...assetForm, warrantyExpiry: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Type</label>
                  <select value={assetForm.type || "Hardware"} onChange={e => setAssetForm({ ...assetForm, type: e.target.value as any })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded">
                    <option value="Hardware">Hardware / Device</option>
                    <option value="Software">Software License</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Asset</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map(a => (
                <div key={a.id} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl flex flex-col justify-between group relative">
                  <div className="absolute top-4 right-4 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditAsset(a)} className="p-1 hover:text-indigo-600 text-neutral-300 dark:text-neutral-600 rounded">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteAsset(a.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-neutral-300 rounded-lg">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-800 dark:text-neutral-100">{a.name}</h4>
                        <span className="text-[10px] bg-neutral-50 dark:bg-zinc-950/20 px-1 rounded text-neutral-400">
                          {a.type}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t">
                      {a.serialNumber && (
                        <div>
                          <p className="text-neutral-400">Identifier / Key</p>
                          <p className="font-mono truncate">{a.serialNumber}</p>
                        </div>
                      )}
                      {a.cost > 0 && (
                        <div>
                          <p className="text-neutral-400">Asset Cost</p>
                          <p className="font-semibold text-neutral-700 dark:text-neutral-300">${a.cost.toLocaleString()}</p>
                        </div>
                      )}
                      {a.purchaseDate && (
                        <div>
                          <p className="text-neutral-400">Purchase Date</p>
                          <p className="text-neutral-600 dark:text-neutral-350">{a.purchaseDate}</p>
                        </div>
                      )}
                      {a.warrantyExpiry && (
                        <div>
                          <p className="text-neutral-400">Warranty Expires</p>
                          <p className="text-neutral-600 dark:text-neutral-350">{a.warrantyExpiry}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SUBSCRIPTIONS TAB */}
      {activeSubTab === "subs" && (
        <div className="space-y-4">
          <div className="bg-neutral-50/50 dark:bg-zinc-900/40 p-4 rounded-xl border flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-neutral-400 uppercase tracking-wider">Total Monthly SaaS Overhead:</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">${totalMonthlySaaS.toFixed(2)} / mo</span>
            </div>
            <p className="text-neutral-400 text-[10px]">Computed dynamically from active subscriptions.</p>
          </div>

          {(editingId || isAddingNew) ? (
            <form onSubmit={handleSaveSub} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-2xl text-xs">
              <h3 className="font-bold">{isAddingNew ? "Add Subscription Entry" : "Edit Subscription Details"}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Service Name</label>
                  <input type="text" placeholder="e.g. Github Copilot" value={subForm.serviceName || ""} onChange={e => setSubForm({ ...subForm, serviceName: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Billing Cost ($)</label>
                  <input type="number" step="0.01" value={subForm.cost || 0} onChange={e => setSubForm({ ...subForm, cost: Number(e.target.value) })} required className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Billing Cycle</label>
                  <select value={subForm.billingCycle || "Monthly"} onChange={e => setSubForm({ ...subForm, billingCycle: e.target.value as any })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded">
                    <option value="Monthly">Monthly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-400">Next Renewal Date</label>
                  <input type="date" value={subForm.nextRenewal || ""} onChange={e => setSubForm({ ...subForm, nextRenewal: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-850 rounded" />
                </div>
                <div className="flex items-center space-x-2 pt-5">
                  <input type="checkbox" id="active" checked={subForm.active !== undefined ? subForm.active : true} onChange={e => setSubForm({ ...subForm, active: e.target.checked })} />
                  <label htmlFor="active" className="font-semibold text-neutral-500">Active Subscription</label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-semibold">Save Subscription</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map(s => (
                <div key={s.id} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between group relative">
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="p-2.5 bg-neutral-100 dark:bg-zinc-800 rounded-xl">
                      <CreditCard className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-700 dark:text-neutral-200">{s.serviceName}</h4>
                      <p className="text-[10px] text-neutral-400">
                        ${s.cost} / {s.billingCycle === "Monthly" ? "mo" : "yr"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      s.active ? "bg-emerald-50 text-emerald-600 font-semibold" : "bg-neutral-100 text-neutral-400"
                    }`}>
                      {s.active ? "Active" : "Paused"}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditSub(s)} className="p-1 hover:text-indigo-600 text-neutral-300 dark:text-neutral-600 rounded">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeleteSub(s.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
