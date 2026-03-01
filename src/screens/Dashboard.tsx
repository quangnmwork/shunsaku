import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar,
} from 'recharts';
import { colors } from '../constants';
import { Shell } from '../components/Shell';
import { Btn } from '../components/Btn';
import { calcAvgH, calcMonthlyAvgH, parseDate, DEMO_SCENARIOS, makeDemoData, type DemoScenario } from '../utils';
import type { HistoryEntry } from '../types';

interface DashboardProps {
  history: HistoryEntry[];
  initOdo: number;
  catalogH: number;
  bikeName: string;
  activeScenario: DemoScenario;
  onRecord: () => void;
  onDelete: (id: number) => void;
  onEdit: (entry: HistoryEntry) => void;
  onChangeScenario: (scenario: DemoScenario) => void;
}

// Honda Go style header with 当月/平均
function FuelHeader({ monthlyH, avgH }: { monthlyH: number | null; avgH: number | null }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 1,
      background: colors.white,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      <div style={{ padding: 20, textAlign: 'center', borderRight: `1px solid ${colors.light}` }}>
        <div style={{ fontSize: 12, color: colors.gray, marginBottom: 8 }}>当月</div>
        <div style={{ fontSize: 42, fontWeight: 700, color: colors.dark, lineHeight: 1 }}>
          {monthlyH ?? '—'}
        </div>
        <div style={{ fontSize: 14, color: colors.gray, marginTop: 4 }}>km/L</div>
      </div>
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: colors.gray, marginBottom: 8 }}>平均</div>
        <div style={{ fontSize: 42, fontWeight: 700, color: colors.dark, lineHeight: 1 }}>
          {avgH ?? '—'}
        </div>
        <div style={{ fontSize: 14, color: colors.gray, marginTop: 4 }}>km/L</div>
      </div>
    </div>
  );
}

// Monthly summary card (for 3m+ view)
function MonthlyCard({
  data,
  onClick,
}: {
  data: MonthlyData;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.white,
          borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        cursor: 'pointer',
        transition: 'transform 0.1s',
        }}
      >
      {/* Month header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
            marginBottom: 12,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: colors.dark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14 }}>📅</span>
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.dark }}>{data.label}</span>
        <span style={{ fontSize: 11, color: colors.gray }}>{data.count}回</span>
        <span style={{ marginLeft: 'auto', color: colors.gray, fontSize: 14 }}>→</span>
      </div>

      {/* Data row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: colors.gray }}>走行</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.dark, lineHeight: 1.2 }}>
              {data.totalDistance}<span style={{ fontSize: 11, fontWeight: 400, color: colors.gray }}> km</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: colors.gray }}>給油</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.dark, lineHeight: 1.2 }}>
              {data.totalFuel.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400, color: colors.gray }}> L</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          {data.avgKmpl != null ? (
            <div style={{ fontSize: 26, fontWeight: 700, color: colors.red, lineHeight: 1 }}>
              {data.avgKmpl}
              <span style={{ fontSize: 12, fontWeight: 400, color: colors.gray }}> km/L</span>
            </div>
          ) : (
            <div style={{ fontSize: 20, color: colors.gray, lineHeight: 1 }}>—</div>
          )}
          <div style={{ fontSize: 10, color: colors.gray }}>平均</div>
        </div>
      </div>
    </div>
  );
}

// Honda Go style history card
function HistoryCard({
  entry,
  prevOdo,
  onEdit,
  onDelete,
}: {
  entry: HistoryEntry;
  prevOdo: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const deltaOdo = entry.odo - prevOdo;
  // Show full datetime: "2026/02/28 14:30"
  const dateStr = entry.date;

  return (
    <div 
      onClick={onEdit}
      style={{
        background: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.1s',
      }}
    >
      {/* Date header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: colors.dark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14 }}>⛽</span>
        </div>
        <span style={{ fontSize: 13, color: colors.dark }}>{dateStr}</span>
        {!entry.isFullTank && !entry.skipCalculation && (
          <span style={{
            fontSize: 10,
            background: colors.blueBg,
            color: colors.blue,
            padding: '2px 6px',
            borderRadius: 8,
          }}>
            部分
          </span>
        )}
        {entry.skipCalculation && (
          <span style={{
            fontSize: 10,
            background: '#FFEBEE',
            color: '#D32F2F',
            padding: '2px 6px',
            borderRadius: 8,
          }}>
            記録忘れ
          </span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: colors.gray,
            fontSize: 14,
          }}
        >
          ✕
        </button>
      </div>

      {/* Data row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Left: distance & fuel */}
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: 10, color: colors.gray }}>走行</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.dark, lineHeight: 1.2 }}>
              {deltaOdo}<span style={{ fontSize: 11, fontWeight: 400, color: colors.gray }}> km</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: colors.gray }}>給油</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: colors.dark, lineHeight: 1.2 }}>
              {entry.fuel.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400, color: colors.gray }}> L</span>
            </div>
          </div>
        </div>

        {/* Right: kmpl */}
        <div style={{ textAlign: 'right' }}>
          {entry.kmpl != null ? (
            <div style={{ fontSize: 28, fontWeight: 700, color: colors.red, lineHeight: 1 }}>
              {entry.kmpl.toFixed(1)}
              <span style={{ fontSize: 12, fontWeight: 400, color: colors.gray }}> km/L</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 22, color: colors.gray, lineHeight: 1 }}>—</div>
              {!entry.skipCalculation && !entry.isFullTank && (
                <div style={{ fontSize: 9, color: colors.gray }}>次回満タンで計算</div>
              )}
              {entry.skipCalculation && (
                <div style={{ fontSize: 9, color: '#D32F2F' }}>基準リセット</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Subtle ODO */}
      <div style={{ fontSize: 10, color: colors.gray, marginTop: 8, textAlign: 'right' }}>
        ODO {entry.odo.toLocaleString()} km
      </div>
    </div>
  );
}

