import { useState } from "react";
import { colors } from "../constants";
import { Shell } from "../components/Shell";
import { Btn } from "../components/Btn";
import { TabBar } from "../components/TabBar";
import { LineChart } from "../components/LineChart";
import { MonthBarChart } from "../components/MonthBarChart";
import { groupByMonth, calcAvgH } from "../utils";
import type { HistoryEntry } from "../types";

interface DashboardProps {
  history: HistoryEntry[];
  initOdo: number;
  catalogH: number;
  bikeName: string;
  onRecord: () => void;
  onDelete: (id: number) => void;
}

function DeleteModal({
  isLatest,
  onConfirm,
  onCancel,
}: {
  isLatest: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
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
          background: colors.white,
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
            color: colors.dark,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          この記録を削除すると燃費の計算に影響が出ます。
          {!isLatest && (
            <span
              style={{
                color: "#C62828",
                display: "block",
                marginTop: 8,
                fontWeight: 700,
              }}
            >
              最新以外の記録を削除すると、隣接する記録の燃費を自動で再チェックします。
            </span>
          )}
        </div>
        <Btn danger onClick={onConfirm}>
          削除する
        </Btn>
        <Btn secondary onClick={onCancel}>
          キャンセル
        </Btn>
      </div>
    </div>
  );
}

