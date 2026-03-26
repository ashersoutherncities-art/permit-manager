'use client';
import { useState } from 'react';
import { Subcontractor } from '../types';
import { generateId } from '../store';

const VENDOR_CHECKLIST_ITEMS = ['W-9 Form', 'Certificate of Insurance', 'License Copy', 'Qualifier Card', 'Signed Contract', 'Background Check'];

interface Props {
  subs: Subcontractor[];
  onUpdate: (subs: Subcontractor[]) => void;
}

export default function SubcontractorPanel({ subs, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', trade: '', phone: '', email: '',
    licenseNumber: '', licenseType: '', licenseExpiration: '',
    insuranceProvider: '', insuranceExpiration: '', insuranceCurrent: true,
    qualifierCardImage: '',
  });

  const resetForm = () => {
    setForm({ name: '', trade: '', phone: '', email: '', licenseNumber: '', licenseType: '', licenseExpiration: '', insuranceProvider: '', insuranceExpiration: '', insuranceCurrent: true, qualifierCardImage: '' });
    setShowForm(false);
    setEditId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const sub: Subcontractor = {
      id: editId || generateId(),
      ...form,
      vendorChecklist: editId
        ? subs.find(s => s.id === editId)?.vendorChecklist || VENDOR_CHECKLIST_ITEMS.map(item => ({ item, done: false }))
        : VENDOR_CHECKLIST_ITEMS.map(item => ({ item, done: false })),
    };
    if (editId) {
      onUpdate(subs.map(s => s.id === editId ? sub : s));
    } else {
      onUpdate([...subs, sub]);
    }
    resetForm();
  };

  const startEdit = (s: Subcontractor) => {
    setForm({
      name: s.name, trade: s.trade, phone: s.phone, email: s.email,
      licenseNumber: s.licenseNumber, licenseType: s.licenseType, licenseExpiration: s.licenseExpiration,
      insuranceProvider: s.insuranceProvider, insuranceExpiration: s.insuranceExpiration, insuranceCurrent: s.insuranceCurrent,
      qualifierCardImage: s.qualifierCardImage,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const deleteSub = (id: string) => onUpdate(subs.filter(s => s.id !== id));

  const toggleVendorItem = (subId: string, idx: number) => {
    onUpdate(subs.map(s => {
      if (s.id !== subId) return s;
      const newChecklist = [...s.vendorChecklist];
      newChecklist[idx] = { ...newChecklist[idx], done: !newChecklist[idx].done };
      return { ...s, vendorChecklist: newChecklist };
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, qualifierCardImage: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const isExpired = (date: string) => date && new Date(date) < new Date();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Subcontractors</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">+ Add Sub</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3">
          <h4 className="font-semibold">{editId ? 'Edit' : 'Add'} Subcontractor</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <input className="input" placeholder="Trade (e.g., Electrician)" value={form.trade} onChange={e => setForm(f => ({ ...f, trade: e.target.value }))} />
            <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <input className="input" placeholder="License Number" value={form.licenseNumber} onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} />
            <input className="input" placeholder="License Type" value={form.licenseType} onChange={e => setForm(f => ({ ...f, licenseType: e.target.value }))} />
            <div>
              <label className="text-sm block mb-1">License Expiration</label>
              <input className="input" type="date" value={form.licenseExpiration} onChange={e => setForm(f => ({ ...f, licenseExpiration: e.target.value }))} />
            </div>
            <input className="input" placeholder="Insurance Provider" value={form.insuranceProvider} onChange={e => setForm(f => ({ ...f, insuranceProvider: e.target.value }))} />
            <div>
              <label className="text-sm block mb-1">Insurance Expiration</label>
              <input className="input" type="date" value={form.insuranceExpiration} onChange={e => setForm(f => ({ ...f, insuranceExpiration: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.insuranceCurrent} onChange={e => setForm(f => ({ ...f, insuranceCurrent: e.target.checked }))} />
              <span className="text-sm">Insurance Current</span>
            </label>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Qualifier Card (Image)</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="text-sm" />
            {form.qualifierCardImage && <img src={form.qualifierCardImage} alt="Qualifier" className="mt-2 h-24 rounded border" style={{ borderColor: 'var(--border)' }} />}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">{editId ? 'Update' : 'Add'}</button>
            <button type="button" onClick={resetForm} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      {subs.map(s => (
        <div key={s.id} className="card">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{s.name}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.trade} • {s.phone}</div>
              {s.email && <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.email}</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(s)} className="btn-secondary text-xs">Edit</button>
              <button onClick={() => deleteSub(s.id)} className="btn-danger text-xs">Delete</button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div>
              <span className="font-medium">License:</span> {s.licenseNumber || 'N/A'}
              {isExpired(s.licenseExpiration) && <span className="text-red-500 ml-1">EXPIRED</span>}
            </div>
            <div>
              <span className="font-medium">Insurance:</span>{' '}
              {s.insuranceCurrent ? <span className="text-green-600">Current</span> : <span className="text-red-500">Expired</span>}
            </div>
            <div>
              <span className="font-medium">Qualifier:</span>{' '}
              {s.qualifierCardImage ? <span className="text-green-600">✓ On file</span> : <span className="text-red-500">Missing</span>}
            </div>
          </div>
          <div className="mt-3">
            <label className="text-sm font-medium block mb-1">Vendor Package Checklist</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
              {s.vendorChecklist.map((c, i) => (
                <label key={i} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={c.done} onChange={() => toggleVendorItem(s.id, i)} />
                  <span className={c.done ? 'line-through opacity-50' : ''}>{c.item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
      {subs.length === 0 && !showForm && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No subcontractors added yet.</p>
      )}
    </div>
  );
}
