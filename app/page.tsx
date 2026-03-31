'use client';
import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectType, ProjectStatus } from './types';
import { loadProjects, saveProjects, createProject } from './store';
import { useAuth } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import ThemeToggle from './components/ThemeToggle';
import ProjectForm from './components/ProjectForm';
import PermitPanel from './components/PermitPanel';
import SubcontractorPanel from './components/SubcontractorPanel';
import DocumentPanel from './components/DocumentPanel';
import ComplianceDashboard from './components/ComplianceDashboard';
import TimelinePanel from './components/TimelinePanel';
import StatusBadge from './components/StatusBadge';
import ProjectStatusBadge from './components/ProjectStatusBadge';
import PermitTabs from './components/PermitTabs';

type View = 'dashboard' | 'project' | 'compliance';
type ProjectTab = 'permits' | 'subs' | 'docs' | 'timeline';
type StatusFilter = 'all' | 'active' | 'potential' | 'declined';

export default function Home() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectTab, setProjectTab] = useState<ProjectTab>('permits');
  const [showNewProject, setShowNewProject] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>('active');

  // Load projects for current user
  useEffect(() => {
    if (!isLoading && user) {
      setProjects(loadProjects(user.id));
    }
  }, [user, isLoading]);

  const save = useCallback((updated: Project[]) => {
    setProjects(updated);
    if (user) {
      saveProjects(updated, user.id);
    }
  }, [user]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const statusCounts: Record<ProjectStatus, number> = {
    active: projects.filter(p => p.projectStatus === 'active').length,
    potential: projects.filter(p => p.projectStatus === 'potential').length,
    declined: projects.filter(p => p.projectStatus === 'declined').length,
  };

  const handleCreateProject = (name: string, address: string, type: ProjectType, value: number, status: ProjectStatus, reason: string) => {
    const project = createProject(name, address, type, value, status, reason);
    save([...projects, project]);
    setShowNewProject(false);
    setActiveProjectId(project.id);
    setView('project');
  };

  const handleEditProject = (name: string, address: string, type: ProjectType, value: number, status: ProjectStatus, reason: string) => {
    if (!editProject) return;
    save(projects.map(p => p.id === editProject.id ? {
      ...p, name, address, type, value,
      projectStatus: status,
      statusDate: status !== editProject.projectStatus ? new Date().toISOString() : p.statusDate,
      statusReason: reason,
    } : p));
    setEditProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm('Delete this project and all its data?')) return;
    save(projects.filter(p => p.id !== id));
    if (activeProjectId === id) { setView('dashboard'); setActiveProjectId(null); }
  };

  const handleChangeStatus = (id: string, newStatus: ProjectStatus, reason?: string) => {
    save(projects.map(p => p.id === id ? {
      ...p,
      projectStatus: newStatus,
      statusDate: new Date().toISOString(),
      statusReason: reason || p.statusReason,
    } : p));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    save(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const openProject = (id: string) => {
    setActiveProjectId(id);
    setView('project');
    setProjectTab('permits');
  };

  const getProjectProgress = (p: Project) => {
    const total = p.permits.length + p.documents.length;
    const done = p.permits.filter(pm => ['Approved', 'Issued', 'Closed'].includes(pm.status)).length + p.documents.filter(d => d.uploaded).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };

  const filteredProjects = projects
    .filter(p => p.projectStatus === statusFilter)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
    );

  // Show login page if not authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin">⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold cursor-pointer" onClick={() => { setView('dashboard'); setActiveProjectId(null); }}>
              🏗️ SCE Permits
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              {projects.length} projects
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm flex items-center gap-2">
              <span style={{ color: 'var(--text-secondary)' }}>👤 {user?.name}</span>
            </div>
            <button
              onClick={() => setView('compliance')}
              className={`btn-secondary text-sm ${view === 'compliance' ? 'ring-2 ring-blue-500' : ''}`}
            >
              🛡️ <span className="hidden sm:inline">Compliance</span>
            </button>
            <button
              onClick={logout}
              className="btn-secondary text-sm"
              title="Sign out"
            >
              🚪 <span className="hidden sm:inline">Sign Out</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-4">
            {/* Status Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card text-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('active')} style={statusFilter === 'active' ? { borderColor: '#059669', borderWidth: '2px' } : {}}>
                <div className="text-3xl font-bold" style={{ color: '#059669' }}>{statusCounts.active}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>🟢 Active</div>
              </div>
              <div className="card text-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('potential')} style={statusFilter === 'potential' ? { borderColor: '#d97706', borderWidth: '2px' } : {}}>
                <div className="text-3xl font-bold" style={{ color: '#d97706' }}>{statusCounts.potential}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>🟡 Potential</div>
              </div>
              <div className="card text-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('declined')} style={statusFilter === 'declined' ? { borderColor: '#dc2626', borderWidth: '2px' } : {}}>
                <div className="text-3xl font-bold" style={{ color: '#dc2626' }}>{statusCounts.declined}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>🔴 Declined</div>
              </div>
            </div>

            {/* Potential Permits Alert */}
            {statusCounts.potential > 0 && statusFilter !== 'potential' && (
              <div className="card flex items-center gap-3" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
                <span className="text-2xl">⚡</span>
                <div>
                  <div className="font-semibold" style={{ color: '#92400e' }}>{statusCounts.potential} Potential Permit{statusCounts.potential > 1 ? 's' : ''} Awaiting Review</div>
                  <div className="text-sm" style={{ color: '#a16207' }}>
                    <button onClick={() => setStatusFilter('potential')} className="underline font-medium">View queue →</button>
                  </div>
                </div>
              </div>
            )}

            {/* Status Filter Tabs */}
            <PermitTabs activeTab={statusFilter} onTabChange={setStatusFilter} counts={statusCounts} />

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h2 className="text-2xl font-bold">
                {statusFilter === 'active' && 'Active Projects'}
                {statusFilter === 'potential' && 'Potential / Queue'}
                {statusFilter === 'declined' && 'Declined Projects'}
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  className="input flex-1 sm:w-64"
                  placeholder="Search projects..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button onClick={() => setShowNewProject(true)} className="btn-primary text-sm whitespace-nowrap">
                  + New Project
                </button>
              </div>
            </div>

            {showNewProject && (
              <ProjectForm onSubmit={handleCreateProject} onCancel={() => setShowNewProject(false)} />
            )}

            {editProject && (
              <ProjectForm
                onSubmit={handleEditProject}
                onCancel={() => setEditProject(null)}
                initial={{ name: editProject.name, address: editProject.address, type: editProject.type, value: editProject.value, status: editProject.projectStatus, reason: editProject.statusReason }}
              />
            )}

            {filteredProjects.length === 0 && !showNewProject ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">
                  {statusFilter === 'active' && '🏗️'}
                  {statusFilter === 'potential' && '📋'}
                  {statusFilter === 'declined' && '🚫'}
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  No {statusFilter === 'active' ? 'active' : statusFilter === 'potential' ? 'potential' : 'declined'} projects
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {statusFilter === 'active' && 'Create a new project or move a potential project to active.'}
                  {statusFilter === 'potential' && 'No projects awaiting review. All clear!'}
                  {statusFilter === 'declined' && 'No declined projects.'}
                </p>
                <button onClick={() => setShowNewProject(true)} className="btn-primary">Create Project</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map(p => {
                  const progress = getProjectProgress(p);
                  const notStarted = p.permits.filter(pm => pm.status === 'Not Started').length;
                  return (
                    <div key={p.id} className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openProject(p.id)}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{p.name}</h3>
                            <ProjectStatusBadge status={p.projectStatus} reason={p.statusReason} />
                          </div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.address}</p>
                        </div>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setEditProject(p)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-secondary)' }}>✏️</button>
                          <button onClick={() => handleDeleteProject(p.id)} className="text-xs px-2 py-1 rounded text-red-500" style={{ background: 'var(--bg-secondary)' }}>🗑️</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{p.type}</span>
                        {p.value > 0 && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>${p.value.toLocaleString()}</span>}
                        {(p as any)._intakeSource && (
                          <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                            📝 Client Intake
                          </span>
                        )}
                      </div>

                      {(p as any)._intakeRef && (
                        <div className="text-xs mb-2 font-mono px-2 py-1 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                          🔗 {(p as any)._intakeRef}
                        </div>
                      )}

                      {(p as any)._clientEmail && (
                        <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                          📧 {(p as any)._clientEmail} {(p as any)._clientPhone ? `• 📱 ${(p as any)._clientPhone}` : ''}
                        </div>
                      )}

                      {/* Quick status change buttons */}
                      <div className="flex gap-1 mb-3" onClick={e => e.stopPropagation()}>
                        {p.projectStatus !== 'active' && (
                          <button onClick={() => handleChangeStatus(p.id, 'active')} className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#d1fae5', color: '#059669' }}>→ Active</button>
                        )}
                        {p.projectStatus !== 'potential' && (
                          <button onClick={() => handleChangeStatus(p.id, 'potential')} className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#fef3c7', color: '#d97706' }}>→ Queue</button>
                        )}
                        {p.projectStatus !== 'declined' && (
                          <button onClick={() => {
                            const r = prompt('Reason for declining (optional):');
                            handleChangeStatus(p.id, 'declined', r || '');
                          }} className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#fee2e2', color: '#dc2626' }}>→ Decline</button>
                        )}
                      </div>

                      {p.statusReason && p.projectStatus === 'declined' && (
                        <div className="text-xs mb-2 italic" style={{ color: 'var(--error)' }}>
                          💬 {p.statusReason}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        <span>{p.permits.length} permits</span>
                        <span>•</span>
                        <span>{p.subcontractors.length} subs</span>
                        <span>•</span>
                        <span>{p.documents.filter(d => d.uploaded).length}/{p.documents.length} docs</span>
                      </div>
                      {notStarted > 0 && (
                        <div className="text-xs text-red-500 mb-2">⚠️ {notStarted} permit(s) not started</div>
                      )}
                      <div className="w-full rounded-full h-1.5" style={{ background: 'var(--border)' }}>
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%`, background: progress === 100 ? 'var(--success)' : 'var(--accent)' }}
                        />
                      </div>
                      <div className="text-xs mt-1 text-right" style={{ color: 'var(--text-secondary)' }}>{progress}% complete</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Project Detail View */}
        {view === 'project' && activeProject && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <button onClick={() => { setView('dashboard'); setActiveProjectId(null); }} className="hover:underline">Projects</button>
              <span>/</span>
              <span style={{ color: 'var(--text)' }}>{activeProject.name}</span>
            </div>

            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{activeProject.name}</h2>
                    <ProjectStatusBadge status={activeProject.projectStatus} reason={activeProject.statusReason} />
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activeProject.address} • {activeProject.type} • ${activeProject.value.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick status change in detail view */}
                  <div className="flex gap-1">
                    {activeProject.projectStatus !== 'active' && (
                      <button onClick={() => handleChangeStatus(activeProject.id, 'active')} className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#d1fae5', color: '#059669' }}>→ Active</button>
                    )}
                    {activeProject.projectStatus !== 'potential' && (
                      <button onClick={() => handleChangeStatus(activeProject.id, 'potential')} className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#fef3c7', color: '#d97706' }}>→ Queue</button>
                    )}
                    {activeProject.projectStatus !== 'declined' && (
                      <button onClick={() => {
                        const r = prompt('Reason for declining (optional):');
                        handleChangeStatus(activeProject.id, 'declined', r || '');
                      }} className="text-xs px-2 py-1 rounded font-medium" style={{ background: '#fee2e2', color: '#dc2626' }}>→ Decline</button>
                    )}
                  </div>
                </div>
              </div>
              {activeProject.statusReason && activeProject.projectStatus === 'declined' && (
                <div className="text-sm mt-2 italic" style={{ color: 'var(--error)' }}>
                  💬 Decline reason: {activeProject.statusReason}
                </div>
              )}
              {(activeProject as any)._intakeSource && (
                <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: '#eff6ff', borderLeft: '3px solid #3b82f6' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold" style={{ color: '#1d4ed8' }}>📝 Submitted via Client Intake Form</span>
                  </div>
                  <div className="text-xs space-y-1" style={{ color: '#1e40af' }}>
                    <div>🔗 Reference: <span className="font-mono font-medium">{(activeProject as any)._intakeRef}</span></div>
                    {(activeProject as any)._clientEmail && <div>📧 {(activeProject as any)._clientEmail} {(activeProject as any)._clientPhone ? `• 📱 ${(activeProject as any)._clientPhone}` : ''}</div>}
                    {(activeProject as any)._budgetEstimate > 0 && <div>💰 AI Budget Estimate: ${(activeProject as any)._budgetEstimate.toLocaleString()}</div>}
                    {(activeProject as any)._scopeOfWork && <div>📋 Scope: {(activeProject as any)._scopeOfWork.substring(0, 200)}{(activeProject as any)._scopeOfWork.length > 200 ? '...' : ''}</div>}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {activeProject.permits.map(p => (
                  <div key={p.id} className="text-center">
                    <StatusBadge status={p.status} />
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{p.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
              {([
                ['permits', '📋 Permits'],
                ['subs', '👷 Subs'],
                ['docs', '📄 Docs'],
                ['timeline', '📅 Timeline'],
              ] as [ProjectTab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  className={`tab ${projectTab === key ? 'active' : ''}`}
                  onClick={() => setProjectTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {projectTab === 'permits' && (
              <PermitPanel
                permits={activeProject.permits}
                onUpdate={permits => updateProject(activeProject.id, { permits })}
              />
            )}
            {projectTab === 'subs' && (
              <SubcontractorPanel
                subs={activeProject.subcontractors}
                onUpdate={subcontractors => updateProject(activeProject.id, { subcontractors })}
              />
            )}
            {projectTab === 'docs' && (
              <DocumentPanel
                docs={activeProject.documents}
                onUpdate={documents => updateProject(activeProject.id, { documents })}
              />
            )}
            {projectTab === 'timeline' && (
              <TimelinePanel
                project={activeProject}
                onUpdate={timeline => updateProject(activeProject.id, { timeline })}
              />
            )}
          </div>
        )}

        {/* Compliance View */}
        {view === 'compliance' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <button onClick={() => { setView('dashboard'); }} className="hover:underline">Projects</button>
              <span>/</span>
              <span style={{ color: 'var(--text)' }}>Compliance</span>
            </div>
            <ComplianceDashboard projects={projects} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-4 text-center text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        Southern Cities Enterprises • Permit Manager v1.1
      </footer>
    </div>
  );
}
