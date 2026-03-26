'use client';
import { ProjectDocument } from '../types';

interface Props {
  docs: ProjectDocument[];
  onUpdate: (docs: ProjectDocument[]) => void;
}

export default function DocumentPanel({ docs, onUpdate }: Props) {
  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate(docs.map(d => d.id === docId ? { ...d, uploaded: true, fileData: reader.result as string, fileName: file.name } : d));
    };
    reader.readAsDataURL(file);
  };

  const updateNote = (docId: string, notes: string) => {
    onUpdate(docs.map(d => d.id === docId ? { ...d, notes } : d));
  };

  const removeFile = (docId: string) => {
    onUpdate(docs.map(d => d.id === docId ? { ...d, uploaded: false, fileData: '', fileName: '' } : d));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">Documents</h3>
      {docs.map(d => (
        <div key={d.id} className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${d.uploaded ? 'bg-green-500' : 'bg-red-400'}`}></span>
              <span className="font-medium">{d.type}</span>
            </div>
            {d.uploaded && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                {d.fileName}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              {!d.uploaded ? (
                <label className="block">
                  <span className="btn-secondary text-sm cursor-pointer inline-block">📎 Upload File</span>
                  <input type="file" className="hidden" onChange={e => handleFileUpload(d.id, e)} />
                </label>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">✓ Uploaded</span>
                  <button onClick={() => removeFile(d.id)} className="text-red-500 text-xs underline">Remove</button>
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                className="input text-sm"
                placeholder="Notes..."
                value={d.notes}
                onChange={e => updateNote(d.id, e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="card" style={{ background: 'var(--bg-secondary)' }}>
        <div className="text-sm font-medium">Document Summary</div>
        <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {docs.filter(d => d.uploaded).length} of {docs.length} documents uploaded
        </div>
        <div className="w-full rounded-full h-2 mt-2" style={{ background: 'var(--border)' }}>
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${(docs.filter(d => d.uploaded).length / docs.length) * 100}%`,
              background: docs.filter(d => d.uploaded).length === docs.length ? 'var(--success)' : 'var(--accent)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
