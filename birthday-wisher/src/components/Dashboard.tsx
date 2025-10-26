'use client';

import { useState } from 'react';
import type { Employee, Template } from '@/lib/types';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeGrid } from './EmployeeGrid';
import { TemplateManager } from './TemplateManager';

interface Props {
  initialEmployees: Employee[];
  initialTemplates: Template[];
}

export function Dashboard({ initialEmployees, initialTemplates }: Props) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [templates, setTemplates] = useState(initialTemplates);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [banner, setBanner] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  const showBanner = (tone: 'success' | 'error', message: string) => {
    setBanner({ tone, message });
    setTimeout(() => setBanner(null), 5000);
  };

  const handleCreate = async (formData: FormData) => {
    const response = await fetch('/api/employees', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? 'Failed to save teammate');
    }
    const payload = await response.json();
    setEmployees((prev) => [...prev, payload.data]);
    showBanner('success', `Saved ${payload.data.name}`);
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editing) return;
    const response = await fetch(`/api/employees/${editing.id}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error ?? 'Failed to update teammate');
    }
    const payload = await response.json();
    setEmployees((prev) => prev.map((item) => (item.id === payload.data.id ? payload.data : item)));
    setEditing(null);
    showBanner('success', `Updated ${payload.data.name}`);
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      showBanner('error', payload.error ?? 'Failed to remove teammate');
      return;
    }
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    if (editing?.id === id) {
      setEditing(null);
    }
    showBanner('success', 'Removed teammate');
  };

  const handleTemplateUploaded = (template: Template) => {
    setTemplates((prev) => [...prev, template]);
    showBanner('success', `Template "${template.name}" uploaded`);
  };

  const handleTemplateDeleted = (id: number) => {
    setTemplates((prev) => prev.filter((item) => item.id !== id));
    setEmployees((prev) =>
      prev.map((employee) => (employee.templateId === id ? { ...employee, templateId: null } : employee)),
    );
    showBanner('success', 'Template removed');
  };

  const handleSendNow = async () => {
    setIsSending(true);
    try {
      const response = await fetch('/api/send', { method: 'POST' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to trigger emails');
      }
      const sentCount = Array.isArray(payload.data?.sent) ? payload.data.sent.length : 0;
      const skippedCount = Array.isArray(payload.data?.skipped) ? payload.data.skipped.length : 0;
      showBanner(
        'success',
        `Triggered email run. Sent ${sentCount} and skipped ${skippedCount}.`,
      );
    } catch (error) {
      showBanner('error', error instanceof Error ? error.message : 'Email send failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-6 lg:p-10">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Birthday Broadcast HQ</h1>
            <p className="text-sm text-indigo-100">
              Manage templates, craft greetings, and deliver Outlook-ready wishes automatically.
            </p>
          </div>
          <button
            onClick={handleSendNow}
            disabled={isSending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isSending ? 'Sending…' : 'Send today’s emails'}
          </button>
        </div>
      </header>

      {banner && (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            banner.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {banner.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[2fr,1fr]">
        <div className="flex flex-col gap-8">
          {editing ? (
            <EmployeeForm
              templates={templates}
              initial={editing}
              submitLabel="Update teammate"
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <EmployeeForm templates={templates} onSubmit={handleCreate} />
          )}
          <EmployeeGrid employees={employees} templates={templates} onEdit={setEditing} onDelete={handleDelete} />
        </div>
        <TemplateManager
          templates={templates}
          onUploaded={handleTemplateUploaded}
          onDeleted={handleTemplateDeleted}
        />
      </div>
    </div>
  );
}
