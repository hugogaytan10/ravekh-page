import { useMemo, useState } from "react";
import type { Employee } from "../model/Employee";
import { GetEmployeesService } from "../services/GetEmployeesService";

interface EmployeesModernPageProps {
  businessId: number;
  currentUserId?: number;
  service: GetEmployeesService;
}

export function EmployeesModernPage({ businessId, currentUserId, service }: EmployeesModernPageProps) {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const visibleEmployees = useMemo(() => employees, [employees]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await service.execute(businessId, {
        query,
        excludeIds: currentUserId ? [currentUserId] : [],
      });
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Employees</h2>
        <button className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white" onClick={loadEmployees}>
          Refresh
        </button>
      </header>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name or email"
        className="mb-3 w-full rounded-md border px-3 py-2"
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading employees...</p>
      ) : (
        <ul className="space-y-2">
          {visibleEmployees.map((employee) => (
            <li key={employee.id} className="rounded-md border p-3">
              <p className="font-medium text-gray-800">{employee.name || "Unnamed employee"}</p>
              <p className="text-sm text-gray-500">{employee.email || "No email"}</p>
            </li>
          ))}
          {visibleEmployees.length === 0 ? <p className="text-sm text-gray-500">No employees found.</p> : null}
        </ul>
      )}
    </section>
  );
}
