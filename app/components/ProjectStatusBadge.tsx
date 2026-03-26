'use client';
import { ProjectStatus } from '../types';

const config: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'project-badge-active' },
  potential: { label: 'Potential', className: 'project-badge-potential' },
  declined: { label: 'Declined', className: 'project-badge-declined' },
};

interface Props {
  status: ProjectStatus;
  reason?: string;
}

export default function ProjectStatusBadge({ status, reason }: Props) {
  const { label, className } = config[status];
  return (
    <span
      className={`badge ${className}`}
      title={status === 'declined' && reason ? `Reason: ${reason}` : undefined}
    >
      {status === 'active' && '●'} {status === 'potential' && '◐'} {status === 'declined' && '✕'} {label}
    </span>
  );
}
