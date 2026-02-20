import { useState } from 'react';

const SCREENS = {
  SETUP_1: 'setup_1',
  SETUP_3: 'setup_3',
  DASHBOARD: 'dashboard',
  RECORD_1: 'record_1',
  RECORD_2: 'record_2',
  RECORD_3: 'record_3',
  RECORD_DONE: 'record_done',
};

const c = {
  bg: '#F5F5F5',
  white: '#FFFFFF',
  red: '#E2001A',
  gray: '#9E9E9E',
  dark: '#424242',
  light: '#EEEEEE',
  warn: '#FF9800',
};

const Shell = ({ children, title, onBack }) => (
  <div
    style={{
      width: 375,
      minHeight: 667,
      background: c.bg,
      fontFamily: 'sans-serif',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div
      style={{
        background: c.white,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${c.light}`,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            marginRight: 8,
            color: c.dark,
          }}
        >
          ←
        </button>
      )}
      <span style={{ fontWeight: 700, fontSize: 16, color: c.dark }}>
        {title}
      </span>
    </div>
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
      {children}
    </div>
  </div>
);

const Btn = ({ onClick, children, secondary, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: '100%',
      padding: 14,
      borderRadius: 8,
      border: secondary ? `1px solid ${c.red}` : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? c.light : secondary ? c.white : c.red,
      color: disabled ? c.gray : secondary ? c.red : c.white,
      fontWeight: 700,
      fontSize: 15,
      marginBottom: 8,
    }}
  >
    {children}
  </button>
);

const Field = ({ label, value, onChange, unit, placeholder }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 13, color: c.gray, marginBottom: 6 }}>{label}</div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: c.white,
        borderRadius: 8,
        border: `1px solid ${c.light}`,
        padding: '0 12px',
      }}
    >
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: '12px 0',
          border: 'none',
          outline: 'none',
          fontSize: 16,
          background: 'transparent',
        }}
      />
      {unit && <span style={{ color: c.gray, fontSize: 14 }}>{unit}</span>}
    </div>
  </div>
);

const Dots = ({ total, current }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 28,
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === current ? 20 : 8,
          height: 8,
          borderRadius: 4,
          background: i === current ? c.red : c.light,
        }}
      />
    ))}
  </div>
);

const LineChart = ({ data }) => {
  if (data.length < 2)
    return (
      <div
        style={{
          textAlign: 'center',
          color: c.gray,
          fontSize: 13,
          padding: '20px 0',
        }}
      >
        給油を2回以上記録するとグラフが表示されます
      </div>
    );
  const w = 311,
    h = 100,
    pL = 28,
    pB = 20,
    pT = 10,
    pR = 10;
  const iW = w - pL - pR,
    iH = h - pT - pB;
  const vals = data.map((d) => d.kmpl);
  const minV = Math.min(...vals) - 2,
    maxV = Math.max(...vals) + 2;
  const x = (i) => pL + (i / (data.length - 1)) * iW;
  const y = (v) => pT + iH - ((v - minV) / (maxV - minV)) * iH;
  const pts = data.map((d, i) => `${x(i)},${y(d.kmpl)}`).join(' ');
  const area = `${x(0)},${pT + iH} ${pts} ${x(data.length - 1)},${pT + iH}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
        <g key={i}>
          <line
            x1={pL}
            x2={w - pR}
            y1={y(v)}
            y2={y(v)}
            stroke="#EEE"
            strokeWidth={1}
          />
          <text
            x={pL - 4}
            y={y(v) + 4}
            fontSize={8}
            fill={c.gray}
            textAnchor="end"
          >
            {Math.round(v)}
          </text>
        </g>
      ))}
      <polygon points={area} fill={c.red} fillOpacity={0.08} />
      <polyline
        points={pts}
        fill="none"
        stroke={c.red}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <g key={i}>
          <circle
            cx={x(i)}
            cy={y(d.kmpl)}
            r={4}
            fill={d.flagged ? c.warn : c.red}
            stroke={c.white}
            strokeWidth={1.5}
          />
          {d.flagged && (
            <text
              x={x(i)}
              y={y(d.kmpl) - 8}
              fontSize={8}
              fill={c.warn}
              textAnchor="middle"
            >
              ⚠
            </text>
          )}
          <text
            x={x(i)}
            y={h - 4}
            fontSize={8}
            fill={c.gray}
            textAnchor="middle"
          >
            {d.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  );
};

const Setup1 = ({ onNext }) => {
  const [val, setVal] = useState('');
  return (
    <Shell title="初回セットアップ">
      <Dots total={2} current={0} />
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 8,
          color: c.dark,
        }}
      >
        現在の走行距離を入力
      </div>
      <div style={{ fontSize: 13, color: c.gray, marginBottom: 24 }}>
        メーターに表示されているODO（総走行距離）を入力してください
      </div>
      <Field
        label="ODO（総走行距離）"
        value={val}
        onChange={setVal}
        unit="km"
        placeholder="例：1,234"
      />
      <Btn onClick={() => onNext(Number(val))} disabled={!val}>
        次へ
      </Btn>
    </Shell>
  );
};

