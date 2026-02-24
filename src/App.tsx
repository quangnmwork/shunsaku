import { useState } from "react";

const SCREENS = {
  SETUP_1: "setup_1",
  SETUP_3: "setup_3",
  DASHBOARD: "dashboard",
  RECORD_1: "record_1",
  RECORD_2: "record_2",
  RECORD_MISSED: "record_missed",
  RECORD_DONE: "record_done",
};

const c = {
  bg: "#F5F5F5",
  white: "#FFFFFF",
  red: "#E2001A",
  gray: "#9E9E9E",
  dark: "#424242",
  light: "#EEEEEE",
  warn: "#FF9800",
  green: "#2E7D32",
  greenBg: "#E8F5E9",
  blue: "#1565C0",
  blueBg: "#E3F2FD",
  warnBg: "#FFF8E1",
};

const ANOMALY_THRESHOLD = 0.3;

const makeInitHistory = () => [
  {
    id: 1,
    date: "2025/01/08 09:00",
    odo: 1130,
    fuel: 2.5,
    amount: 430,
    unitPrice: 172,
    kmpl: 52,
    flagged: false,
  },
  {
    id: 2,
    date: "2025/01/25 14:30",
    odo: 1500,
    fuel: 4.5,
    amount: 774,
    unitPrice: 172,
    kmpl: null,
    flagged: true,
  },
  {
    id: 3,
    date: "2025/02/10 11:00",
    odo: 1600,
    fuel: 1.8,
    amount: 310,
    unitPrice: 172,
    kmpl: parseFloat((100 / 1.8).toFixed(1)),
    flagged: false,
  },
  {
    id: 4,
    date: "2025/02/15 16:00",
    odo: 1800,
    fuel: 3.8,
    amount: 654,
    unitPrice: 172,
    kmpl: parseFloat((200 / 3.8).toFixed(1)),
    flagged: false,
  },
  {
    id: 5,
    date: "2025/02/28 10:00",
    odo: 1920,
    fuel: 2.3,
    amount: 396,
    unitPrice: 172,
    kmpl: parseFloat((120 / 2.3).toFixed(1)),
    flagged: false,
  },
  {
    id: 6,
    date: "2025/03/04 09:00",
    odo: 2100,
    fuel: 3.5,
    amount: 602,
    unitPrice: 172,
    kmpl: parseFloat((180 / 3.5).toFixed(1)),
    flagged: false,
  },
  {
    id: 7,
    date: "2025/03/12 15:00",
    odo: 2400,
    fuel: 4.1,
    amount: 705,
    unitPrice: 172,
    kmpl: null,
    flagged: true,
  },
];

const nowStr = () => {
  const d = new Date(),
    p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const groupByMonth = (data) => {
  const map = {};
  data.forEach((d) => {
    const k = d.date.slice(0, 7);
    if (!map[k]) map[k] = [];
    map[k].push(d);
  });
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
};

const calcAvg = (history) => {
  const valid = history.filter((h) => h.kmpl !== null && !h.flagged);
  if (!valid.length) return null;
  return parseFloat(
    (valid.reduce((s, h) => s + h.kmpl, 0) / valid.length).toFixed(1),
  );
};

const isAnomalous = (kmpl, avg) => {
  if (!avg) return false;
  return Math.abs(kmpl - avg) / avg > ANOMALY_THRESHOLD;
};

// ---- UI Parts ----
const Shell = ({ children, title, onBack }) => (
  <div
    style={{
      width: 375,
      minHeight: 667,
      background: c.bg,
      fontFamily: "sans-serif",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <div
      style={{
        background: c.white,
        padding: "16px",
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${c.light}`,
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
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
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px" }}>
      {children}
    </div>
  </div>
);

const Btn = ({ onClick, children, secondary, danger, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: "100%",
      padding: 14,
      borderRadius: 8,
      marginBottom: 8,
      border: secondary
        ? `1px solid ${c.red}`
        : danger
          ? `1px solid #C62828`
          : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      background: disabled
        ? c.light
        : danger
          ? "#FFEBEE"
          : secondary
            ? c.white
            : c.red,
      color: disabled
        ? c.gray
        : danger
          ? "#C62828"
          : secondary
            ? c.red
            : c.white,
      fontWeight: 700,
      fontSize: 15,
    }}
  >
    {children}
  </button>
);

const Field = ({
  label,
  value,
  onChange,
  unit,
  placeholder,
  hint,
  readonly,
}) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 13, color: c.gray, marginBottom: 6 }}>{label}</div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: readonly ? c.light : c.white,
        borderRadius: 8,
        border: `1px solid ${c.light}`,
        padding: "0 12px",
      }}
    >
      <input
        type="number"
        value={value}
        onChange={(e) => !readonly && onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readonly}
        style={{
          flex: 1,
          padding: "12px 0",
          border: "none",
          outline: "none",
          fontSize: 16,
          background: "transparent",
          color: readonly ? c.gray : c.dark,
        }}
      />
      {unit && <span style={{ color: c.gray, fontSize: 14 }}>{unit}</span>}
    </div>
    {hint && (
      <div style={{ fontSize: 11, color: c.gray, marginTop: 4 }}>{hint}</div>
    )}
  </div>
);

