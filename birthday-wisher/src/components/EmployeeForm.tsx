'use client';

import { useRef, useState } from 'react';
import type { Employee, Template } from '@/lib/types';

interface Props {
  templates: Template[];
  initial?: Partial<Employee>;
  submitLabel?: string;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
}

const emptyState = {
  name: '',
  designation: '',
  team: '',
  email: '',
  dob: '',
  message: '',
  templateId: '',
};

export function EmployeeForm({ templates, initial, submitLabel = 'Save', onSubmit, onCancel }: Props) {
  const [state, setState] = useState(() => ({
    ...emptyState,
    ...initial,
    dob: initial?.dob ? initial.dob.slice(0, 10) : '',
    templateId: initial?.templateId ? String(initial.templateId) : '',
  }));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removePhoto, setRemovePhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);
      if (removePhoto) {
        formData.set('removePhoto', 'true');
      }
      await onSubmit(formData);
      if (!initial) {
        setState({ ...emptyState, dob: '', templateId: '' });
        if (photoInputRef.current) {
          photoInputRef.current.value = '';
        }
      }
      setRemovePhoto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{initial ? 'Edit Teammate' : 'Add Teammate'}</h2>
        <p className="text-sm text-slate-500">
          Capture everything we need to celebrate their day.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Name
          <input
            required
            name="name"
            value={state.name}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Designation
          <input
            required
            name="designation"
            value={state.designation}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Team
          <input
            required
            name="team"
            value={state.team}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Work Email
          <input
            required
            type="email"
            name="email"
            value={state.email}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Date of Birth
          <input
            required
            type="date"
            name="dob"
            value={state.dob}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Template
          <select
            name="templateId"
            value={state.templateId}
            onChange={handleChange}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">No template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Custom birthday message
        <textarea
          name="message"
          value={state.message}
          onChange={handleChange}
          rows={4}
          className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Share something personal to make it special..."
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Profile photo
        <input
          ref={photoInputRef}
          type="file"
          name="photo"
          accept="image/*"
          className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </label>

      {initial?.photoBase64 && !removePhoto && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <span className="text-sm text-slate-600">Existing photo attached.</span>
          <button
            type="button"
            onClick={() => setRemovePhoto(true)}
            className="text-sm font-medium text-rose-600 hover:text-rose-500"
          >
            Remove
          </button>
        </div>
      )}
      {removePhoto && (
        <div className="text-sm text-rose-600">Photo scheduled for removal after save.</div>
      )}

      {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
