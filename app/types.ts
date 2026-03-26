export type PermitStatus = 'Not Started' | 'Submitted' | 'Under Review' | 'Approved' | 'Issued' | 'Closed';
export type ProjectType = 'New Construction' | 'Renovation' | 'Addition' | 'Demolition' | 'Commercial Buildout' | 'Residential Rehab';
export type PermitType = 'Building' | 'Electrical' | 'Mechanical' | 'Plumbing';
export type DocType = 'Architectural Plans' | 'Electrical Plans' | 'Mechanical Plans' | 'Plumbing Plans' | 'Survey/Perc Test' | 'Lien Agent Document';

export interface Permit {
  id: string;
  type: PermitType;
  status: PermitStatus;
  permitNumber: string;
  issueDate: string;
  expirationDate: string;
  inspector: string;
  notes: string;
  checklist: { item: string; done: boolean }[];
}

export interface Subcontractor {
  id: string;
  name: string;
  trade: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiration: string;
  insuranceProvider: string;
  insuranceExpiration: string;
  insuranceCurrent: boolean;
  qualifierCardImage: string;
  vendorChecklist: { item: string; done: boolean }[];
}

export interface ProjectDocument {
  id: string;
  type: DocType;
  uploaded: boolean;
  fileData: string;
  fileName: string;
  notes: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'permit' | 'inspection' | 'milestone';
  status: PermitStatus;
}

export interface Project {
  id: string;
  name: string;
  address: string;
  type: ProjectType;
  value: number;
  createdAt: string;
  permits: Permit[];
  subcontractors: Subcontractor[];
  documents: ProjectDocument[];
  timeline: TimelineEvent[];
}