// Recharts fuel efficiency chart
function FuelChart({
  history,
  avgH,
}: {
  history: HistoryEntry[];
  avgH: number | null;
}) {
  const validKmplValues = history.filter(h => h.kmpl != null).map(h => h.kmpl as number);
  const chartAvg = avgH ?? (validKmplValues.length ? validKmplValues.reduce((a, b) => a + b, 0) / validKmplValues.length : 40);
  
  // Map history to chart data
  const data = history.map((h) => ({
    name: h.date.slice(5, 10), // "02/28" for X-axis
    fullDate: h.date.slice(5), // "02/28 14:30" for tooltip
    kmpl: h.kmpl,
    type: h.skipCalculation ? 'missed' : (!h.isFullTank ? 'partial' : 'full'),
  }));

  const hasSpecial = data.some(d => d.type !== 'full');

  if (data.length < 2) {
  return (
      <div style={{ textAlign: 'center', color: colors.gray, fontSize: 13, padding: '30px 0' }}>
        2回以上記録するとグラフが表示されます
      </div>
    );
  }

  // Y-axis: reasonable range
  const maxKmpl = Math.max(...validKmplValues, chartAvg);
  const maxY = Math.ceil(maxKmpl / 10) * 10 + 10;


  // Custom X-axis tick with symbols for 部分/忘れ
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderXTick = (props: any) => {
    const { x, y, payload } = props;
    const item = data.find(d => d.name === payload.value);
    if (!item) return null;
    
    const isPartial = item.type === 'partial';
    const isMissed = item.type === 'missed';
    
          return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={12} 
          textAnchor="middle" 
          fill={colors.gray} 
          fontSize={10}
        >
          {item.name}
        </text>
        {isPartial && (
          <circle cx={0} cy={22} r={4} fill="none" stroke={colors.blue} strokeWidth={2} />
        )}
        {isMissed && (
          <g>
            <line x1={-4} y1={18} x2={4} y2={26} stroke={colors.warn} strokeWidth={2} />
            <line x1={4} y1={18} x2={-4} y2={26} stroke={colors.warn} strokeWidth={2} />
          </g>
        )}
      </g>
    );
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={hasSpecial ? 200 : 160}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: hasSpecial ? 35 : 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.light} />
          <XAxis 
            dataKey="name" 
            tick={renderXTick}
            tickLine={false}
            interval={0}
          />
          <YAxis domain={[0, maxY]} tick={{ fontSize: 10, fill: colors.gray }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={{ 
                  background: colors.white, 
                  padding: '8px 12px', 
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  fontSize: 12,
                }}>
                  <div style={{ color: colors.gray, marginBottom: 4 }}>{d.fullDate}</div>
                  {d.type === 'partial' ? (
                    <div style={{ color: colors.blue, fontWeight: 600 }}>部分給油</div>
                  ) : d.type === 'missed' ? (
                    <div style={{ color: colors.warn, fontWeight: 600 }}>記録忘れ</div>
                  ) : (
                    <div style={{ color: colors.red, fontWeight: 600 }}>{d.kmpl?.toFixed(1)} km/L</div>
                  )}
                </div>
              );
            }}
          />
          {avgH != null && (
            <ReferenceLine y={avgH} stroke={colors.green} strokeDasharray="4 4" label={{ value: `avg: ${avgH}`, fontSize: 10, fill: colors.green }} />
          )}
          {/* Line with dots for 満タン points only */}
          <Line
            type="monotone"
            dataKey="kmpl"
            stroke={colors.red}
            strokeWidth={2}
            dot={{ r: 4, fill: colors.red }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      {hasSpecial && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: colors.red, display: 'inline-block' }} />
            <span style={{ color: colors.gray }}>満タン</span>
                  </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ 
              width: 10, 
              height: 10, 
              borderRadius: '50%', 
              border: `2px solid ${colors.blue}`, 
              display: 'inline-block',
              boxSizing: 'border-box',
            }} />
            <span style={{ color: colors.gray }}>部分給油</span>
                </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ color: colors.warn, fontWeight: 700, fontSize: 12 }}>✕</span>
            <span style={{ color: colors.gray }}>記録忘れ</span>
              </div>
            </div>
      )}
    </div>
  );
}

