import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { AlertCircle, ShieldAlert, Send } from 'lucide-react';

export function SubmissionForm({ onSubmit, loading = false, disabled = false }) {
  const [content, setContent] = useState('');
  const [tabSwitches, setTabSwitches] = useState(0);

  // Basic Anti-cheat listener: count tab focus switches during attempt
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content, tabSwitches });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tabSwitches > 0 && (
        <div className="p-3 bg-ledger-gold/10 border border-ledger-gold/30 rounded-md flex items-center justify-between text-xs text-ink-navy">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-ledger-gold" />
            <span>
              Anti-Cheat Detection Active: <strong>{tabSwitches}</strong> tab focus switch{tabSwitches > 1 ? 'es' : ''} logged.
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate">Proctoring flag attached</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-mono font-semibold uppercase text-slate mb-1.5">
          Solution Source Code / Documentation
        </label>
        <textarea
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="// Paste or write your solution code here...
function solution() {
  // Your implementation
}"
          disabled={disabled || loading}
          className="w-full p-4 font-mono text-sm bg-ink-navy text-bone rounded-lg border border-slate focus:outline-none focus:ring-2 focus:ring-ledger-gold resize-y"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate font-mono">
          Submission content is timestamped and forwarded directly to recruiter verification pipeline.
        </span>

        <Button
          type="submit"
          variant="verified"
          disabled={disabled || loading || !content.trim()}
          className="flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Submitting Solution...' : 'Submit Challenge Solution'}
        </Button>
      </div>
    </form>
  );
}
