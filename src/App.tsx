import { useState } from 'react';
import type { HistoryEntry } from './types';
import { makeDemoData, calculateFuelEfficiency, parseDate, type DemoScenario } from './utils';
import { Dashboard } from './screens/Dashboard';
import { RecordScreen, type RecordResult } from './screens/RecordScreen';

type Screen = 
  | { type: 'dashboard' }
  | { type: 'record'; editEntry?: HistoryEntry }; // editEntry for edit mode

// 固定値
const CATALOG_H = 45;
const BIKE_NAME = 'マイバイク';

export default function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'dashboard' });
  const [activeScenario, setActiveScenario] = useState<DemoScenario>('long_term');
  
  // Demo data
  const initialData = makeDemoData(activeScenario);
  const [initOdo, setInitOdo] = useState(initialData.initOdo);
  const [history, setHistory] = useState<HistoryEntry[]>(initialData.history);

  // Sort history by date and recalculate
  const sortAndCalculate = (entries: HistoryEntry[]) => {
    const sorted = [...entries].sort((a, b) => 
      parseDate(a.date).getTime() - parseDate(b.date).getTime()
    );
    return calculateFuelEfficiency(sorted, initOdo);
  };

  // Delete any record
  const handleDelete = (id: number) => {
    setHistory((prev) => {
      const filtered = prev.filter(h => h.id !== id);
      return sortAndCalculate(filtered);
    });
  };

  // Edit record
  const handleEdit = (entry: HistoryEntry) => {
    setScreen({ type: 'record', editEntry: entry });
  };

  // Save record (new or edit)
  const handleSaveRecord = (data: RecordResult, editId?: number) => {
    if (editId) {
      // Edit existing record
      setHistory((prev) => {
        const updated = prev.map(h => 
          h.id === editId 
            ? { ...h, date: data.date, odo: data.odo, fuel: data.fuel, isFullTank: data.isFullTank, skipCalculation: data.skipCalculation }
            : h
        );
        return sortAndCalculate(updated);
      });
    } else {
      // Add new record
      const newEntry: HistoryEntry = {
        id: Date.now(),
        date: data.date,
        odo: data.odo,
        fuel: data.fuel,
        amount: 0,
        unitPrice: 0,
        kmpl: null,
        flagged: false,
        isEstimated: false,
        isFullTank: data.isFullTank,
        skipCalculation: data.skipCalculation,
      };

      setHistory((prev) => {
        const updated = [...prev, newEntry];
        return sortAndCalculate(updated);
      });
    }

    // Go back to dashboard
    setScreen({ type: 'dashboard' });
  };

  const handleChangeScenario = (scenario: DemoScenario) => {
    setActiveScenario(scenario);
    const data = makeDemoData(scenario);
    setInitOdo(data.initOdo);
    setHistory(data.history);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        background: '#E5E5E5',
        padding: '20px 0',
      }}
    >
      {screen.type === 'dashboard' && (
        <Dashboard
          history={history}
          initOdo={initOdo}
          catalogH={CATALOG_H}
          bikeName={BIKE_NAME}
          activeScenario={activeScenario}
          onRecord={() => setScreen({ type: 'record' })}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onChangeScenario={handleChangeScenario}
        />
      )}
      {screen.type === 'record' && (
        <RecordScreen
          history={history}
          initOdo={initOdo}
          editEntry={screen.editEntry}
          onSave={handleSaveRecord}
          onBack={() => setScreen({ type: 'dashboard' })}
        />
      )}
    </div>
  );
}