// Monthly bar chart (for 3m+ view)
function MonthlyChart({
  monthlyData,
  avgH,
  onClickMonth,
}: {
  monthlyData: MonthlyData[];
  avgH: number | null;
  onClickMonth: (month: string) => void;
}) {
  // Check if data spans multiple years
  const years = new Set(monthlyData.map(m => m.month.slice(0, 4)));
  const showYear = years.size > 1;

  const data = monthlyData.map((m, i) => {
    const year = m.month.slice(2, 4); // "25" or "26"
    const monthNum = parseInt(m.month.slice(5));
    // Only show year on first item or when year changes
    const prevYear = i > 0 ? monthlyData[i - 1].month.slice(0, 4) : null;
    const yearChanged = prevYear !== m.month.slice(0, 4);
    const needYear = showYear && (i === 0 || yearChanged);
    return {
      name: needYear ? `${monthNum}月'${year}` : `${monthNum}月`,
      month: m.month,
      kmpl: m.avgKmpl,
    };
  });

  const validKmpl = data.filter(d => d.kmpl != null).map(d => d.kmpl as number);

  if (data.length === 0 || validKmpl.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: colors.gray, fontSize: 13, padding: '30px 0' }}>
        データがありません
      </div>
    );
  }

  // Y-axis: start from 0 or reasonable minimum
  const maxY = Math.ceil(Math.max(...validKmpl) / 5) * 5 + 5; // Round up to nearest 5

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.light} vertical={false} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 9, fill: colors.dark }}
          tickLine={false}
          axisLine={false}
          interval={0}
        />
        <YAxis domain={[0, maxY]} tick={{ fontSize: 10, fill: colors.gray }} axisLine={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div style={{ 
                background: colors.white, 
                padding: '8px 12px', 
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontSize: 12,
              }}>
                <div style={{ color: colors.gray, marginBottom: 4 }}>{d.name}</div>
                {d.kmpl != null ? (
                  <div style={{ color: colors.red, fontWeight: 600 }}>{d.kmpl} km/L</div>
                ) : (
                  <div style={{ color: colors.gray }}>—</div>
                )}
              </div>
            );
          }}
        />
        {avgH != null && (
          <ReferenceLine y={avgH} stroke={colors.green} strokeDasharray="4 4" label={{ value: `avg`, fontSize: 10, fill: colors.green }} />
        )}
        <Bar 
          dataKey="kmpl" 
          fill={colors.red} 
          radius={[4, 4, 0, 0]}
          onClick={(d) => onClickMonth((d as unknown as { month: string }).month)}
          style={{ cursor: 'pointer' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Scenario selector modal
function ScenarioModal({
  active,
  catalogH,
  onSelect,
  onClose,
}: {
  active: DemoScenario;
  catalogH: number;
  onSelect: (s: DemoScenario) => void;
  onClose: () => void;
}) {
  return (
    <div style={{
      position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
        zIndex: 100,
    }}>
      <div style={{
        background: colors.white,
        borderRadius: 12,
        padding: 24,
        margin: 20,
        maxWidth: 360,
        width: '100%',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.dark, marginBottom: 16 }}>
          📊 デモデータ切替
        </div>
        {DEMO_SCENARIOS.map(({ id, label, desc }) => {
          const { history } = makeDemoData(id, catalogH);
          const example = history.map(h => h.kmpl != null ? h.kmpl.toFixed(0) : '—').join(' → ');
          
          return (
          <div
            key={id}
            onClick={() => onSelect(id)}
            style={{
              padding: 14,
              borderRadius: 8,
              marginBottom: 8,
                cursor: 'pointer',
              border: `2px solid ${active === id ? colors.red : colors.light}`,
                background: active === id ? '#FFF0F0' : colors.white,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, color: active === id ? colors.red : colors.dark }}>
              {label}
            </div>
            <div style={{ fontSize: 12, color: colors.gray, marginTop: 4 }}>{desc}</div>
              <div style={{ fontSize: 11, color: colors.blue, marginTop: 4 }}>
                燃費: {example}
              </div>
          </div>
          );
        })}
        <div style={{ marginTop: 8 }}>
          <Btn secondary onClick={onClose}>閉じる</Btn>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation modal
function DeleteModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: colors.white,
        borderRadius: 12,
        padding: 24,
        margin: 20,
        maxWidth: 320,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: colors.dark, marginBottom: 12 }}>
          記録を削除しますか？
            </div>
        <div style={{ fontSize: 14, color: colors.gray, lineHeight: 1.6, marginBottom: 16 }}>
          最新の給油記録を削除します。
                  </div>
        <Btn danger onClick={onConfirm}>削除する</Btn>
        <div style={{ marginTop: 8 }}>
          <Btn secondary onClick={onCancel}>キャンセル</Btn>
                  </div>
                </div>
                    </div>
  );
}

