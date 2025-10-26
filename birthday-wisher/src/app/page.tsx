import { Dashboard } from '@/components/Dashboard';
import { getEmployees } from '@/lib/employeeService';
import { getTemplates } from '@/lib/templateService';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const employees = getEmployees();
  const templates = getTemplates();

  return (
    <div className="min-h-screen bg-slate-100">
      <Dashboard initialEmployees={employees} initialTemplates={templates} />
    </div>
  );
}
