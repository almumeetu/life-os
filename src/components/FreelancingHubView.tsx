import React, { useState } from "react";
import { 
  PlusCircle, FileSpreadsheet, Briefcase, Coins, Trash2, Edit, Save, 
  Plus, Globe, CheckCircle, Clock, Link2, ExternalLink
} from "lucide-react";
import { FreelancingHub, Proposal, Contract } from "../types";

interface FreelancingHubViewProps {
  freelancing: FreelancingHub;
  onSaveFreelancing: (updated: FreelancingHub) => void;
}

export default function FreelancingHubView({ freelancing, onSaveFreelancing }: FreelancingHubViewProps) {
  const [activeSegment, setActiveSegment] = useState<"contracts" | "proposals">("contracts");
  
  // Platform settings form edit
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [linksForm, setLinksForm] = useState({
    upworkUrl: freelancing.upworkUrl,
    fiverrUrl: freelancing.fiverrUrl,
    freelancerUrl: freelancing.freelancerUrl,
    peoplePerHourUrl: freelancing.peoplePerHourUrl,
    earnings: freelancing.earnings
  });

  // Adding Contract/Proposal Forms
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [contractForm, setContractForm] = useState<Partial<Contract>>({ title: "", value: 0, status: "Pending" });
  
  const [isAddingProposal, setIsAddingProposal] = useState(false);
  const [proposalForm, setProposalForm] = useState<Partial<Proposal>>({ client: "", jobTitle: "", status: "Submitted", date: new Date().toISOString().split('T')[0] });

  const handleSaveLinks = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveFreelancing({
      ...freelancing,
      ...linksForm
    });
    setIsEditingLinks(false);
  };

  const handleAddContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.title || !contractForm.value) return;
    const newContract: Contract = {
      id: `ctr-${Date.now()}`,
      title: contractForm.title,
      value: Number(contractForm.value),
      status: contractForm.status as any
    };
    onSaveFreelancing({
      ...freelancing,
      contracts: [...freelancing.contracts, newContract]
    });
    setIsAddingContract(false);
    setContractForm({ title: "", value: 0, status: "Pending" });
  };

  const handleDeleteContract = (id: string) => {
    if (confirm("Delete this contract?")) {
      onSaveFreelancing({
        ...freelancing,
        contracts: freelancing.contracts.filter(c => c.id !== id)
      });
    }
  };

  const handleAddProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.client || !proposalForm.jobTitle) return;
    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      client: proposalForm.client,
      jobTitle: proposalForm.jobTitle,
      status: proposalForm.status as any,
      date: proposalForm.date || new Date().toISOString().split('T')[0]
    };
    onSaveFreelancing({
      ...freelancing,
      proposals: [...freelancing.proposals, newProposal]
    });
    setIsAddingProposal(false);
    setProposalForm({ client: "", jobTitle: "", status: "Submitted", date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteProposal = (id: string) => {
    if (confirm("Delete this proposal?")) {
      onSaveFreelancing({
        ...freelancing,
        proposals: freelancing.proposals.filter(p => p.id !== id)
      });
    }
  };

  const activeContracts = freelancing.contracts.filter(c => c.status === "Active");
  const totalContractVal = freelancing.contracts.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6" id="freelance-hub-pane">
      
      {/* Overview header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-2 flex flex-col justify-center">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Freelance Income</p>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100">${freelancing.earnings.toLocaleString()}</h2>
            <span className="text-[10px] font-bold text-emerald-500 font-mono">USD</span>
          </div>
          <p className="text-[10px] text-neutral-400 leading-relaxed">Cumulative lifetime consulting earnings stored.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-2 flex flex-col justify-center">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Active Contracts Val</p>
          <h2 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            ${activeContracts.reduce((sum, c) => sum + c.value, 0).toLocaleString()}
          </h2>
          <p className="text-[10px] text-neutral-400 leading-relaxed">Across {activeContracts.length} current active consulting projects.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-2 flex flex-col justify-center">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Historical Bookings Val</p>
          <h2 className="text-2xl font-extrabold text-neutral-800 dark:text-neutral-100">${totalContractVal.toLocaleString()}</h2>
          <p className="text-[10px] text-neutral-400 leading-relaxed">Sum total of all contracts (including closed ones).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Platform Handles Links */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Platform Links</h3>
            <button
              onClick={() => setIsEditingLinks(!isEditingLinks)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
            >
              {isEditingLinks ? "Cancel" : "Edit Handles"}
            </button>
          </div>

          {!isEditingLinks ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 bg-neutral-50/50 dark:bg-zinc-900/50 border border-neutral-150 rounded-lg">
                <span className="font-bold text-emerald-600">Upwork</span>
                {freelancing.upworkUrl ? (
                  <a href={freelancing.upworkUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center space-x-1">
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span className="text-neutral-400">Not set</span>}
              </div>

              <div className="flex items-center justify-between p-2 bg-neutral-50/50 dark:bg-zinc-900/50 border border-neutral-150 rounded-lg">
                <span className="font-bold text-green-500">Fiverr</span>
                {freelancing.fiverrUrl ? (
                  <a href={freelancing.fiverrUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center space-x-1">
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span className="text-neutral-400">Not set</span>}
              </div>

              <div className="flex items-center justify-between p-2 bg-neutral-50/50 dark:bg-zinc-900/50 border border-neutral-150 rounded-lg">
                <span className="font-bold text-blue-500">Freelancer</span>
                {freelancing.freelancerUrl ? (
                  <a href={freelancing.freelancerUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center space-x-1">
                    <span>View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span className="text-neutral-400">Not set</span>}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveLinks} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Upwork Profile URL</label>
                <input type="url" value={linksForm.upworkUrl} onChange={e => setLinksForm({ ...linksForm, upworkUrl: e.target.value })} className="w-full p-2 border bg-white rounded" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Fiverr Profile URL</label>
                <input type="url" value={linksForm.fiverrUrl} onChange={e => setLinksForm({ ...linksForm, fiverrUrl: e.target.value })} className="w-full p-2 border bg-white rounded" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-500">Freelancer URL</label>
                <input type="url" value={linksForm.freelancerUrl} onChange={e => setLinksForm({ ...linksForm, freelancerUrl: e.target.value })} className="w-full p-2 border bg-white rounded" />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Manually Set Earnings ($)</label>
                <input type="number" value={linksForm.earnings} onChange={e => setLinksForm({ ...linksForm, earnings: Number(e.target.value) })} className="w-full p-2 border bg-white rounded" />
              </div>
              <button type="submit" className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold">
                Save Platform Links
              </button>
            </form>
          )}
        </div>

        {/* Right Columns: Active Contracts & Proposals Split Tab */}
        <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex space-x-2">
              <button
                onClick={() => { setActiveSegment("contracts"); setIsAddingContract(false); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeSegment === "contracts" ? "bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200" : "text-neutral-400"
                }`}
              >
                Contracts Log ({freelancing.contracts.length})
              </button>
              <button
                onClick={() => { setActiveSegment("proposals"); setIsAddingProposal(false); }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  activeSegment === "proposals" ? "bg-neutral-100 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200" : "text-neutral-400"
                }`}
              >
                Proposals Sent ({freelancing.proposals.length})
              </button>
            </div>

            <button
              onClick={() => {
                if (activeSegment === "contracts") setIsAddingContract(true);
                else setIsAddingProposal(true);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* 1. CONTRACTS SEGMENT */}
          {activeSegment === "contracts" && (
            <div className="space-y-4">
              {isAddingContract && (
                <form onSubmit={handleAddContractSubmit} className="bg-neutral-50/50 dark:bg-zinc-950/20 border border-neutral-150 dark:border-zinc-800 p-4 rounded-xl space-y-3 text-xs max-w-lg">
                  <h4 className="font-bold">Add Contract Entry</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-500">Contract Name</label>
                      <input type="text" value={contractForm.title || ""} onChange={e => setContractForm({ ...contractForm, title: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-900 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-500">Contract Value ($)</label>
                      <input type="number" value={contractForm.value || 0} onChange={e => setContractForm({ ...contractForm, value: Number(e.target.value) })} required className="w-full p-2 border bg-white dark:bg-zinc-900 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-500">Contract Status</label>
                      <select value={contractForm.status || "Pending"} onChange={e => setContractForm({ ...contractForm, status: e.target.value as any })} className="w-full p-2 border bg-white dark:bg-zinc-900 rounded">
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={() => setIsAddingContract(false)} className="px-3 border rounded">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-bold">Save Contract</button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {freelancing.contracts.map(c => (
                  <div key={c.id} className="p-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl flex items-center justify-between group">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{c.title}</h4>
                      <div className="flex items-center space-x-2.5 text-[10px] text-neutral-400">
                        <span className="font-mono font-bold text-neutral-600 dark:text-neutral-350">${c.value.toLocaleString()}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center px-1.5 rounded font-medium ${
                          c.status === "Active" ? "bg-emerald-50 text-emerald-600" : c.status === "Completed" ? "bg-blue-50 text-blue-500" : "bg-neutral-100 text-neutral-500"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteContract(c.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. PROPOSALS SEGMENT */}
          {activeSegment === "proposals" && (
            <div className="space-y-4">
              {isAddingProposal && (
                <form onSubmit={handleAddProposalSubmit} className="bg-neutral-50/50 dark:bg-zinc-950/20 border border-neutral-150 dark:border-zinc-800 p-4 rounded-xl space-y-3 text-xs max-w-lg">
                  <h4 className="font-bold">Add Submitted Proposal</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-500">Client / Company Name</label>
                      <input type="text" value={proposalForm.client || ""} onChange={e => setProposalForm({ ...proposalForm, client: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-900 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-500">Job Title</label>
                      <input type="text" value={proposalForm.jobTitle || ""} onChange={e => setProposalForm({ ...proposalForm, jobTitle: e.target.value })} required className="w-full p-2 border bg-white dark:bg-zinc-900 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-500">Proposal Date</label>
                      <input type="date" value={proposalForm.date || ""} onChange={e => setProposalForm({ ...proposalForm, date: e.target.value })} className="w-full p-2 border bg-white dark:bg-zinc-900 rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-500">Proposal Status</label>
                      <select value={proposalForm.status || "Submitted"} onChange={e => setProposalForm({ ...proposalForm, status: e.target.value as any })} className="w-full p-2 border bg-white dark:bg-zinc-900 rounded">
                        <option value="Submitted">Submitted</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button type="button" onClick={() => setIsAddingProposal(false)} className="px-3 border rounded">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-bold">Save Proposal</button>
                  </div>
                </form>
              )}

              <div className="space-y-2.5">
                {freelancing.proposals.map(p => (
                  <div key={p.id} className="p-3.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl flex items-center justify-between group">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{p.jobTitle}</h4>
                      <div className="flex items-center space-x-2.5 text-[10px] text-neutral-400 font-mono">
                        <span className="font-sans text-neutral-600 dark:text-neutral-300">Client: {p.client}</span>
                        <span>•</span>
                        <span>Date: {p.date}</span>
                        <span>•</span>
                        <span className={`inline-flex items-center px-1 rounded font-sans ${
                          p.status === "Accepted" ? "bg-emerald-50 text-emerald-600 font-semibold" : p.status === "Declined" ? "bg-red-50 text-red-500" : "bg-neutral-100 text-neutral-500"
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProposal(p.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
