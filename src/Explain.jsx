/* 전문항 해설 — 시험지 양식(프레임·2단) 자동 단 배치 */
import React, { useLayoutEffect, useRef, useState } from "react";
import { parse, Passage } from "./markup.jsx";

const MIN_ZOOM = 0.78;   // 한 단에 안 들어갈 때 최소 축소 배율
const ITEM_GAP = 10;     // 문항 사이 간격(px)

function Stars({ n }) {
  const a = [];
  for (let i = 1; i <= 5; i++) a.push(<span key={i} className={"star" + (n >= i ? " full" : "")}>★</span>);
  return <span className="stars">{a}</span>;
}

function Choices({ item }) {
  return (
    <ul className="choices">
      {item.choices.map((c, i) => {
        const cls = (c.n === item.answer ? "ans" : "") + (c.focus ? " focus" : "");
        return (
          <li key={i} className={cls.trim()}>
            <span className="cn">{c.n}</span>
            <span className="bd">
              <span className="ct">{parse(c.text)}</span>
              {c.tr && <span className="tr">{parse(c.tr)}</span>}
              {c.why && <span className="why">{parse(c.why)}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function AbcTable({ item }) {
  const t = item.table;
  return (
    <table className="abc">
      <colgroup>
        <col style={{ width: 22 }} />
        {t.heads.map((_, i) => <col key={i} />)}
      </colgroup>
      <thead>
        <tr><th></th>{t.heads.map((h, i) => <th key={i}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {t.rows.map((r, i) => (
          <tr key={i} className={r.n === item.answer ? "ans" : ""}>
            <td className="cn">{r.n}</td>
            {r.cells.map((cell, j) => {
              const [w, m] = String(cell).split("|");
              return <td key={j}>{parse(w)}{m && <small>{m}</small>}</td>;
            })}
          </tr>
        ))}
        {t.ev && (
          <tr className="ev">
            <td></td>
            {t.ev.map((e, j) => <td key={j}>{parse(e)}</td>)}
          </tr>
        )}
      </tbody>
    </table>
  );
}

export function ExplainItem({ item }) {
  const stem = item.stem && (
    <p className="stem">{parse(item.stem)}{item.pts && <span className="pt"> [{item.pts}]</span>}</p>
  );
  return (
    <div className="xitem">
      <div className="meta">
        {item.source && <><span>출처 <b>{item.source}</b></span><span>·</span></>}
        {item.type && <><span>{item.type}</span><span>·</span></>}
        {item.transform && <span className="tf">{item.transform}</span>}
        {item.stars != null && <Stars n={item.stars} />}
      </div>

      {item.setLabel && <p className="setlbl">{parse(item.setLabel)}</p>}
      {!item.stemAfter && stem}
      {item.passageRef && <p className="setref">{parse(item.passageRef)}</p>}
      {item.given && <Passage text={item.given} className="given" style={{ lineHeight: 1.9 }} />}
      {item.passage && <Passage text={item.passage} />}
      {item.summary && (
        <>
          <p className="arrow">⬇</p>
          <Passage text={item.summary} style={{ lineHeight: 1.9 }} />
        </>
      )}
      {item.stemAfter && stem}

      {item.table && <AbcTable item={item} />}
      {item.choices && <Choices item={item} />}

      {item.cond && item.cond.length > 0 && (
        <div className="cond">
          <p className="t">&lt;조 건&gt;</p>
          <ul>{item.cond.map((c, i) => <li key={i}>{parse(c)}</li>)}</ul>
        </div>
      )}
      {item.answerLine && (
        <p className="ansrow"><span className="arr">➡</span><span className="line">{parse(item.answerLine)}</span></p>
      )}

      {item.sol && (
        <div className="sol">
          <span className="lbl">해설</span>
          <div className="body">
            {item.sol.ans && <p className="ans">{parse(item.sol.ans)}{item.sol.alt && <span className="alt"> — {parse(item.sol.alt)}</span>}</p>}
            {item.sol.cm && <p className="cm">{parse(item.sol.cm)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function Sheet({ header, no, cols }) {
  return (
    <div className="sheet">
      <div className="frame">
        <div className="exam-head">
          <img src="/logo.png" alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <h1>{header}</h1>
        </div>
        <div className="cols">
          {cols.map((col, ci) => (
            <div className="col" key={ci}>
              {col.map((u) => (
                <div className="xwrap" key={u.key} style={u.zoom < 1 ? { zoom: u.zoom } : undefined}>
                  {u.el}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="sheet-foot">- {no} -</div>
    </div>
  );
}

/* 단(column) 채우기: 순서대로, 안 들어가면 다음 단. 한 단보다 큰 문항은 축소(최소 MIN_ZOOM) */
function packColumns(units, heights, avail) {
  const columns = [];
  let cur = [], used = 0;
  const warnings = [];
  units.forEach((u, i) => {
    let h = heights[i];
    let zoom = 1;
    if (h > avail) {
      zoom = Math.max(MIN_ZOOM, Math.floor((avail / h) * 50) / 50);
      h = h * zoom;
      if (h > avail) warnings.push(u.label + " 문항이 한 단보다 깁니다 — 지문을 더 생략하거나 설명을 줄이세요.");
    }
    const need = cur.length === 0 ? h : used + ITEM_GAP + h;
    if (cur.length > 0 && need > avail) {
      columns.push(cur); cur = []; used = 0;
    }
    cur.push({ ...u, zoom });
    used = cur.length === 1 ? h : used + ITEM_GAP + h;
  });
  if (cur.length) columns.push(cur);
  return { columns, warnings };
}

export default function Explain({ data, startPage, onWarnings }) {
  const header = data.examHeader || data.title || "";
  const items = data.items || [];
  const units = items.map((it, i) => ({
    key: "it" + i,
    label: (it.no || i + 1) + "번",
    el: <ExplainItem item={it} />
  }));

  const [layout, setLayout] = useState(null);
  const measureRef = useRef(null);
  const probeRef = useRef(null);

  useLayoutEffect(() => {
    const compute = () => {
      if (!measureRef.current || !probeRef.current) return;
      const colEl = probeRef.current;
      const cs = getComputedStyle(colEl);
      let avail = colEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (!avail || avail < 100) avail = 960;
      avail = avail * 0.99;
      const hs = Array.from(measureRef.current.children).map((c) => c.offsetHeight);
      const { columns, warnings } = packColumns(units, hs, avail);
      const pages = [];
      for (let i = 0; i < columns.length; i += 2) pages.push([columns[i], columns[i + 1] || []]);
      setLayout(pages);
      if (onWarnings) onWarnings(warnings);
    };
    compute();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(compute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div className="xs">
      {/* 측정용 숨김 영역: 실제 단 폭으로 문항 높이 측정 */}
      <div style={{ position: "absolute", visibility: "hidden", left: "-9999px", top: 0 }} aria-hidden="true">
        <div className="sheet">
          <div className="frame">
            <div className="exam-head"><img src="/logo.png" alt="" /><h1>{header}</h1></div>
            <div className="cols">
              <div className="col" ref={probeRef}>
                <div ref={measureRef}>
                  {units.map((u) => <div className="xwrap" key={u.key}>{u.el}</div>)}
                </div>
              </div>
              <div className="col"></div>
            </div>
          </div>
          <div className="sheet-foot">- 0 -</div>
        </div>
      </div>

      {layout && layout.map((cols, pi) => (
        <Sheet key={pi} header={header} no={startPage + pi} cols={cols} />
      ))}
    </div>
  );
}

export function countExplainPages(layout) { return layout ? layout.length : 0; }