const Dots = ({ total, current }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
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

const TabBar = ({ tabs, active, onChange }) => (
  <div
    style={{
      display: "flex",
      background: c.light,
      borderRadius: 8,
      padding: 3,
      marginBottom: 16,
    }}
  >
    {tabs.map((t) => (
      <button
        key={t}
        onClick={() => onChange(t)}
        style={{
          flex: 1,
          padding: "8px 0",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: active === t ? 700 : 400,
          background: active === t ? c.white : "transparent",
          color: active === t ? c.red : c.gray,
          boxShadow: active === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        }}
      >
        {t}
      </button>
    ))}
  </div>
);

const LineChart = ({ data, valueKey, color = c.red }) => {
  const valid = data.filter((d) => d[valueKey] != null);
  if (valid.length < 1)
    return (
      <div
        style={{
          textAlign: "center",
          color: c.gray,
          fontSize: 13,
          padding: "20px 0",
        }}
      >
        2回以上記録するとグラフが表示されます
      </div>
    );
  const w = 311,
    h = 130,
    pL = 32,
    pB = 22,
    pT = 14,
    pR = 10;
  const iW = w - pL - pR,
    iH = h - pT - pB;
  const allVals = data.map((d) => d[valueKey]).filter(Boolean);
  const minV = Math.min(...allVals) * 0.88,
    maxV = Math.max(...allVals) * 1.08;
  const xS = (i) => pL + (i / (data.length - 1 || 1)) * iW;
  const yS = (v) => pT + iH - ((v - minV) / (maxV - minV)) * iH;

  const iVals = data.map((d, i) => {
    if (d[valueKey] != null) return d[valueKey];
    let pi = i - 1;
    while (pi >= 0 && data[pi][valueKey] == null) pi--;
    let ni = i + 1;
    while (ni < data.length && data[ni][valueKey] == null) ni++;
    if (pi < 0 || ni >= data.length) return null;
    return (
      data[pi][valueKey] +
      (data[ni][valueKey] - data[pi][valueKey]) * ((i - pi) / (ni - pi))
    );
  });

  const missingRanges = [];
  let inGap = false,
    gapStart = -1;
  data.forEach((d, i) => {
    if (d[valueKey] == null && !inGap) {
      inGap = true;
      gapStart = i - 1;
    }
    if (d[valueKey] != null && inGap) {
      inGap = false;
      missingRanges.push([gapStart, i]);
    }
  });
  // handle gap at end
  if (inGap) missingRanges.push([gapStart, data.length - 1]);

  const segments = [];
  let cur = [];
  data.forEach((d, i) => {
    if (d[valueKey] != null) cur.push(i);
    else {
      if (cur.length >= 1) segments.push([...cur]);
      cur = [];
    }
  });
  if (cur.length >= 1) segments.push(cur);

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
        <g key={i}>
          <line
            x1={pL}
            x2={w - pR}
            y1={yS(v)}
            y2={yS(v)}
            stroke="#EEE"
            strokeWidth={1}
          />
          <text
            x={pL - 4}
            y={yS(v) + 4}
            fontSize={8}
            fill={c.gray}
            textAnchor="end"
          >
            {Math.round(v)}
          </text>
        </g>
      ))}

      {/* Gray dashed for missing segments */}
      {missingRanges.map(([from, to], ri) => {
        const pts = [];
        for (let i = from; i <= to; i++) {
          if (iVals[i] != null) pts.push(`${xS(i)},${yS(iVals[i])}`);
        }
        if (pts.length < 2) return null;
        const area = `${xS(from)},${pT + iH} ${pts.join(" ")} ${xS(to)},${pT + iH}`;
        return (
          <g key={ri}>
            <polygon points={area} fill="#BDBDBD" fillOpacity={0.2} />
            <polyline
              points={pts.join(" ")}
              fill="none"
              stroke="#BDBDBD"
              strokeWidth={1.5}
              strokeDasharray="4,3"
            />
          </g>
        );
      })}

      {/* Solid segments — fill only if no gap after */}
      {segments.map((idxs, si) => {
        if (idxs.length < 2) return null;
        const lastIdx = idxs[idxs.length - 1];
        const hasGapAfter =
          lastIdx < data.length - 1 && data[lastIdx + 1][valueKey] == null;
        const pts = idxs
          .map((i) => `${xS(i)},${yS(data[i][valueKey])}`)
          .join(" ");
        if (hasGapAfter)
          return (
            <g key={si}>
              <polyline
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </g>
          );
        const area = `${xS(idxs[0])},${pT + iH} ${pts} ${xS(lastIdx)},${pT + iH}`;
        return (
          <g key={si}>
            <polygon points={area} fill={color} fillOpacity={0.1} />
            <polyline
              points={pts}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* Dots + labels */}
      {data.map((d, i) => {
        if (d[valueKey] == null)
          return (
            <g key={i}>
              <text
                x={xS(i)}
                y={h - 13}
                fontSize={8}
                fill={c.warn}
                textAnchor="middle"
              >
                ⚠
              </text>
              <text
                x={xS(i)}
                y={h - 4}
                fontSize={7}
                fill={c.warn}
                textAnchor="middle"
              >
                {d.date.slice(5, 10)}
              </text>
            </g>
          );
        return (
          <g key={i}>
            <circle
              cx={xS(i)}
              cy={yS(d[valueKey])}
              r={4}
              fill={color}
              stroke={c.white}
              strokeWidth={1.5}
            />
            <text
              x={xS(i)}
              y={yS(d[valueKey]) - 8}
              fontSize={8}
              fill={c.dark}
              textAnchor="middle"
              fontWeight="600"
            >
              {d[valueKey].toFixed(1)}
            </text>
            <text
              x={xS(i)}
              y={h - 4}
              fontSize={7}
              fill={c.gray}
              textAnchor="middle"
            >
              {d.date.slice(5, 10)}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const MonthBarChart = ({ months, valueKey, color = c.red }) => {
  if (!months.length) return null;
  const vals = months.map(([, recs]) =>
    recs
      .filter((r) => !r.flagged || valueKey === "amount")
      .reduce((s, r) => s + (r[valueKey] || 0), 0),
  );
  const maxV = Math.max(...vals) || 1;
  const w = 311,
    h = 80,
    pL = 36,
    pB = 20,
    pT = 10,
    pR = 10;
  const iW = w - pL - pR,
    iH = h - pT - pB;
  const barW = Math.min(32, iW / months.length - 8);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {[0, maxV / 2, maxV].map((v, i) => (
        <g key={i}>
          <line
            x1={pL}
            x2={w - pR}
            y1={pT + iH - (v / maxV) * iH}
            y2={pT + iH - (v / maxV) * iH}
            stroke="#EEE"
            strokeWidth={1}
          />
          <text
            x={pL - 4}
            y={pT + iH - (v / maxV) * iH + 4}
            fontSize={8}
            fill={c.gray}
            textAnchor="end"
          >
            {Math.round(v)}
          </text>
        </g>
      ))}
      {months.map(([key, recs], i) => {
        const val = vals[i];
        const bx =
          pL +
          (i / Math.max(months.length - 0.5, 1)) * iW +
          (iW / months.length - barW) / 2;
        const bh = (val / maxV) * iH;
        return (
          <g key={key}>
            <rect
              x={bx}
              y={pT + iH - bh}
              width={barW}
              height={bh}
              rx={3}
              fill={color}
              fillOpacity={0.85}
            />
            <text
              x={bx + barW / 2}
              y={h - 4}
              fontSize={8}
              fill={c.gray}
              textAnchor="middle"
            >
              {key.slice(5)}月
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ---- Screens ----
const Setup1 = ({ onNext }) => {
  const [val, setVal] = useState("");
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
  const [unit, setUnit] = useState("kmpl");
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
      {[
        ["kmpl", "km/L", "数値が大きいほど燃費が良い"],
        ["l100", "L/100km", "数値が小さいほど燃費が良い"],
      ].map(([v, label, desc]) => (
        <div
          key={v}
          onClick={() => setUnit(v)}
          style={{
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
            cursor: "pointer",
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
      <Btn onClick={() => onNext(unit)}>設定完了</Btn>
    </Shell>
  );
};

const Dashboard = ({ history, onRecord, onDelete }) => {
  const [tab, setTab] = useState("燃費");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const avg = calcAvg(history);
  const totalCost = history.reduce((s, h) => s + (h.amount || 0), 0);
  const months = groupByMonth(history);
  const flaggedCount = history.filter((h) => h.flagged).length;

  return (
    <Shell title="マイバイク 燃費記録">
      {confirmDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: c.white,
              borderRadius: 12,
              padding: 24,
              margin: 20,
              maxWidth: 320,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#C62828",
                marginBottom: 12,
              }}
            >
              ⚠️ 記録を削除しますか？
            </div>
            <div
              style={{
                fontSize: 14,
                color: c.dark,
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              この記録を削除すると燃費の計算に影響が出ます。
              {!confirmDelete.isLatest && (
                <span
                  style={{
                    color: "#C62828",
                    display: "block",
                    marginTop: 8,
                    fontWeight: 700,
                  }}
                >
                  隣接する記録の燃費を自動で再チェックします。
                </span>
              )}
            </div>
            <Btn
              danger
              onClick={() => {
                onDelete(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              削除する
            </Btn>
            <Btn secondary onClick={() => setConfirmDelete(null)}>
              キャンセル
            </Btn>
          </div>
        </div>
      )}

      <div
        style={{
          background: c.red,
          borderRadius: 12,
          padding: 20,
          marginBottom: 12,
          color: c.white,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
          平均燃費
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
          {avg ?? "--"}
        </div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>km/L</div>
      </div>

      {flaggedCount > 0 && (
        <div
          style={{
            background: c.warnBg,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 12,
            fontSize: 13,
            color: "#E65100",
            borderLeft: `3px solid ${c.warn}`,
          }}
        >
          ⚠️ {flaggedCount}
          件の記録忘れがあります。継続して記録するとグラフが正確になります。
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          ["給油回数", `${history.length} 回`],
          ["累計費用", `¥${Math.round(totalCost).toLocaleString()}`],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{
              background: c.white,
              borderRadius: 10,
              padding: 16,
              textAlign: "center",
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
        <TabBar tabs={["燃費", "費用"]} active={tab} onChange={setTab} />
        {tab === "燃費" && (
          <>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: c.dark,
                marginBottom: 4,
              }}
            >
              燃費推移（km/L）
            </div>
            <LineChart data={history} valueKey="kmpl" color={c.red} />
            {months.length > 1 && (
              <>
                <div
                  style={{ fontSize: 11, color: c.gray, margin: "12px 0 4px" }}
                >
                  月別平均
                </div>
                <MonthBarChart
                  months={months}
                  valueKey={"kmpl"}
                  color={c.red}
                  isAvg={true}
                />
              </>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              {[
                ["実測値", c.red],
                ["ODOのみ（燃費なし）", c.warn],
              ].map(([label, col]) => (
                <div
                  key={label}
                  style={{ display: "flex", alignItems: "center", gap: 4 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: col,
                    }}
                  />
                  <span style={{ fontSize: 10, color: c.gray }}>{label}</span>
                </div>
              ))}
            </div>

            {/* 1区間あたりの燃費 list */}
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: c.dark,
                  marginBottom: 12,
                }}
              >
                1区間あたりの燃費
              </div>
              {[...history].reverse().map((r, i) => {
                const prevOdo = (() => {
                  const idx = history.findIndex((h) => h.id === r.id);
                  return idx > 0 ? history[idx - 1].odo : null;
                })();
                const dOdo = prevOdo != null ? r.odo - prevOdo : null;
                return (
                  <div
                    key={r.id}
                    style={{
                      padding: "12px 0",
                      borderBottom: `1px solid ${c.light}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            color: c.dark,
                            fontWeight: 600,
                          }}
                        >
                          {r.date.slice(5, 10).replace("/", "月") + "日"}
                          {r.flagged && (
                            <span
                              style={{
                                fontSize: 11,
                                color: c.warn,
                                marginLeft: 6,
                              }}
                            >
                              ⚠️ ODOのみ
                            </span>
                          )}
                        </div>
                        {dOdo != null && (
                          <div
                            style={{
                              fontSize: 11,
                              color: c.gray,
                              marginTop: 2,
                            }}
                          >
                            ΔODO {dOdo} km ÷ {r.fuel?.toFixed(2)} L
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {r.flagged ? (
                          <span style={{ fontSize: 13, color: c.warn }}>
                            --
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: c.red,
                            }}
                          >
                            {r.kmpl?.toFixed(1)}{" "}
                            <span style={{ fontSize: 11, fontWeight: 400 }}>
                              km/L
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {tab === "費用" && (
          <>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: c.dark,
                marginBottom: 4,
              }}
            >
              支払金額の推移（円）
            </div>
            <LineChart data={history} valueKey="amount" color={c.blue} />
            {months.length > 1 && (
              <>
                <div
                  style={{ fontSize: 11, color: c.gray, margin: "12px 0 4px" }}
                >
                  月別合計
                </div>
                <MonthBarChart
                  months={months}
                  valueKey="amount"
                  color={c.blue}
                />
              </>
            )}
            <div style={{ marginTop: 16 }}>
              {months
                .slice()
                .reverse()
                .map(([key, recs]) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: c.gray,
                        marginBottom: 6,
                      }}
                    >
                      {key.slice(0, 4)}年{key.slice(5)}月
                    </div>
                    {recs.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: `1px solid ${c.light}`,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, color: c.dark }}>
                            {r.date.slice(5, 10).replace("/", "月") + "日"}{" "}
                            {r.date.slice(11)}
                          </div>
                          <div style={{ fontSize: 11, color: c.gray }}>
                            {r.fuel?.toFixed(1)} L{" "}
                            {r.flagged ? "⚠️ ODOのみ" : ""}
                          </div>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: c.dark,
                              }}
                            >
                              ¥{Math.round(r.amount || 0).toLocaleString()}
                            </div>
                            {r.kmpl && !r.flagged && (
                              <div style={{ fontSize: 11, color: c.gray }}>
                                {r.kmpl.toFixed(1)} km/L
                              </div>
                            )}
                            {r.flagged && (
                              <div style={{ fontSize: 11, color: c.warn }}>
                                ODOのみ
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                id: r.id,
                                isLatest:
                                  history[history.length - 1].id === r.id,
                              })
                            }
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: c.gray,
                              fontSize: 16,
                              padding: 4,
                            }}
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        padding: "6px 0",
                      }}
                    >
                      <div
                        style={{ fontSize: 13, fontWeight: 700, color: c.red }}
                      >
                        月計 ¥
                        {Math.round(
                          recs.reduce((s, r) => s + (r.amount || 0), 0),
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
      <Btn onClick={onRecord}>＋ 給油を記録する</Btn>
    </Shell>
  );
};

const Record1 = ({ lastOdo, onNext, onBack }) => {
  const [val, setVal] = useState("");
  const diff = val ? Number(val) - lastOdo : null;
  const hasError = diff !== null && diff < 0;
  const hasWarning = diff !== null && diff > 1500;
  return (
    <Shell title="給油記録" onBack={onBack}>
      <Dots total={2} current={0} />
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
      {lastOdo && (
        <div
          style={{
            background: c.blueBg,
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, color: c.blue }}>前回のODO</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: c.blue }}>
            {lastOdo.toLocaleString()} km
          </span>
        </div>
      )}
      <Field
        label="現在のODO（総走行距離）"
        value={val}
        onChange={setVal}
        unit="km"
        placeholder={`前回: ${lastOdo} km`}
      />
      {hasError && (
        <div
          style={{
            background: "#FFEBEE",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            fontSize: 13,
            color: "#C62828",
          }}
        >
          ⚠️ 前回の走行距離より小さい値です
        </div>
      )}
      {hasWarning && !hasError && (
        <div
          style={{
            background: c.warnBg,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            fontSize: 13,
            color: "#E65100",
          }}
        >
          ⚠️ 前回から {diff.toLocaleString()} km —
          距離が大きいですが正しいですか？
        </div>
      )}
      {diff > 0 && !hasError && !hasWarning && (
        <div
          style={{
            background: c.greenBg,
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            fontSize: 13,
            color: c.green,
          }}
        >
          ✓ 今回の走行距離：{diff.toLocaleString()} km
        </div>
      )}
      <Btn onClick={() => onNext(Number(val))} disabled={!val || hasError}>
        次へ
      </Btn>
    </Shell>
  );
};

const Record2 = ({
  odo,
  lastOdo,
  currentAvg,
  onNext,
  onBack,
  onNeedMissedCheck,
}) => {
  const [mode, setMode] = useState("liters");
  const [liters, setLiters] = useState("");
  const [amount, setAmount] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const autoUP = unitPrice || 172;
  const calcL = amount ? (Number(amount) / autoUP).toFixed(2) : "";
  const fuelVal = mode === "liters" ? Number(liters) : Number(calcL);
  const amountVal =
    mode === "liters" ? Math.round(Number(liters) * autoUP) : Number(amount);

  const handleNext = () => {
    const dist = odo - lastOdo;
    const kmpl = fuelVal > 0 ? parseFloat((dist / fuelVal).toFixed(1)) : null;
    if (kmpl && isAnomalous(kmpl, currentAvg)) {
      onNeedMissedCheck({
        fuel: fuelVal,
        amount: amountVal,
        unitPrice: Number(unitPrice) || 172,
        kmpl,
      });
    } else {
      onNext({
        fuel: fuelVal,
        amount: amountVal,
        unitPrice: Number(unitPrice) || 172,
        kmpl,
        flagged: false,
      });
    }
  };

  return (
    <Shell title="給油記録" onBack={onBack}>
      <Dots total={2} current={1} />
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 16,
          color: c.dark,
        }}
      >
        給油量を入力
      </div>
      <div
        style={{
          background: c.light,
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 13, color: c.gray }}>記録日時</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: c.dark }}>
          {nowStr()}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          ["liters", "リットルで入力"],
          ["amount", "金額で入力"],
        ].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setMode(v)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              border: `2px solid ${mode === v ? c.red : c.light}`,
              background: mode === v ? "#FFF0F0" : c.white,
              color: mode === v ? c.red : c.gray,
              fontWeight: mode === v ? 700 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "liters" ? (
        <>
          <Field
            label="給油量 *"
            value={liters}
            onChange={setLiters}
            unit="L"
            placeholder="例：8.5"
          />
          <Field
            label="1Lあたりの金額（任意）"
            value={unitPrice}
            onChange={setUnitPrice}
            unit="円/L"
            placeholder="例：172"
            hint="入力すると支払金額を自動計算します"
          />
          {liters && (
            <div
              style={{
                background: c.greenBg,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                fontSize: 13,
                color: c.green,
              }}
            >
              支払金額目安：¥
              {Math.round(Number(liters) * autoUP).toLocaleString()}
            </div>
          )}
        </>
      ) : (
        <>
          <Field
            label="支払総額（任意）"
            value={amount}
            onChange={setAmount}
            unit="円"
            placeholder="例：1,460"
          />
          <Field
            label="1Lあたりの金額（任意）"
            value={unitPrice}
            onChange={setUnitPrice}
            unit="円/L"
            placeholder="例：172"
            hint="入力するとリットル数を自動計算します"
          />
          {amount && unitPrice && (
            <div
              style={{
                background: c.greenBg,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                fontSize: 13,
                color: c.green,
              }}
            >
              換算：約 {(Number(amount) / Number(unitPrice)).toFixed(2)} L
            </div>
          )}
        </>
      )}
      <Btn onClick={handleNext} disabled={!fuelVal}>
        記録する
      </Btn>
    </Shell>
  );
};

const RecordMissed = ({ kmpl, onNext, onBack }) => {
  const [ans, setAns] = useState(null);
  return (
    <Shell title="給油記録の確認" onBack={onBack}>
      <div
        style={{
          background: c.warnBg,
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
          borderLeft: `3px solid ${c.warn}`,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#E65100",
            marginBottom: 6,
          }}
        >
          ⚠️ 燃費が大きく変化しています
        </div>
        <div style={{ fontSize: 13, color: c.dark, lineHeight: 1.6 }}>
          今回の燃費 <strong>{kmpl} km/L</strong>{" "}
          は平均と大きく異なります。前回の給油後、記録し忘れた給油はありましたか？
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          ["no", "いいえ、記録は正確です"],
          ["yes", "はい、記録忘れがありました"],
        ].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setAns(v)}
            style={{
              flex: 1,
              padding: "14px 8px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              border: `2px solid ${ans === v ? c.red : c.light}`,
              background: ans === v ? "#FFF0F0" : c.white,
              color: ans === v ? c.red : c.gray,
              fontWeight: ans === v ? 700 : 400,
              lineHeight: 1.4,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {ans === "yes" && (
        <div
          style={{
            background: c.warnBg,
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
            fontSize: 13,
            color: "#E65100",
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            ⚠️ ODOのみ記録します
          </div>
          今回のODOを新しい基準値として保存します。次回の給油から燃費の計算を再開します。
        </div>
      )}
      {ans === "no" && (
        <div
          style={{
            background: c.greenBg,
            borderRadius: 8,
            padding: 14,
            marginBottom: 16,
            fontSize: 13,
            color: c.green,
            lineHeight: 1.6,
          }}
        >
          ✓ 通常通り燃費を記録します。
        </div>
      )}
      <Btn onClick={() => onNext(ans === "yes")} disabled={!ans}>
        確定する
      </Btn>
    </Shell>
  );
};

const RecordDone = ({ entry, onDone }) => (
  <Shell title="給油記録">
    <div style={{ textAlign: "center", padding: "40px 0" }}>
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
          margin: "24px 0",
          textAlign: "left",
        }}
      >
        <div style={{ fontSize: 13, color: c.gray, marginBottom: 4 }}>
          今回の燃費
        </div>
        {entry.flagged ? (
          <div style={{ fontSize: 20, fontWeight: 700, color: c.warn }}>
            ⚠️ ODOのみ記録（燃費なし）
            <br />
            <span style={{ fontSize: 13, fontWeight: 400, color: c.gray }}>
              次回から燃費計算を再開します
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 42, fontWeight: 700, color: c.red }}>
            {entry.kmpl?.toFixed(1)}{" "}
            <span style={{ fontSize: 16, fontWeight: 400 }}>km/L</span>
          </div>
        )}
        <div style={{ fontSize: 13, color: c.gray, marginTop: 8 }}>
          {entry.fuel?.toFixed(1)} L　
          {entry.amount ? `¥${Math.round(entry.amount).toLocaleString()}` : ""}
        </div>
        <div style={{ fontSize: 12, color: c.gray, marginTop: 4 }}>
          {entry.date}
        </div>
      </div>
      <Btn onClick={onDone}>ダッシュボードへ戻る</Btn>
    </div>
  </Shell>
);

// ---- App ----
export default function App() {
  const [screen, setScreen] = useState(SCREENS.SETUP_1);
  const [initOdo, setInitOdo] = useState(null);
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState({});

  const lastEntry = history.length ? history[history.length - 1] : null;
  const lastOdo = lastEntry ? lastEntry.odo : initOdo;
  const currentAvg = calcAvg(history);
  const go = (s) => setScreen(s);

  const handleDelete = (id) => {
    setHistory((prev) => {
      const idx = prev.findIndex((h) => h.id === id);
      const isLatest = idx === prev.length - 1;
      const next = [...prev];
      next.splice(idx, 1);
      if (!isLatest && next[idx]) {
        const r = next[idx];
        const prevOdo = idx > 0 ? next[idx - 1].odo : initOdo;
        const dOdo = r.odo - prevOdo;
        const hCheck = r.fuel > 0 ? dOdo / r.fuel : 0;
        const newAvg = calcAvg(next);
        if (isAnomalous(hCheck, newAvg)) {
          next[idx] = { ...r, flagged: true, kmpl: null };
        } else {
          next[idx] = {
            ...r,
            flagged: false,
            kmpl: parseFloat((dOdo / r.fuel).toFixed(1)),
          };
        }
      }
      return next;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        background: "#E0E0E0",
        padding: "20px 0",
      }}
    >
      {screen === SCREENS.SETUP_1 && (
        <Setup1
          onNext={(odo) => {
            setInitOdo(odo);
            go(SCREENS.SETUP_3);
          }}
        />
      )}
      {screen === SCREENS.SETUP_3 && (
        <Setup3
          onNext={() => {
            setHistory(makeInitHistory());
            go(SCREENS.DASHBOARD);
          }}
          onBack={() => go(SCREENS.SETUP_1)}
        />
      )}
      {screen === SCREENS.DASHBOARD && (
        <Dashboard
          history={history}
          onRecord={() => {
            setDraft({});
            go(SCREENS.RECORD_1);
          }}
          onDelete={handleDelete}
        />
      )}
      {screen === SCREENS.RECORD_1 && (
        <Record1
          lastOdo={lastOdo}
          onNext={(odo) => {
            setDraft((d) => ({ ...d, odo }));
            go(SCREENS.RECORD_2);
          }}
          onBack={() => go(SCREENS.DASHBOARD)}
        />
      )}
      {screen === SCREENS.RECORD_2 && (
        <Record2
          odo={draft.odo}
          lastOdo={lastOdo}
          currentAvg={currentAvg}
          onNext={(data) => {
            setHistory((h) => [
              ...h,
              { ...data, id: Date.now(), date: nowStr(), odo: draft.odo },
            ]);
            go(SCREENS.RECORD_DONE);
          }}
          onNeedMissedCheck={(data) => {
            setDraft((d) => ({ ...d, ...data }));
            go(SCREENS.RECORD_MISSED);
          }}
          onBack={() => go(SCREENS.RECORD_1)}
        />
      )}
      {screen === SCREENS.RECORD_MISSED && (
        <RecordMissed
          kmpl={draft.kmpl}
          onNext={(wasMissed) => {
            setHistory((h) => [
              ...h,
              {
                ...draft,
                id: Date.now(),
                date: nowStr(),
                odo: draft.odo,
                flagged: wasMissed,
                kmpl: wasMissed ? null : draft.kmpl,
              },
            ]);
            go(SCREENS.RECORD_DONE);
          }}
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
