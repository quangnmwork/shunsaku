import { useState } from 'react';
import { SCREENS, type Screen, type BikeModel } from './constants';
import type { HistoryEntry, RecordDraft } from './types';
import { nowStr, isAnomalous, makeInitHistory, makeDemoData, type DemoScenario } from './utils';
import { Setup1 } from './screens/Setup1';
import { Setup2 } from './screens/Setup2';
import { Setup3 } from './screens/Setup3';
import { Dashboard } from './screens/Dashboard';
import { Record1 } from './screens/Record1';
import { Record2, type Record2Result, type Record2AnomalyData } from './screens/Record2';
import { RecordMissed } from './screens/RecordMissed';
import { RecordDone } from './screens/RecordDone';

export default function App() {
  const [screen, setScreen] = useState<Screen>(SCREENS.SETUP_1);
  const [initOdo, setInitOdo] = useState<number | null>(null);
  const [bike, setBike] = useState<BikeModel | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [draft, setDraft] = useState<RecordDraft>({});
  const [activeScenario, setActiveScenario] = useState<DemoScenario>('simple');

  const catalogH = bike?.catalog ?? 50;
  const lastEntry = history.length ? history[history.length - 1] : null;
  const lastOdo = lastEntry ? lastEntry.odo : initOdo;

  const go = (s: Screen) => setScreen(s);

  const handleDelete = (id: number) => {
    setHistory((prev) => {
      const idx = prev.findIndex((h) => h.id === id);
      const isLatest = idx === prev.length - 1;
      const next = [...prev];
      next.splice(idx, 1);

      if (!isLatest && next[idx]) {
        const r = next[idx];
        const prevOdo = idx > 0 ? next[idx - 1].odo : initOdo ?? 0;
        const dOdo = r.odo - prevOdo;
        const hCheck = r.fuel > 0 ? dOdo / r.fuel : 0;

        if (isAnomalous(hCheck, catalogH)) {
          const estL = parseFloat((dOdo / catalogH).toFixed(2));
          next[idx] = { ...r, fuel: estL, kmpl: catalogH, isEstimated: true, flagged: false };
        } else {
          next[idx] = { ...r, kmpl: parseFloat((dOdo / r.fuel).toFixed(1)), isEstimated: false, flagged: false };
        }
      }
      return next;
    });
  };

  const handleRecord2Done = (data: Record2Result) => {
    const entry: HistoryEntry = { ...data, id: Date.now(), date: nowStr(), odo: draft.odo! };
    setHistory((h) => [...h, entry]);
    go(SCREENS.RECORD_DONE);
  };

  const handleNeedMissedCheck = (data: Record2AnomalyData) => {
    setDraft((d) => ({ ...d, ...data }));
    go(SCREENS.RECORD_MISSED);
  };

  const handleMissedDone = (wasMissed: boolean, estL: number | null, estKmpl: number | null) => {
    const entry: HistoryEntry = {
      id: Date.now(),
      date: nowStr(),
      odo: draft.odo!,
      unitPrice: draft.unitPrice ?? 172,
      amount: draft.amount ?? 0,
      flagged: false,
      isEstimated: wasMissed,
      fuel: wasMissed && estL != null ? estL : draft.fuel ?? 0,
      kmpl: wasMissed && estKmpl != null ? estKmpl : draft.kmpl ?? null,
    };
    setHistory((h) => [...h, entry]);
    go(SCREENS.RECORD_DONE);
  };

  const handleSetupDone = (bikeData: BikeModel) => {
    setBike(bikeData);
    const { initOdo: demoOdo, history: demoHistory } = makeDemoData(activeScenario, bikeData.catalog);
    setInitOdo(demoOdo);
    setHistory(demoHistory);
    go(SCREENS.DASHBOARD);
  };

  const handleChangeScenario = (scenario: DemoScenario) => {
    setActiveScenario(scenario);
    const { initOdo: demoOdo, history: demoHistory } = makeDemoData(scenario, catalogH);
    setInitOdo(demoOdo);
    setHistory(demoHistory);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        background: '#E0E0E0',
        padding: '20px 0',
      }}
    >
      {screen === SCREENS.SETUP_1 && (
        <Setup1 onNext={(odo) => { setInitOdo(odo); go(SCREENS.SETUP_2); }} />
      )}
      {screen === SCREENS.SETUP_2 && (
        <Setup2 onNext={(b) => { setBike(b); go(SCREENS.SETUP_3); }} onBack={() => go(SCREENS.SETUP_1)} />
      )}
      {screen === SCREENS.SETUP_3 && (
        <Setup3 onNext={() => handleSetupDone(bike!)} onBack={() => go(SCREENS.SETUP_2)} />
      )}
      {screen === SCREENS.DASHBOARD && (
        <Dashboard
          history={history}
          initOdo={initOdo || 1000}
          catalogH={catalogH}
          bikeName={bike?.name || 'マイバイク'}
          activeScenario={activeScenario}
          onRecord={() => { setDraft({}); go(SCREENS.RECORD_1); }}
          onDelete={handleDelete}
          onChangeScenario={handleChangeScenario}
        />
      )}
      {screen === SCREENS.RECORD_1 && (
        <Record1
          lastOdo={lastOdo}
          onNext={(odo) => { setDraft((d) => ({ ...d, odo })); go(SCREENS.RECORD_2); }}
          onBack={() => go(SCREENS.DASHBOARD)}
        />
      )}
      {screen === SCREENS.RECORD_2 && (
        <Record2
          odo={draft.odo!}
          lastOdo={lastOdo}
          catalogH={catalogH}
          onNext={handleRecord2Done}
          onNeedMissedCheck={handleNeedMissedCheck}
          onBack={() => go(SCREENS.RECORD_1)}
        />
      )}
      {screen === SCREENS.RECORD_MISSED && (
        <RecordMissed
          kmpl={draft.kmpl!}
          catalogH={catalogH}
          deltaOdo={draft.odo! - (lastOdo ?? 0)}
          onNext={handleMissedDone}
          onBack={() => go(SCREENS.RECORD_2)}
        />
      )}
      {screen === SCREENS.RECORD_DONE && (
        <RecordDone entry={history[history.length - 1]} onDone={() => go(SCREENS.DASHBOARD)} />
      )}
    </div>
  );
}
