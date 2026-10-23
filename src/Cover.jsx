/* 1면(표지 + 문항별 분석표 + 출제 포인트) — 자동 페이지 분할 */
import React, { useLayoutEffect, useRef, useState } from "react";

const GAP = 8;
const SAFETY = 0.985;
const SPLIT_MIN = 20; // 객관식+서술형 합계가 이 이상이면 표를 2단으로 균등 분할

function Logo({ h, className }) {
  return (
    <img src="/logo.png" alt="" style={{ height: h }} className={className || "logo"}
      onError={(e) => { e.currentTarget.style.display = "none"; }} />
  );
}

function SecTitle({ num, children }) {
  return <h2 className="sec-title">{num && <span className="sec-num">{num}</span>}{children}</h2>;
}

function ItemColumn({ label, rows, showTeacher, rate }) {
  return (
    <table className="qtable">
      <thead>
        <tr>
          <th className="t-no">{label}</th>
          <th className="t-src">출처</th>
          {showTeacher && <th className="t-teacher">선생님</th>}
          <th className="t-type">유형</th>
          <th className="t-pts">배점</th>
          {rate && <th className="t-rate">오답률</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.no + "-" + i} className={"row-" + (r.group || "none")}>
            <td className="t-no">{r.no}번</td>
            <td className="t-src">{r.source}</td>
            {showTeacher && <td className="t-teacher">{r.teacher}</td>}
            <td className="t-type">{r.type}</td>
            <td className="t-pts">{r.pts}</td>
            {rate && <td className="t-rate">{rate[r.no] != null ? rate[r.no] + "%" : ""}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function QTableSection({ d }) {
  const obj = d.objective || [], subj = d.subjective || [];
  const showTeacher = obj.concat(subj).some((r) => r.teacher && String(r.teacher).trim());
  const rate = d.errorRate || null;
  const total = obj.length + subj.length;
  const legend = d.legend || [];
  let left, right;
  if (total >= SPLIT_MIN) {
    const cut = Math.min(obj.length, Math.ceil((total + 2) / 2));
    left = <ItemColumn label="객관식" rows={obj.slice(0, cut)} showTeacher={showTeacher} rate={rate} />;
    right = (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {obj.length > cut && <ItemColumn label="객관식" rows={obj.slice(cut)} showTeacher={showTeacher} rate={rate} />}
        <ItemColumn label="서술형" rows={subj} showTeacher={showTeacher} rate={rate} />
      </div>
    );
  } else {
    left = <ItemColumn label="객관식" rows={obj} showTeacher={showTeacher} rate={rate} />;
    right = <ItemColumn label="서술형" rows={subj} showTeacher={showTeacher} rate={rate} />;
  }
  return (
    <div className="keep">
      <SecTitle num="1">문항별 분석표</SecTitle>
      {legend.length > 0 && (
        <div className="legend">
          {legend.map((l) => <span key={l.group} className={"lg lg-" + l.group}>{l.label}</span>)}
        </div>
      )}
      <div className="two-col">{left}{right}</div>
    </div>
  );
}

function buildBlocks(d) {
  const blocks = [];
  const s = d.summary || {};
  blocks.push({
    key: "head", el: (
      <>
        <header className="doc-head">
          <Logo h="34px" />
          <p className="doc-brand">옵티멈N스터디 내신분석 리포트</p>
          <h1 className="doc-title">{d.title}</h1>
        </header>
        <div className="summary">
          {s.composition && <div className="summary-row"><span className="summary-key">구성</span><span className="summary-val">{s.composition}</span></div>}
          {s.range && <div className="summary-row"><span className="summary-key">범위</span><span className="summary-val">{s.range}</span></div>}
          {s.keyGrammar && <div className="summary-row"><span className="summary-key">핵심 문법</span><span className="summary-val">{s.keyGrammar}</span></div>}
          {s.difficulty && <div className="summary-row"><span className="summary-key">난이도</span><span className="summary-val"><span className="diff-pill">{s.difficulty}</span></span></div>}
        </div>
      </>
    )
  });
  blocks.push({ key: "qtable", el: <QTableSection d={d} /> });
  if (d.points) {
    const p = d.points;
    blocks.push({
      key: "points", divider: true, el: (
        <div className="keep">
          <SecTitle num="2">출제 포인트 요약</SecTitle>
          <div className="points">
            {p.weakness && <div className="point-block"><p className="point-head">감점 취약 포인트</p><ul>{p.weakness.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
            {p.rangeTips && <div className="point-block"><p className="point-head">범위별 대비 팁</p><ul>{p.rangeTips.map((x, i) => <li key={i}><b>{x.range}</b> — {x.tip}</li>)}</ul></div>}
            {p.mainTypes && <div className="point-block"><p className="point-head">메인 출제 유형</p><ul>{p.mainTypes.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
          </div>
        </div>
      )
    });
  }
  return blocks;
}

function pack(blocks, heights, budget) {
  const pages = [];
  let cur = [], used = 0;
  blocks.forEach((b, i) => {
    const h = heights[i];
    const extra = b.divider && cur.length > 0 ? 20 : 0;
    const need = cur.length === 0 ? h : used + GAP + h + extra;
    if (cur.length > 0 && need > budget) { pages.push(cur); cur = []; used = 0; }
    used = cur.length === 0 ? h : used + GAP + h;
    cur.push(i);
  });
  if (cur.length) pages.push(cur);
  return pages;
}

export default function Cover({ data, onPages }) {
  const blocks = buildBlocks(data);
  const [layout, setLayout] = useState(null);
  const measureRef = useRef(null);
  const probeRef = useRef(null);

  useLayoutEffect(() => {
    const compute = () => {
      if (!measureRef.current || !probeRef.current) return;
      let budget = probeRef.current.clientHeight;
      if (!budget || budget < 100) budget = 1030;
      budget *= SAFETY;
      const hs = Array.from(measureRef.current.children).map((c) => c.offsetHeight);
      const pages = pack(blocks, hs, budget);
      setLayout(pages);
      if (onPages) onPages(pages.length);
    };
    compute();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(compute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      <div style={{ position: "absolute", visibility: "hidden", left: "-9999px", top: 0 }} aria-hidden="true">
        <div className="page"><div className="page-inner" ref={probeRef}></div><div className="page-foot">- 0 -</div></div>
        <div ref={measureRef} style={{ width: "190mm" }}>
          {blocks.map((b) => <div className="bw" key={b.key}>{b.el}</div>)}
        </div>
      </div>
      {layout && layout.map((idxs, pi) => (
        <div className="page" key={pi}>
          {pi > 0 && <Logo h="16px" className="page-logo" />}
          <div className="page-inner">
            <div className="flow-col">
              {idxs.map((bi, pos) => {
                const b = blocks[bi];
                return <div className={"bw" + (b.divider && pos > 0 ? " flow-sep" : "")} key={b.key}>{b.el}</div>;
              })}
            </div>
          </div>
          <div className="page-foot">- {pi + 1} -</div>
        </div>
      ))}
    </>
  );
}
