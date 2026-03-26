'use client';
import { Project, ProjectType, Permit, PermitType, ProjectDocument, DocType, TimelineEvent } from './types';

const STORAGE_KEY = 'permit-manager-data';

const DEFAULT_CHECKLIST: Record<PermitType, string[]> = {
  'Building': ['Site plan submitted', 'Structural calculations', 'Foundation inspection', 'Framing inspection', 'Final inspection'],
  'Electrical': ['Panel schedule', 'Load calculations', 'Rough-in inspection', 'Final inspection'],
  'Mechanical': ['HVAC load calculations', 'Duct layout', 'Rough-in inspection', 'Final inspection'],
  'Plumbing': ['Riser diagram', 'Water/sewer connection', 'Rough-in inspection', 'Final inspection'],
};

const REQUIRED_PERMITS: Record<ProjectType, PermitType[]> = {
  'New Construction': ['Building', 'Electrical', 'Mechanical', 'Plumbing'],
  'Renovation': ['Building', 'Electrical', 'Plumbing'],
  'Addition': ['Building', 'Electrical', 'Mechanical', 'Plumbing'],
  'Demolition': ['Building'],
  'Commercial Buildout': ['Building', 'Electrical', 'Mechanical', 'Plumbing'],
  'Residential Rehab': ['Building', 'Electrical', 'Plumbing'],
};

const ALL_DOC_TYPES: DocType[] = ['Architectural Plans', 'Electrical Plans', 'Mechanical Plans', 'Plumbing Plans', 'Survey/Perc Test', 'Lien Agent Document'];

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProjects(projects: Project[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function createProject(name: string, address: string, type: ProjectType, value: number): Project {
  const permits: Permit[] = REQUIRED_PERMITS[type].map(pt => ({
    id: generateId(),
    type: pt,
    status: 'Not Started',
    permitNumber: '',
    issueDate: '',
    expirationDate: '',
    inspector: '',
    notes: '',
    checklist: DEFAULT_CHECKLIST[pt].map(item => ({ item, done: false })),
  }));

  const documents: ProjectDocument[] = ALL_DOC_TYPES.map(dt => ({
    id: generateId(),
    type: dt,
    uploaded: false,
    fileData: '',
    fileName: '',
    notes: '',
  }));

  const timeline: TimelineEvent[] = [{
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    title: 'Project Created',
    description: `${name} - ${type}`,
    type: 'milestone',
    status: 'Not Started',
  }];

  return {
    id: generateId(),
    name, address, type, value,
    createdAt: new Date().toISOString(),
    permits, subcontractors: [], documents, timeline,
  };
}

export function getComplianceIssues(projects: Project[]) {
  const issues: { projectId: string; projectName: string; type: string; message: string; severity: 'error' | 'warning' }[] = [];

  projects.forEach(p => {
    // Missing documents
    p.documents.forEach(d => {
      if (!d.uploaded) {
        issues.push({ projectId: p.id, projectName: p.name, type: 'document', message: `Missing: ${d.type}`, severity: 'warning' });
      }
    });

    // Permits not submitted
    p.permits.forEach(pm => {
      if (pm.status === 'Not Started') {
        issues.push({ projectId: p.id, projectName: p.name, type: 'permit', message: `${pm.type} permit not submitted`, severity: 'error' });
      }
    });

    // Subs missing insurance
    p.subcontractors.forEach(s => {
      if (!s.insuranceCurrent || new Date(s.insuranceExpiration) < new Date()) {
        issues.push({ projectId: p.id, projectName: p.name, type: 'insurance', message: `${s.name} - insurance expired/missing`, severity: 'error' });
      }
      if (!s.qualifierCardImage) {
        issues.push({ projectId: p.id, projectName: p.name, type: 'qualifier', message: `${s.name} - missing qualifier card`, severity: 'warning' });
      }
      if (new Date(s.licenseExpiration) < new Date()) {
        issues.push({ projectId: p.id, projectName: p.name, type: 'license', message: `${s.name} - license expired`, severity: 'error' });
      }
    });
  });

  return issues;
}
