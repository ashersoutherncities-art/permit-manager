'use client';
import { useState } from 'react';
import { Permit, PermitStatus } from '../types';
import StatusBadge from './StatusBadge';

const STATUSES: PermitStatus[] = ['Not Started', 'Submitted', 'Under Review', 'Approved', 'Issued', 'Closed'];

interface Props {
  permits: Permit[];
  onUpdate: (permits: Permit[]) => void;
}

export default function PermitPanel({ permits, onUpdate }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const updatePermit = (id: string, updates: Partial<Permit>) => {
    onUpdate(permits.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const toggleChecklist = (permitId: string, idx: number) => {
    const permit = permits.find(p => p.id === permitId);
    if (!permit) return;
    const newChecklist = [...permit.checklist];
    newChecklist[idx] = { ...newChecklist[idx], done: !newChecklist[idx].done };
    updatePermit(permitId, { checklist: newChecklist });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">Permits</h3>
      {permits.map(p => (
        <div key={p.id} className="card">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
            <div className="flex items-center gap-3">
              <span className="font-semibold">{p.type}</span>
              <StatusBadge status={p.status} />
            </div>
            <span className="text-xl">{expanded === p.id ? '−' : '+'}</span>
          </div>
          {expanded === p.id && (
            <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Status</label>
                  <select className="input" value={p.status} onChange={e => updatePermit(p.id, { status: e.target.value as PermitStatus })}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Permit Number</label>
                  <input className="input" value={p.permitNumber} onChange={e => updatePermit(p.id, { permitNumber: e.target.value })} placeholder="BLD-2026-001" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Issue Date</label>
                  <input className="input" type="date" value={p.issueDate} onChange={e => updatePermit(p.id, { issueDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Expiration Date</label>
                  <input className="input" type="date" value={p.expirationDate} onChange={e => updatePermit(p.id, { expirationDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Inspector</label>
                  <input className="input" value={p.inspector} onChange={e => updatePermit(p.id, { inspector: e.target.value })} placeholder="Inspector name" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notes</label>
                <textarea className="input" rows={2} value={p.notes} onChange={e => updatePermit(p.id, { notes: e.target.value })} placeholder="Additional notes..." />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Checklist</label>
                {p.checklist.map((c, i) => (
                  <label key={i} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input type="checkbox" checked={c.done} onChange={() => toggleChecklist(p.id, i)} className="w-4 h-4 rounded" />
                    <span className={c.done ? 'line-through opacity-50' : ''}>{c.item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