const Setup3 = ({ onNext, onBack }) => {
  const [unit, setUnit] = useState('kmpl');
  return (
    <Shell title="初回セットアップ" onBack={onBack}>
      <Dots total={2} current={1} />
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 8,
          color: c.dark,
        }}
      >
        燃費の表示単位を選択
      </div>
      <div style={{ fontSize: 13, color: c.gray, marginBottom: 24 }}>
        好みの表示方法を選んでください
      </div>
      {[
        ['kmpl', 'km/L', '数値が大きいほど燃費が良い'],
        ['l100', 'L/100km', '数値が小さいほど燃費が良い'],
      ].map(([v, label, desc]) => (
        <div
          key={v}
          onClick={() => setUnit(v)}
          style={{
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            cursor: 'pointer',
            background: c.white,
            border: `2px solid ${unit === v ? c.red : c.light}`,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              color: unit === v ? c.red : c.dark,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 12, color: c.gray, marginTop: 4 }}>
            {desc}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        <Btn onClick={() => onNext(unit)}>設定完了</Btn>
      </div>
    </Shell>
  );
};

const Dashboard = ({ history, onRecord }) => {
  const valid = history.filter((h) => !h.flagged);
  const avg = valid.length
    ? (valid.reduce((s, h) => s + h.kmpl, 0) / valid.length).toFixed(1)
    : '--';
  const totalCost = Math.round(history.reduce((s, h) => s + h.fuel * 172, 0));
  return (
    <Shell title="マイバイク 燃費記録">
      <div
        style={{
          background: c.red,
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          color: c.white,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
          平均燃費
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
          {avg}
        </div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>km/L</div>
        {valid.length > 0 && (
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
            同クラス平均より 約15% 優れています 🎉
          </div>
        )}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          ['給油回数', `${history.length} 回`],
          ['累計費用', `¥${totalCost.toLocaleString()}`],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{
              background: c.white,
              borderRadius: 10,
              padding: 16,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: c.gray }}>{label}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: c.dark,
                marginTop: 4,
              }}
            >
              {val}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          background: c.white,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: c.dark,
            marginBottom: 12,
          }}
        >
          燃費推移（km/L）
        </div>
        <LineChart data={history} />
      </div>
      <Btn onClick={onRecord}>＋ 給油を記録する</Btn>
    </Shell>
  );
};

