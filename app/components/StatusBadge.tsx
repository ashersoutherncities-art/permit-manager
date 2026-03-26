'use client';
import { PermitStatus } from '../types';

const statusClass: Record<PermitStatus, string> = {
  'Not Started': 'badge-not-started',
  'Submitted': 'badge-submitted',
  'Under Review': 'badge-under-review',
  'Approved': 'badge-approved',
  'Issued': 'badge-issued',
  'Closed': 'badge-closed',
};

export default function StatusBadge({ status }: { status: PermitStatus }) {
  return <span className={`badge ${statusClass[status]}`}>{status}</span>;
}
