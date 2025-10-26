'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Template } from '@/lib/types';

interface Props {
  templates: Template[];
  onUploaded: (template: Template) => void;
  onDeleted: (id: number) => void;
}

export function TemplateManager({ templates, onUploaded, onDeleted }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Failed to upload template');
      }
      const payload = await response.json();
      onUploaded(payload.data);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'Failed to delete template');
      }
      onDeleted(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Birthday templates</h2>
        <p className="text-sm text-slate-500">
          Upload reusable artwork and notes that can be attached to each greeting.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Template name
          <input
            name="name"
            required
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="e.g. Leadership message"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Short description
          <input
            name="description"
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Where is this used?"
          />
        </label>
        <label className="sm:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
          Template message
          <textarea
            name="message"
            rows={3}
            className="rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Add a reusable note (optional)"
          />
        </label>
        <label className="sm:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-700">
          Upload artwork
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>
        {error && (
          <p className="sm:col-span-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
        )}
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Uploading…' : 'Upload template'}
          </button>
        </div>
      </form>
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Library</h3>
        {templates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No templates uploaded yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <li key={template.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{template.name}</h4>
                  {template.description && (
                    <p className="text-sm text-slate-500">{template.description}</p>
                  )}
                </div>
                <Image
                  src={`data:${template.contentType};base64,${template.dataBase64}`}
                  alt={template.name}
                  width={400}
                  height={230}
                  className="h-36 w-full rounded-lg object-cover"
                  unoptimized
                />
                {template.message && (
                  <p className="rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700">
                    {template.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(template.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
