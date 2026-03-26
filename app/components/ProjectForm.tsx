'use client';
import { useState } from 'react';
import { ProjectType } from '../types';

const PROJECT_TYPES: ProjectType[] = ['New Construction', 'Renovation', 'Addition', 'Demolition', 'Commercial Buildout', 'Residential Rehab'];

interface Props {
  onSubmit: (name: string, address: string, type: ProjectType, value: number) => void;
  onCancel: () => void;
  initial?: { name: string; address: string; type: ProjectType; value: number };
}

export default function ProjectForm({ onSubmit, onCancel, initial }: Props) {
  const [name, setName] = useState(initial?.name || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [type, setType] = useState<ProjectType>(initial?.type || 'New Construction');
  const [value, setValue] = useState(initial?.value?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    onSubmit(name.trim(), address.trim(), type, parseFloat(value) || 0);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h3 className="text-lg font-bold">{initial ? 'Edit Project' : 'New Project'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Project Name *</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Smith Residence" required />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Address *</label>
          <input className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, Charlotte NC" required />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Project Type</label>
          <select className="input" value={type} onChange={e => setType(e.target.value as ProjectType)}>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Project Value ($)</label>
          <input className="input" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="250000" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">{initial ? 'Update' : 'Create Project'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}
