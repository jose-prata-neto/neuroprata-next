import { ChartBar, Tag } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';
import type { Patient } from '@/server/db/schema';

interface ReportsDashboardProps {
  patient: Patient;
}

// Definição correta e explícita dos tipos para o CustomTooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload<number, string>[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-2 shadow-sm">
        <p className="font-bold text-slate-800">{label}</p>
        {payload.map((pld, index) => (
          <p key={`item-${index}`} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
CustomTooltip.displayName = 'CustomTooltip';

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ patient }) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredSessions = useMemo(() => {
    if (!(patient && patient.sessions)) return [];
    return patient.sessions.filter((session) => {
      const sessionDate = new Date(session.date);
      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;

      if (startDate && sessionDate < startDate) return false;

      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
        if (sessionDate > endDate) return false;
      }
      return true;
    });
  }, [patient, filters.startDate, filters.endDate]);

  const tagFrequencyData = useMemo(() => {
    const tagCounts = filteredSessions.reduce(
      (acc: { [key: string]: number }, session) => {
        (session.tags || []).forEach((tag) => {
          acc[tag.text] = (acc[tag.text] || 0) + 1;
        });
        return acc;
      },
      {}
    );

    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, Frequência: count }))
      .sort((a, b) => b.Frequência - a.Frequência)
      .slice(0, 10);
  }, [filteredSessions]);

  const sessionFrequencyData = useMemo(() => {
    if (filteredSessions.length < 1) {
      return [];
    }

    const sessionCountsByMonth = filteredSessions.reduce(
      (acc: { [key: string]: number }, session) => {
        const date = new Date(session.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      },
      {}
    );

    const sortedMonths = Object.keys(sessionCountsByMonth).sort();

    return sortedMonths.map((monthKey) => {
      const [year, month] = monthKey.split('-');
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
      const monthName = date.toLocaleString('pt-BR', {
        month: 'short',
        year: '2-digit',
      });

      return {
        month:
          monthName.charAt(0).toUpperCase() +
          monthName.slice(1).replace('.', ''),
        Sessões: sessionCountsByMonth[monthKey],
      };
    });
  }, [filteredSessions]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <div>
          <label
            className="block font-medium text-slate-700 text-sm"
            htmlFor="report-startDate"
          >
            Data Inicial
          </label>
          <input
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            id="report-startDate"
            name="startDate"
            onChange={handleFilterChange}
            type="date"
            value={filters.startDate}
          />
        </div>
        <div>
          <label
            className="block font-medium text-slate-700 text-sm"
            htmlFor="report-endDate"
          >
            Data Final
          </label>
          <input
            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
            id="report-endDate"
            name="endDate"
            onChange={handleFilterChange}
            type="date"
            value={filters.endDate}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-bold text-slate-800 text-xl">
          Frequência de Sessões (Mensal)
        </h3>
        {sessionFrequencyData.length > 1 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart
                data={sessionFrequencyData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="month"
                  fontSize={12}
                  stroke="#475569"
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#475569"
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                />
                <Line
                  activeDot={{ r: 8 }}
                  dataKey="Sessões"
                  stroke="#475569"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-slate-200 border-dashed p-8 text-center">
            <ChartBar className="mx-auto h-12 w-12 text-slate-400" />
            <h4 className="mt-4 font-semibold text-lg text-slate-700">
              Dados insuficientes
            </h4>
            <p className="mt-1 text-slate-500">
              São necessárias sessões em pelo menos dois meses diferentes para
              gerar este gráfico.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 font-bold text-slate-800 text-xl">
          Frequência de Tags Clínicas
        </h3>
        {tagFrequencyData.length > 0 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                barSize={40}
                data={tagFrequencyData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  fontSize={12}
                  stroke="#475569"
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="#475569"
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                />
                <Bar
                  dataKey="Frequência"
                  fill="#64748b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-slate-200 border-dashed p-8 text-center">
            <Tag className="mx-auto h-12 w-12 text-slate-400" />
            <h4 className="mt-4 font-semibold text-lg text-slate-700">
              Nenhuma tag clínica encontrada
            </h4>
            <p className="mt-1 text-slate-500">
              Use a análise de IA ao registrar sessões para gerar tags e
              visualizar sua frequência aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;