type FilterPeriod = '1m' | '3m' | '6m' | '1y';

// Filter buttons component
function PeriodFilter({ active, onChange }: { active: FilterPeriod; onChange: (p: FilterPeriod) => void }) {
  const options: { key: FilterPeriod; label: string }[] = [
    { key: '1m', label: '1ヶ月' },
    { key: '3m', label: '3ヶ月' },
    { key: '6m', label: '6ヶ月' },
    { key: '1y', label: '1年' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      {options.map(o => (
                  <button
          key={o.key}
          onClick={() => onChange(o.key)}
                    style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            background: active === o.key ? colors.red : colors.light,
            color: active === o.key ? colors.white : colors.gray,
            transition: 'all 0.2s',
                    }}
                  >
          {o.label}
                  </button>
        ))}
    </div>
  );
}

// Helper: get months count from period
function getPeriodMonths(period: FilterPeriod): number {
  switch (period) {
    case '1m': return 1;
    case '3m': return 3;
    case '6m': return 6;
    case '1y': return 12;
  }
}

// Helper: filter history by period
function filterByPeriod(history: HistoryEntry[], period: FilterPeriod): HistoryEntry[] {
  const months = getPeriodMonths(period);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return history.filter(h => parseDate(h.date) >= cutoff);
}

// Helper: aggregate history by month
interface MonthlyData {
  month: string; // "2026/02"
  label: string; // "2月"
  avgKmpl: number | null;
  totalFuel: number;
  totalDistance: number;
  count: number;
  hasPartial: boolean;
  hasMissed: boolean;
  entries: HistoryEntry[];
}

function aggregateByMonth(history: HistoryEntry[], initOdo: number): MonthlyData[] {
  const groups: Record<string, HistoryEntry[]> = {};
  
  for (const entry of history) {
    const month = entry.date.slice(0, 7); // "2026/02"
    if (!groups[month]) groups[month] = [];
    groups[month].push(entry);
  }

  const result: MonthlyData[] = [];
  const sortedMonths = Object.keys(groups).sort();

  for (const month of sortedMonths) {
    const entries = groups[month];
    const validKmpl = entries.filter(e => e.kmpl != null).map(e => e.kmpl as number);
    const avgKmpl = validKmpl.length > 0 
      ? parseFloat((validKmpl.reduce((a, b) => a + b, 0) / validKmpl.length).toFixed(1))
      : null;

    // Calculate total distance for this month
    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    const prevOdo = history.indexOf(firstEntry) > 0 
      ? history[history.indexOf(firstEntry) - 1].odo 
      : initOdo;
    const totalDistance = lastEntry.odo - prevOdo;

    result.push({
      month,
      label: `${parseInt(month.slice(5))}月`,
      avgKmpl,
      totalFuel: entries.reduce((sum, e) => sum + e.fuel, 0),
      totalDistance,
      count: entries.length,
      hasPartial: entries.some(e => !e.isFullTank && !e.skipCalculation),
      hasMissed: entries.some(e => e.skipCalculation),
      entries,
    });
  }

  return result;
}

