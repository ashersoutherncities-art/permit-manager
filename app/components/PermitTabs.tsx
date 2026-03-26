'use client';
import { ProjectStatus } from '../types';

const TABS: { key: ProjectStatus; label: string; icon: string }[] = [
  { key: 'active', label: 'Active', icon: '🟢' },
  { key: 'potential', label: 'Potential / Queue', icon: '🟡' },
  { key: 'declined', label: 'Declined', icon: '🔴' },
];

interface Props {
  activeTab: ProjectStatus;
  onTabChange: (tab: ProjectStatus) => void;
  counts: Record<ProjectStatus, number>;
}

export default function PermitTabs({ activeTab, onTabChange, counts }: Props) {
  return (
    <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
      {TABS.map(({ key, label, icon }) => (
        <button
          key={key}
          className={`permit-tab ${activeTab === key ? 'active' : ''}`}
          onClick={() => onTabChange(key)}
        >
          <span className="mr-1">{icon}</span>
          <span>{label}</span>
          <span className="permit-tab-count">{counts[key]}</span>
        </button>
      ))}
    </div>
  );
}
