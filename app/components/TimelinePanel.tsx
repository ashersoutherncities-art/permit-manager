'use client';
import { useState } from 'react';
import { Project, TimelineEvent, PermitStatus } from '../types';
import { generateId } from '../store';
import StatusBadge from './StatusBadge';

interface Props {
  project: Project;
  onUpdate: (timeline: TimelineEvent[]) => void;
}

const statusColors: Record<PermitStatus, string> = {
  'Not Started': '#94a3b8',
  'Submitted': '#3b82f6',
  'Under Review': '#f59e0b',
  'Approved': '#22c55e',
  'Issued': '#06b6d4',
  'Closed': '#64748b',
};

export default function TimelinePanel({ project, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: '', title: '', description: '', type: 'milestone' as 'permit' | 'inspection' | 'milestone', status: 'Not Started' as PermitStatus });

  const sorted = [...project.timeline].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.title) return;
    onUpdate([...project.timeline, { id: generateId(), ...form }]);
    setForm({ date: '', title: '', description: '', type: 'milestone' as 'permit' | 'inspection' | 'milestone', status: 'Not Started' as PermitStatus });
    setShowForm(false);
  };

  const deleteEvent = (id: string) => onUpdate(project.timeline.filter(e => e.id !== id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Project Timeline</h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">+ Add Event</button>
      </div>

      {showForm && (
        <form onSubmit={addEvent} className="card space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <input className="input" placeholder="Event title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as 'permit' | 'inspection' | 'milestone' }))}>
              <option value="permit">Permit</option>
              <option value="inspection">Inspection</option>
              <option value="milestone">Milestone</option>
            </select>
            <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PermitStatus }))}>
              {(['Not Started', 'Submitted', 'Under Review', 'Approved', 'Issued', 'Closed'] as PermitStatus[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <input className="input" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No timeline events yet.</p>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5" style={{ background: 'var(--border)' }}></div>
          {sorted.map((event) => (
            <div key={event.id} className="relative mb-4">
              <div
                className="absolute -left-4 w-4 h-4 rounded-full border-2 border-white"
                style={{ background: statusColors[event.status], top: '0.25rem' }}
              ></div>
              <div className="card ml-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{event.title}</span>
                      <StatusBadge status={event.status} />
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        {event.type}
                      </span>
                    </div>
                    <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{event.date}</div>
                    {event.description && <div className="text-sm mt-1">{event.description}</div>}
                  </div>
                  <button onClick={() => deleteEvent(event.id)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