function ChartLegend({
  catalogH,
  avgH,
}: {
  catalogH: number;
  avgH: number | null;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
      {[
        { label: "実測値", type: "dot" as const, clr: colors.red },
        { label: "参考値（推定）", type: "dot" as const, clr: colors.blue },
        {
          label: `avg(H)${avgH != null ? ` (${avgH})` : ""}`,
          type: "line" as const,
          clr: colors.green,
        },
        {
          label: `カタログ値 (${catalogH})`,
          type: "line" as const,
          clr: colors.blue,
        },
      ].map(({ label, type, clr }) => (
        <div
          key={label}
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          {type === "line" ? (
            <div
              style={{
                width: 16,
                height: 2,
                background: clr,
                borderTop: `2px dashed ${clr}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: clr,
              }}
            />
          )}
          <span style={{ fontSize: 10, color: colors.gray }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function FuelBreakdown({
  history,
  initOdo,
  onDelete,
}: {
  history: HistoryEntry[];
  initOdo: number;
  onDelete: (id: number) => void;
}) {
  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: colors.dark,
          marginBottom: 8,
        }}
      >
        1区間あたりの燃費
      </div>
      {history
        .slice()
        .reverse()
        .map((r, ri) => {
          const origIdx = history.length - 1 - ri;
          const prevOdo = origIdx > 0 ? history[origIdx - 1].odo : initOdo;
          const deltaOdo = r.odo - prevOdo;
          return (
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: `1px solid ${colors.light}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: colors.dark }}>
                  {r.date.slice(5, 10).replace("/", "月") + "日"}
                  {r.isEstimated && (
                    <span
                      style={{
                        color: colors.blue,
                        fontSize: 11,
                        marginLeft: 4,
                      }}
                    >
                      推定
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: colors.gray, marginTop: 2 }}>
                  ΔODO {deltaOdo} km ÷ {r.fuel.toFixed(2)} L
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: r.isEstimated ? colors.blue : colors.red,
                    }}
                  >
                    {r.kmpl != null ? r.kmpl.toFixed(1) : "--"}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 400,
                        color: colors.gray,
                        marginLeft: 2,
                      }}
                    >
                      km/L
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(r.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: colors.gray,
                    fontSize: 16,
                    padding: 4,
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

function MonthlyBreakdown({
  months,
  onDelete,
}: {
  months: [string, HistoryEntry[]][];
  onDelete: (id: number) => void;
}) {
  return (
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
                color: colors.gray,
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
                  borderBottom: `1px solid ${colors.light}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: colors.dark }}>
                    {r.date.slice(5, 10).replace("/", "月") + "日"}{" "}
                    {r.date.slice(11)}
                  </div>
                  <div style={{ fontSize: 11, color: colors.gray }}>
                    {r.fuel?.toFixed(1)} L {r.isEstimated ? "🔵 参考値" : ""}
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
                        color: colors.dark,
                      }}
                    >
                      ¥{Math.round(r.amount || 0).toLocaleString()}
                    </div>
                    {r.kmpl != null && (
                      <div
                        style={{
                          fontSize: 11,
                          color: r.isEstimated ? colors.blue : colors.gray,
                        }}
                      >
                        {r.kmpl.toFixed(1)} km/L
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(r.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: colors.gray,
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
              <div style={{ fontSize: 13, fontWeight: 700, color: colors.red }}>
                月計 ¥
                {Math.round(
                  recs.reduce((s, r) => s + (r.amount || 0), 0),
                ).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

export function Dashboard({
  history,
  initOdo,
  catalogH,
  bikeName,
  onRecord,
  onDelete,
}: DashboardProps) {
  const [tab, setTab] = useState("燃費");
  const [confirmDelete, setConfirmDelete] = useState<{
    id: number;
    isLatest: boolean;
  } | null>(null);

  const avgH = calcAvgH(history, initOdo);
  const totalCost = history.reduce((s, h) => s + (h.amount || 0), 0);
  const months = groupByMonth(history);

  const catalogStatus =
    avgH != null && catalogH
      ? avgH >= catalogH
        ? {
            msg: "お客様のバイクは非常に効率よく走れています！🎉",
            color: colors.green,
            bg: colors.greenBg,
          }
        : {
            msg: "最近燃費が低下しています。メンテナンスをお勧めします",
            color: "#E65100",
            bg: colors.warnBg,
          }
      : null;

  const handleDelete = (id: number) => {
    const idx = history.findIndex((h) => h.id === id);
    setConfirmDelete({ id, isLatest: idx === history.length - 1 });
  };

  return (
    <Shell title={`${bikeName} 燃費記録`}>
      {confirmDelete && (
        <DeleteModal
          isLatest={confirmDelete.isLatest}
          onConfirm={() => {
            onDelete(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div
        style={{
          background: colors.red,
          borderRadius: 12,
          padding: 20,
          marginBottom: 12,
          color: colors.white,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
          累積平均燃費 avg(H)
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1 }}>
          {avgH ?? "--"}
        </div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>km/L</div>
        {catalogH && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
            カタログ値：{catalogH} km/L
          </div>
        )}
      </div>

      {catalogStatus && (
        <div
          style={{
            background: catalogStatus.bg,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 12,
            fontSize: 13,
            color: catalogStatus.color,
            fontWeight: 600,
          }}
        >
          {catalogStatus.msg}
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
              background: colors.white,
              borderRadius: 10,
              padding: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: colors.gray }}>{label}</div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: colors.dark,
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
          background: colors.white,
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
                color: colors.dark,
                marginBottom: 4,
              }}
            >
              燃費推移（km/L）
            </div>
            <LineChart
              data={history}
              valueKey="kmpl"
              color={colors.red}
              catalogH={catalogH}
              initOdo={initOdo}
            />
            {months.length > 1 && (
              <>
                <div
                  style={{
                    fontSize: 11,
                    color: colors.gray,
                    margin: "12px 0 4px",
                  }}
                >
                  月別平均
                </div>
                <MonthBarChart
                  months={months}
                  valueKey="kmpl"
                  color={colors.red}
                />
              </>
            )}
            <ChartLegend catalogH={catalogH} avgH={avgH} />
            <FuelBreakdown
              history={history}
              initOdo={initOdo}
              onDelete={handleDelete}
            />
          </>
        )}
        {tab === "費用" && (
          <>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: colors.dark,
                marginBottom: 4,
              }}
            >
              支払金額の推移（円）
            </div>
            <LineChart data={history} valueKey="amount" color={colors.red} />
            {months.length > 1 && (
              <>
                <div
                  style={{
                    fontSize: 11,
                    color: colors.gray,
                    margin: "12px 0 4px",
                  }}
                >
                  月別合計
                </div>
                <MonthBarChart
                  months={months}
                  valueKey="amount"
                  color={colors.red}
                />
              </>
            )}
            <MonthlyBreakdown months={months} onDelete={handleDelete} />
          </>
        )}
      </div>

      <Btn onClick={onRecord}>＋ 給油を記録する</Btn>
    </Shell>
  );
}
