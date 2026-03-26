'use client';
import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectType } from './types';
import { loadProjects, saveProjects, createProject } from './store';
import ThemeToggle from './components/ThemeToggle';
import ProjectForm from './components/ProjectForm';
import PermitPanel from './components/PermitPanel';
import SubcontractorPanel from './components/SubcontractorPanel';
import DocumentPanel from './components/DocumentPanel';
import ComplianceDashboard from './components/ComplianceDashboard';
import TimelinePanel from './components/TimelinePanel';
import StatusBadge from './components/StatusBadge';

type View = 'dashboard' | 'project' | 'compliance';
type ProjectTab = 'permits' | 'subs' | 'docs' | 'timeline';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectTab, setProjectTab] = useState<ProjectTab>('permits');
  const [showNewProject, setShowNewProject] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => { setProjects(loadProjects()); }, []);

  const save = useCallback((updated: Project[]) => {
    setProjects(updated);
    saveProjects(updated);
  }, []);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleCreateProject = (name: string, address: string, type: ProjectType, value: number) => {
    const project = createProject(name, address, type, value);
    save([...projects, project]);
    setShowNewProject(false);
    setActiveProjectId(project.id);
    setView('project');
  };

  const handleEditProject = (name: string, address: string, type: ProjectType, value: number) => {
    if (!editProject) return;
    save(projects.map(p => p.id === editProject.id ? { ...p, name, address, type, value } : p));
    setEditProject(null);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm('Delete this project and all its data?')) return;
    save(projects.filter(p => p.id !== id));
    if (activeProjectId === id) { setView('dashboard'); setActiveProjectId(null); }
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

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

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
            <button
              onClick={() => setView('compliance')}
              className={`btn-secondary text-sm ${view === 'compliance' ? 'ring-2 ring-blue-500' : ''}`}
            >
              🛡️ <span className="hidden sm:inline">Compliance</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard View */}
        {view === 'dashboard' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <h2 className="text-2xl font-bold">Projects</h2>
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
                initial={{ name: editProject.name, address: editProject.address, type: editProject.type, value: editProject.value }}
              />
            )}

            {filteredProjects.length === 0 && !showNewProject ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">🏗️</div>
                <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Create your first project to start tracking permits.</p>
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
                          <h3 className="font-bold">{p.name}</h3>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{p.address}</p>
                        </div>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setEditProject(p)} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-secondary)' }}>✏️</button>
                          <button onClick={() => handleDeleteProject(p.id)} className="text-xs px-2 py-1 rounded text-red-500" style={{ background: 'var(--bg-secondary)' }}>🗑️</button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{p.type}</span>
                        {p.value > 0 && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>${p.value.toLocaleString()}</span>}
                      </div>
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
                  <h2 className="text-xl font-bold">{activeProject.name}</h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activeProject.address} • {activeProject.type} • ${activeProject.value.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeProject.permits.map(p => (
                    <div key={p.id} className="text-center">
                      <StatusBadge status={p.status} />
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{p.type}</div>
                    </div>
                  ))}
                </div>
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
        Southern Cities Enterprises • Permit Manager v1.0
      </footer>
    </div>
  );
}
