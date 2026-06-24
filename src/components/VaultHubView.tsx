import React, { useState, useEffect } from "react";
import { 
  Lock, Unlock, Eye, EyeOff, ShieldCheck, Trash2, Key, Save, 
  Upload, FileText, Download, Copy, Check, ChevronRight, PlusCircle, AlertCircle
} from "lucide-react";
import { VaultDocument, EncryptedPassword, LifeOSState } from "../types";
import { encryptText, decryptText } from ".././lib/crypto";

interface VaultHubViewProps {
  documents: VaultDocument[];
  passwords: EncryptedPassword[];
  onSaveDocuments: (updated: VaultDocument[]) => void;
  onSavePasswords: (updated: EncryptedPassword[]) => void;
}

export default function VaultHubView({ 
  documents, passwords, onSaveDocuments, onSavePasswords 
}: VaultHubViewProps) {

  const [activeSubTab, setActiveSubTab] = useState<"docs" | "passwords">("docs");

  // 1. Documents Vault States
  const [dragActive, setDragActive] = useState(false);
  const [documentType, setDocumentType] = useState<VaultDocument["type"]>("Identity");
  const [docNameInput, setDocNameInput] = useState("");

  // 2. Encrypted Passwords Vault States
  const [masterPassword, setMasterPassword] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptedPasswords, setDecryptedPasswords] = useState<{ id: string; service: string; username: string; plainPass: string; notes?: string }[]>([]);
  const [passwordError, setPasswordError] = useState("");
  
  // Create password form
  const [isAddingPass, setIsAddingPass] = useState(false);
  const [newService, setNewService] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // UI state
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Attempt decryption using input master key
  const handleUnlockSafe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterPassword) return;
    setPasswordError("");

    try {
      const results: typeof decryptedPasswords = [];
      for (const p of passwords) {
        const decryptedUsername = await decryptText(p.encryptedUsername, masterPassword, p.salt, p.iv);
        const decryptedPass = await decryptText(p.encryptedValue, masterPassword, p.salt, p.iv);
        let decryptedNotes = "";
        if (p.encryptedNotes) {
          decryptedNotes = await decryptText(p.encryptedNotes, masterPassword, p.salt, p.iv);
        }
        results.push({
          id: p.id,
          service: p.serviceName,
          username: decryptedUsername,
          plainPass: decryptedPass,
          notes: decryptedNotes
        });
      }
      setDecryptedPasswords(results);
      setIsDecrypted(true);
    } catch (err) {
      console.error(err);
      setPasswordError("Incorrect Master Password. Hashing signature verification failed.");
    }
  };

  const handleLockSafe = () => {
    setIsDecrypted(false);
    setDecryptedPasswords([]);
    setMasterPassword("");
    setRevealedIds([]);
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService || !newUsername || !newPasswordVal || !masterPassword) return;

    try {
      // Generate standard encryption details
      const encryptedUserObj = await encryptText(newUsername, masterPassword);
      const encryptedPassObj = await encryptText(newPasswordVal, masterPassword);
      
      let encryptedNotesObj = { encryptedStr: "", saltStr: "", ivStr: "" };
      if (newNotes) {
        encryptedNotesObj = await encryptText(newNotes, masterPassword);
      }

      const newSecret: EncryptedPassword = {
        id: `pw-${Date.now()}`,
        serviceName: newService,
        encryptedUsername: encryptedUserObj.encryptedStr,
        encryptedValue: encryptedPassObj.encryptedStr,
        encryptedNotes: encryptedNotesObj.encryptedStr || undefined,
        salt: encryptedUserObj.saltStr, // Store shared salt/iv mappings
        iv: encryptedUserObj.ivStr
      };

      const updated = [...passwords, newSecret];
      onSavePasswords(updated);

      // Add to current decrypted list
      setDecryptedPasswords(prev => [
        ...prev,
        {
          id: newSecret.id,
          service: newService,
          username: newUsername,
          plainPass: newPasswordVal,
          notes: newNotes
        }
      ]);

      // Reset form
      setIsAddingPass(false);
      setNewService("");
      setNewUsername("");
      setNewPasswordVal("");
      setNewNotes("");

    } catch (err) {
      alert("Encryption error generating credential cipher.");
    }
  };

  const handleDeletePassword = (id: string) => {
    if (confirm("Permanently destroy this encrypted password?")) {
      onSavePasswords(passwords.filter(p => p.id !== id));
      setDecryptedPasswords(decryptedPasswords.filter(p => p.id !== id));
    }
  };

  // Convert files to base64 mock upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const b64Data = reader.result as string;
      const newDoc: VaultDocument = {
        id: `doc-${Date.now()}`,
        name: docNameInput || file.name,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedDate: new Date().toISOString().split('T')[0],
        type: documentType,
        url: b64Data // base64 payload fits standard offline storage
      };
      onSaveDocuments([...documents, newDoc]);
      setDocNameInput("");
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDownload = (doc: VaultDocument) => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm("Delete document from vault?")) {
      onSaveDocuments(documents.filter(d => d.id !== id));
    }
  };

  const handleCopyTextVal = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    if (revealedIds.includes(id)) {
      setRevealedIds(revealedIds.filter(x => x !== id));
    } else {
      setRevealedIds([...revealedIds, id]);
    }
  };

  return (
    <div className="space-y-6" id="vault-hub-pane">
      
      {/* Tab selectors */}
      <div className="flex space-x-2 border-b border-neutral-100 dark:border-zinc-800 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab("docs")}
          className={`font-bold px-3 py-1.5 rounded-lg border transition-all ${
            activeSubTab === "docs"
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
          }`}
        >
          Identity Documents
        </button>
        <button
          onClick={() => setActiveSubTab("passwords")}
          className={`font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center space-x-1.5 ${
            activeSubTab === "passwords"
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50"
          }`}
        >
          <Lock className="w-3 h-3" />
          <span>Encrypted Password Safe</span>
        </button>
      </div>

      {/* 1. DOCUMENTS VAULT */}
      {activeSubTab === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Upload panel */}
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 h-fit">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Upload to Vault</h3>
            
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Document Custom Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. Passport Bio Page" 
                  value={docNameInput}
                  onChange={e => setDocNameInput(e.target.value)}
                  className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-400">Classification</label>
                <select 
                  value={documentType} 
                  onChange={e => setDocumentType(e.target.value as any)}
                  className="w-full p-2 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded"
                >
                  <option value="Identity">Identity Card / Passport</option>
                  <option value="Education">Educational Transcript</option>
                  <option value="Employment">Employment Contract / Work Slip</option>
                </select>
              </div>

              {/* Drag and drop box */}
              <div 
                onDragEnter={onDrag}
                onDragOver={onDrag}
                onDragLeave={onDrag}
                onDrop={onDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? "border-indigo-500 bg-indigo-50/20" 
                    : "border-neutral-200 dark:border-zinc-800 hover:bg-neutral-50/50 dark:hover:bg-zinc-950/20"
                }`}
              >
                <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Drag file here, or click to browse</p>
                <p className="text-[10px] text-neutral-400 mt-1">Saves encrypted payload into local storage state.</p>
                <input 
                  type="file" 
                  id="vault-file-picker" 
                  onChange={onFileInputChange} 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => document.getElementById("vault-file-picker")?.click()}
                  className="mt-3 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 rounded font-bold text-[10px]"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>

          {/* Documents Table list */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Secure Document Catalog</h3>
            
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs font-semibold">
                  No documents in vault storage. Upload scans safely above.
                </div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="p-3.5 bg-neutral-50/50 dark:bg-zinc-900/50 border border-neutral-150 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center space-x-3 text-xs overflow-hidden">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-neutral-700 dark:text-neutral-200 truncate">{doc.name}</h4>
                        <p className="text-[10px] text-neutral-400 font-mono truncate">{doc.fileName} ({doc.fileSize})</p>
                        <span className="text-[9px] bg-neutral-100 dark:bg-zinc-800 px-1 rounded text-neutral-500 font-mono">
                          {doc.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-neutral-50 border rounded-lg text-neutral-600 dark:text-neutral-300 shadow-sm"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 bg-white dark:bg-zinc-800 hover:bg-neutral-50 border rounded-lg text-red-500 shadow-sm"
                        title="Destroy payload"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ENCRYPTED PASSWORD VAULT */}
      {activeSubTab === "passwords" && (
        <div className="space-y-6">
          
          {/* LOCKED STATE */}
          {!isDecrypted ? (
            <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 text-center">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">Safe is Encrypted</h3>
                <p className="text-xs text-neutral-400">All credential usernames, passwords, and tokens are protected locally in your browser using PBKDF2 with 256-bit AES-GCM encryption.</p>
              </div>

              <form onSubmit={handleUnlockSafe} className="space-y-3 text-xs">
                <div className="space-y-1 text-left">
                  <label className="font-semibold text-neutral-500">Master Decryption Password</label>
                  <input
                    type="password"
                    placeholder="Enter Master Password..."
                    value={masterPassword}
                    onChange={e => setMasterPassword(e.target.value)}
                    required
                    className="w-full p-2.5 border border-neutral-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 rounded-xl outline-none"
                  />
                </div>

                {passwordError && (
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg flex items-center space-x-1.5 text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <button type="submit" className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5">
                  <Unlock className="w-4 h-4" />
                  <span>Decrypt Safe Records</span>
                </button>
              </form>
            </div>
          ) : (
            
            /* UNLOCKED STATE */
            <div className="space-y-6">
              
              {/* Toolbar */}
              <div className="bg-neutral-50/50 dark:bg-zinc-900/40 p-4 border rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-emerald-600">Safe Unlocked & Verified</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsAddingPass(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                  >
                    Add Credential
                  </button>
                  <button
                    onClick={handleLockSafe}
                    className="px-3 py-1.5 border hover:bg-neutral-100 rounded-lg font-bold text-neutral-500"
                  >
                    Lock Safe
                  </button>
                </div>
              </div>

              {isAddingPass && (
                <form onSubmit={handleAddCredential} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl space-y-3 max-w-xl text-xs">
                  <h3 className="font-bold">Add Safe Password Record</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-400">Service Name</label>
                      <input type="text" placeholder="e.g. GitHub Account" value={newService} onChange={e => setNewService(e.target.value)} required className="w-full p-2 border bg-white rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-400">Username / Client ID</label>
                      <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required className="w-full p-2 border bg-white rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-400">Password / Token Key</label>
                      <input type="text" value={newPasswordVal} onChange={e => setNewPasswordVal(e.target.value)} required className="w-full p-2 border bg-white rounded" />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="font-semibold text-neutral-400">Secret Notes</label>
                      <input type="text" placeholder="e.g. Recovery keys..." value={newNotes} onChange={e => setNewNotes(e.target.value)} className="w-full p-2 border bg-white rounded" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    <button type="button" onClick={() => setIsAddingPass(false)} className="px-3 border rounded">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-indigo-600 text-white rounded font-bold">Encrypt & Save</button>
                  </div>
                </form>
              )}

              {/* Password credentials table list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {decryptedPasswords.map(pw => (
                  <div key={pw.id} className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 p-5 rounded-xl flex flex-col justify-between group relative text-xs">
                    <div className="absolute top-4 right-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDeletePassword(pw.id)} className="p-1 hover:text-red-500 text-neutral-300 dark:text-neutral-600 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-bold text-neutral-800 dark:text-neutral-100">{pw.service}</h4>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400">Username:</span>
                          <button 
                            onClick={() => handleCopyTextVal(pw.username, `${pw.id}-user`)}
                            className="flex items-center space-x-1.5 font-mono text-neutral-600 dark:text-neutral-300 hover:text-indigo-600"
                          >
                            <span>{pw.username}</span>
                            {copiedId === `${pw.id}-user` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-neutral-400">Password:</span>
                          <div className="flex items-center space-x-1.5">
                            <button 
                              onClick={() => toggleReveal(pw.id)}
                              className="p-1 text-neutral-400 hover:text-neutral-600"
                            >
                              {revealedIds.includes(pw.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                              onClick={() => handleCopyTextVal(pw.plainPass, `${pw.id}-pass`)}
                              className="flex items-center space-x-1.5 font-mono text-neutral-600 dark:text-neutral-300 hover:text-indigo-600"
                            >
                              <span>{revealedIds.includes(pw.id) ? pw.plainPass : "••••••••••••"}</span>
                              {copiedId === `${pw.id}-pass` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        {pw.notes && (
                          <div className="pt-2 border-t mt-2 text-[10px] text-neutral-400 font-mono">
                            <span className="font-bold">Notes:</span> {pw.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
