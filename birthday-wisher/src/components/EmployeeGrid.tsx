'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import type { Employee, Template } from '@/lib/types';
import { calculateAge, formatBirthday } from '@/lib/utils';

interface Props {
  employees: Employee[];
  templates: Template[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

export function EmployeeGrid({ employees, templates, onEdit, onDelete }: Props) {
  const templateLookup = new Map(templates.map((template) => [template.id, template.name]));

  if (employees.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No teammates yet — add your first birthday above.
      </div>
    );
  }

  const today = format(new Date(), 'MMMM d, yyyy');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Birthday roster</h2>
        <span className="text-sm text-slate-500">Today is {today}</span>
      </div>
      <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {employees.map((employee) => {
          const age = calculateAge(employee.dob);
          const templateName = employee.templateId ? templateLookup.get(employee.templateId) : null;
          return (
            <li
              key={employee.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{employee.name}</h3>
                  <p className="text-sm text-slate-500">
                    {employee.designation} • {employee.team}
                  </p>
                  <p className="mt-1 text-sm font-medium text-indigo-600">
                    {formatBirthday(employee.dob)}
                    {age !== undefined && ` · turning ${age + 1}`}
                  </p>
                </div>
                {employee.photoBase64 && employee.photoContentType ? (
                  <Image
                    src={`data:${employee.photoContentType};base64,${employee.photoBase64}`}
                    alt={employee.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-600">
                    {employee.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
              </div>
              {employee.message && (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{employee.message}</p>
              )}
              <div className="space-y-1 text-sm text-slate-500">
                <p>
                  <span className="font-medium text-slate-700">Email:</span> {employee.email}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Template:</span>{' '}
                  {templateName ?? 'None'}
                </p>
                <p className="text-xs text-slate-400">
                  Last updated {new Date(employee.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="mt-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onEdit(employee)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(employee.id)}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
