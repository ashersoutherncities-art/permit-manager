'use client';
import { Project } from '../types';
import { getComplianceIssues } from '../store';

interface Props {
  projects: Project[];
}

export default function ComplianceDashboard({ projects }: Props) {
  const issues = getComplianceIssues(projects);
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  const groupedByProject = issues.reduce((acc, issue) => {
    if (!acc[issue.projectName]) acc[issue.projectName] = [];
    acc[issue.projectName].push(issue);
    return acc;
  }, {} as Record<string, typeof issues>);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Compliance Dashboard</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="text-3xl font-bold">{projects.length}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Projects</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--error)' }}>{errors.length}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Critical Issues</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold" style={{ color: 'var(--warning)' }}>{warnings.length}</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Warnings</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold" style={{ color: issues.length === 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
            {issues.length === 0 ? '✓' : issues.length}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{issues.length === 0 ? 'All Clear' : 'Total Issues'}</div>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="card text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <div className="font-semibold">All projects are compliant!</div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No missing documents, permits, or insurance issues.</div>
        </div>
      ) : (
        Object.entries(groupedByProject).map(([projectName, projectIssues]) => (
          <div key={projectName} className="card">
            <h4 className="font-semibold mb-2">{projectName}</h4>
            <div className="space-y-1">
              {projectIssues.map((issue, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${issue.severity === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  <span className="font-medium capitalize" style={{ color: issue.severity === 'error' ? 'var(--error)' : 'var(--warning)' }}>
                    {issue.type}:
                  </span>
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