const Record1 = ({ lastOdo, onNext, onBack }) => {
  const [val, setVal] = useState('');
  const diff = val ? Number(val) - lastOdo : null;
  const hasError = diff !== null && diff < 0;
  const hasWarning = diff !== null && diff > 1500;
  return (
    <Shell title="給油記録" onBack={onBack}>
      <Dots total={3} current={0} />
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
          color: c.dark,
        }}
      >
        現在の走行距離を入力
      </div>
      <div style={{ fontSize: 13, color: c.gray, marginBottom: 24 }}>
        メーターに表示されているODOを入力してください
      </div>
      <Field
        label="ODO（総走行距離）"
        value={val}
        onChange={setVal}
        unit="km"
        placeholder={lastOdo ? `前回: ${lastOdo} km` : '例：1,234'}
      />
      {hasError && (
        <div
          style={{
            background: '#FFEBEE',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            fontSize: 13,
            color: '#C62828',
          }}
        >
          ⚠️ 前回の走行距離より小さい値です
        </div>
      )}
      {hasWarning && !hasError && (
        <div
          style={{
            background: '#FFF8E1',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            fontSize: 13,
            color: '#E65100',
          }}
        >
          ⚠️ 前回から {diff.toLocaleString()} km —
          距離が大きいですが正しいですか？
        </div>
      )}
      {diff > 0 && !hasError && !hasWarning && (
        <div
          style={{
            background: '#E8F5E9',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            fontSize: 13,
            color: '#2E7D32',
          }}
        >
          ✓ 今回の走行距離：{diff} km
        </div>
      )}
      <Btn onClick={() => onNext(Number(val))} disabled={!val || hasError}>
        次へ
      </Btn>
    </Shell>
  );
};

const Record2 = ({ onNext, onBack }) => {
  const [mode, setMode] = useState('liters');
  const [liters, setLiters] = useState('');
  const [amount, setAmount] = useState('');
  const unitPrice = 172;
  const calcL = amount ? (Number(amount) / unitPrice).toFixed(2) : '';
  const fuelVal = mode === 'liters' ? Number(liters) : Number(calcL);
  return (
    <Shell title="給油記録" onBack={onBack}>
      <Dots total={3} current={1} />
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
          color: c.dark,
        }}
      >
        給油量を入力
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          ['liters', 'リットルで入力'],
          ['amount', '金額で入力'],
        ].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setMode(v)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13,
              border: `2px solid ${mode === v ? c.red : c.light}`,
              background: mode === v ? '#FFF0F0' : c.white,
              color: mode === v ? c.red : c.gray,
              fontWeight: mode === v ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === 'liters' ? (
        <Field
          label="給油量"
          value={liters}
          onChange={setLiters}
          unit="L"
          placeholder="例：8.5"
        />
      ) : (
        <div>
          <Field
            label="支払金額"
            value={amount}
            onChange={setAmount}
            unit="円"
            placeholder="例：1,460"
          />
          {calcL && (
            <div
              style={{
                background: '#E8F5E9',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                fontSize: 13,
                color: '#2E7D32',
              }}
            >
              換算：約 {calcL} L（¥{unitPrice}/L 基準）
            </div>
          )}
        </div>
      )}
      <Btn onClick={() => onNext(fuelVal)} disabled={!fuelVal}>
        次へ
      </Btn>
    </Shell>
  );
};

const Record3 = ({ odo, fuel, lastOdo, firstKmpl, onNext, onBack }) => {
  const [ans, setAns] = useState(null);
  const dist = odo - lastOdo;
  const kmpl = dist > 0 && fuel > 0 ? dist / fuel : 0;
  const autoFlag =
    firstKmpl && kmpl > 0 && Math.abs(kmpl - firstKmpl) / firstKmpl > 0.3;
  const flagged = ans === 'yes' || autoFlag;
  return (
    <Shell title="給油記録" onBack={onBack}>
      <Dots total={3} current={2} />
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
          color: c.dark,
        }}
      >
        記録の確認
      </div>
      <div
        style={{
          fontSize: 14,
          color: c.dark,
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        前回の給油後、記録し忘れた給油はありましたか？
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[
          ['no', 'いいえ'],
          ['yes', 'はい（記録し忘れあり）'],
        ].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setAns(v)}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              border: `2px solid ${ans === v ? c.red : c.light}`,
              background: ans === v ? '#FFF0F0' : c.white,
              color: ans === v ? c.red : c.gray,
              fontWeight: ans === v ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {ans === 'yes' && (
        <div
          style={{
            background: '#FFF8E1',
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
            fontSize: 13,
            color: '#E65100',
            lineHeight: 1.6,
          }}
        >
          ⚠️
          今回の燃費データは参考値として保存されます。燃費の計算には使用されません。
        </div>
      )}
      {ans === 'no' && !autoFlag && (
        <div
          style={{
            background: '#E8F5E9',
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
            fontSize: 13,
            color: '#2E7D32',
            lineHeight: 1.6,
          }}
        >
          ✓ 通常通り燃費を計算します
        </div>
      )}
      {autoFlag && (
        <div
          style={{
            background: '#FFF8E1',
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
            fontSize: 13,
            color: '#E65100',
            lineHeight: 1.6,
          }}
        >
          ⚠️
          燃費が通常より30%以上乖離しているため、自動的に参考値としてフラグを付与します
        </div>
      )}
      <Btn onClick={() => onNext({ odo, fuel, kmpl, flagged })} disabled={!ans}>
        記録する
      </Btn>
    </Shell>
  );
};