export function Dashboard({
  history,
  initOdo,
  catalogH,
  bikeName,
  activeScenario,
  onRecord,
  onDelete,
  onEdit,
  onChangeScenario,
}: DashboardProps) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showScenario, setShowScenario] = useState(false);
  const [period, setPeriod] = useState<FilterPeriod>('1m');
  const [drillMonth, setDrillMonth] = useState<string | null>(null); // For drill-down
  
  // Check if record is latest (no confirm needed for delete)
  const isLatestRecord = (id: number) => history.length > 0 && history[history.length - 1].id === id;

  const avgH = calcAvgH(history, initOdo);
  const monthlyH = calcMonthlyAvgH(history);

  // Filter data by period
  const filteredHistory = filterByPeriod(history, period);
  const monthlyData = aggregateByMonth(filteredHistory, initOdo);

  // Determine view mode
  const isMonthlyView = period !== '1m' && !drillMonth;
  const isDrillView = drillMonth != null;

  // Get drill-down data
  const drillData = isDrillView 
    ? monthlyData.find(m => m.month === drillMonth)?.entries ?? []
    : [];

  const handleDelete = (id: number) => {
    if (isLatestRecord(id)) {
      // Delete latest record directly, no confirmation needed
      onDelete(id);
    } else {
      // Show confirmation modal for non-latest records
      setConfirmDelete(id);
    }
  };

  return (
    <>
      <Shell title={bikeName}>
        {confirmDelete != null && (
        <DeleteModal
          onConfirm={() => {
              onDelete(confirmDelete);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

        {/* Honda Go style header */}
        <FuelHeader monthlyH={monthlyH} avgH={avgH} />

        {/* Period filter */}
        <PeriodFilter active={period} onChange={(p) => { setPeriod(p); setDrillMonth(null); }} />

        {/* Drill-down back button */}
        {isDrillView && (
          <button
            onClick={() => setDrillMonth(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: colors.red,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 12,
              padding: 0,
              }}
            >
            ← {monthlyData.find(m => m.month === drillMonth)?.label}の詳細
          </button>
        )}

        {/* Chart */}
        <div style={{
          background: colors.white,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}>
          {isMonthlyView ? (
            <MonthlyChart monthlyData={monthlyData} avgH={avgH} onClickMonth={setDrillMonth} />
          ) : (
            <FuelChart history={isDrillView ? drillData : filteredHistory} avgH={avgH} />
          )}
            </div>

        {/* History list */}
        <div style={{ marginBottom: 80 }}>
          {isMonthlyView ? (
            // Monthly cards
            monthlyData.slice().reverse().map(m => (
              <MonthlyCard key={m.month} data={m} onClick={() => setDrillMonth(m.month)} />
            ))
          ) : (
            // Daily cards
            (isDrillView ? drillData : filteredHistory)
              .slice()
              .reverse()
              .map((entry, ri) => {
                const dataSource = isDrillView ? drillData : filteredHistory;
                const origIdx = dataSource.length - 1 - ri;
                // Find prevOdo from original history, not filtered
                let prevOdo = initOdo;
                if (origIdx > 0) {
                  prevOdo = dataSource[origIdx - 1].odo;
                } else {
                  // First item in filtered list - find prev from original history
                  const originalIdx = history.findIndex(h => h.id === entry.id);
                  prevOdo = originalIdx > 0 ? history[originalIdx - 1].odo : initOdo;
                }
                return (
                  <HistoryCard
                    key={entry.id}
                    entry={entry}
                    prevOdo={prevOdo}
                    onEdit={() => onEdit(entry)}
                    onDelete={() => handleDelete(entry.id)}
                  />
                );
              })
          )}
            </div>

        {/* Fixed bottom button */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background: 'linear-gradient(transparent, white 30%)',
        }}>
          <div style={{ maxWidth: 375, margin: '0 auto' }}>
            <Btn onClick={onRecord}>＋ 給油を記録する</Btn>
                </div>
      </div>
    </Shell>

      {/* Floating demo button */}
    <button
      onClick={() => setShowScenario(true)}
      style={{
          position: 'fixed',
          bottom: 80,
        right: 24,
        width: 48,
        height: 48,
          borderRadius: '50%',
        background: colors.dark,
        color: colors.white,
          border: 'none',
          cursor: 'pointer',
        fontSize: 20,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        zIndex: 50,
      }}
    >
      📊
    </button>

    {showScenario && (
      <ScenarioModal
        active={activeScenario}
        catalogH={catalogH}
          onSelect={(s) => {
            onChangeScenario(s);
            setShowScenario(false);
          }}
        onClose={() => setShowScenario(false)}
      />
    )}
    </>
  );
}