const RecordDone = ({ entry, onDone }) => (
  <Shell title="給油記録">
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: c.dark,
          marginBottom: 8,
        }}
      >
        記録完了！
      </div>
      <div
        style={{
          background: c.white,
          borderRadius: 12,
          padding: 20,
          margin: '24px 0',
          textAlign: 'left',
        }}
      >
        <div style={{ fontSize: 13, color: c.gray, marginBottom: 4 }}>
          今回の燃費
        </div>
        {entry.flagged ? (
          <div style={{ fontSize: 24, fontWeight: 700, color: c.warn }}>
            ⚠️ 参考値
          </div>
        ) : (
          <div style={{ fontSize: 42, fontWeight: 700, color: c.red }}>
            {entry.kmpl.toFixed(1)}{' '}
            <span style={{ fontSize: 16, fontWeight: 400 }}>km/L</span>
          </div>
        )}
        <div style={{ fontSize: 13, color: c.gray, marginTop: 8 }}>
          給油量：{entry.fuel.toFixed(1)} L
        </div>
      </div>
      <Btn onClick={onDone}>ダッシュボードへ戻る</Btn>
    </div>
  </Shell>
);

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SETUP_1);
  const [initOdo, setInitOdo] = useState(null);
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState({ odo: null, fuel: null });

  const lastOdo = history.length ? history[history.length - 1].odo : initOdo;
  const firstKmpl = history.find((h) => !h.flagged)?.kmpl || null;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/');

  const go = (s) => setScreen(s);

  const handleSetup1 = (odo) => {
    setInitOdo(odo);
    go(SCREENS.SETUP_3);
  };
  const handleSetup3 = () => go(SCREENS.DASHBOARD);
  const handleRecord1 = (odo) => {
    setDraft((d) => ({ ...d, odo }));
    go(SCREENS.RECORD_2);
  };
  const handleRecord2 = (fuel) => {
    setDraft((d) => ({ ...d, fuel }));
    go(SCREENS.RECORD_3);
  };
  const handleRecord3 = (entry) => {
    setHistory((h) => [...h, { ...entry, date: today }]);
    go(SCREENS.RECORD_DONE);
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
      {screen === SCREENS.SETUP_1 && <Setup1 onNext={handleSetup1} />}
      {screen === SCREENS.SETUP_3 && (
        <Setup3 onNext={handleSetup3} onBack={() => go(SCREENS.SETUP_1)} />
      )}
      {screen === SCREENS.DASHBOARD && (
        <Dashboard history={history} onRecord={() => go(SCREENS.RECORD_1)} />
      )}
      {screen === SCREENS.RECORD_1 && (
        <Record1
          lastOdo={lastOdo}
          onNext={handleRecord1}
          onBack={() => go(SCREENS.DASHBOARD)}
        />
      )}
      {screen === SCREENS.RECORD_2 && (
        <Record2 onNext={handleRecord2} onBack={() => go(SCREENS.RECORD_1)} />
      )}
      {screen === SCREENS.RECORD_3 && (
        <Record3
          odo={draft.odo}
          fuel={draft.fuel}
          lastOdo={lastOdo}
          firstKmpl={firstKmpl}
          onNext={handleRecord3}
          onBack={() => go(SCREENS.RECORD_2)}
        />
      )}
      {screen === SCREENS.RECORD_DONE && (
        <RecordDone
          entry={history[history.length - 1]}
          onDone={() => go(SCREENS.DASHBOARD)}
        />
      )}
    </div>
  );
}
