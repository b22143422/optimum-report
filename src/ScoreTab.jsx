/* 점수기록 탭 — 점수 입력 / 오답률 / 학생 지표 / 학생·회차 관리 */
import React, { useEffect, useMemo, useState } from "react";
import "./score.css";
import {
  listStudents, saveStudent, addStudentsBulk, deleteStudent,
  listExams, saveExam, deleteExam,
  listScoresByExam, listScoresByStudent, saveScore, deleteScore,
  applyStatsToReport
} from "./scoreDb.js";
import { listReports } from "./firebase.js";
import { buildScore, examStats, examMax, examLabel, itemsFromReport, metaFromTitle, rankOf, num, r1 } from "./calc.js";

const SUBS = [
  { id: "input", label: "점수 입력" },
  { id: "rate", label: "오답률" },
  { id: "student", label: "학생 지표" },
  { id: "manage", label: "학생·회차 관리" }
];
const MODES = [
  { id: "items", label: "문항별 체크" },
  { id: "split", label: "객관식·서술형 점수" },
  { id: "total", label: "총점만" }
];
const fmt = (x) => (x == null || x === "" ? "–" : String(x));

export default function ScoreTab({ onReportUpdated }) {
  const [sub, setSub] = useState("input");
  const [students, setStudents] = useState(null);
  const [exams, setExams] = useState(null);
  const [err, setErr] = useState("");

  const reload = async () => {
    try {
      const [s, e] = await Promise.all([listStudents(), listExams()]);
      setStudents(s); setExams(e); setErr("");
    } catch (e) {
      setErr("불러오기 실패: " + e.message + " (Firestore 규칙을 확인하세요)");
      setStudents([]); setExams([]);
    }
  };
  useEffect(() => { reload(); }, []);

  return (
    <div className="sc">
      <div className="panel">
        <div className="panel-row">
          <h2 className="ptitle">점수기록</h2>
          <div className="sc-subtabs">
            {SUBS.map((t) => (
              <button key={t.id} className={"sc-subtab" + (sub === t.id ? " on" : "")} onClick={() => setSub(t.id)}>{t.label}</button>
            ))}
          </div>
          <span className="spacer" />
          <button className="btn sm" onClick={reload}>새로고침</button>
        </div>
        {err && <p className="err">⚠ {err}</p>}
      </div>

      {(students === null || exams === null) && <p className="empty">불러오는 중…</p>}
      {students && exams && sub === "input" && <InputView students={students} exams={exams} goManage={() => setSub("manage")} />}
      {students && exams && sub === "rate" && <RateView exams={exams} onReportUpdated={onReportUpdated} />}
      {students && exams && sub === "student" && <StudentView students={students} exams={exams} />}
      {students && exams && sub === "manage" && <ManageView students={students} exams={exams} reload={reload} />}
    </div>
  );
}

/* ───────── 공용: 회차 선택 ───────── */
function ExamSelect({ exams, value, onChange }) {
  return (
    <select className="sc-select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">시험 회차 선택</option>
      {exams.map((e) => (
        <option key={e.id} value={e.id}>{examLabel(e)}{e.reportId ? "" : " (리포트 없음)"}</option>
      ))}
    </select>
  );
}

/* ───────── 1. 점수 입력 ───────── */
function InputView({ students, exams, goManage }) {
  const [examId, setExamId] = useState(exams[0] ? exams[0].id : "");
  const exam = exams.find((e) => e.id === examId);
  const [scores, setScores] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [editId, setEditId] = useState(null);

  const loadScores = async () => {
    if (!examId) { setScores([]); return; }
    setScores(await listScoresByExam(examId));
  };
  useEffect(() => { setEditId(null); loadScores(); /* eslint-disable-next-line */ }, [examId]);

  if (!exams.length) {
    return (
      <div className="panel">
        <p className="empty">등록된 시험 회차가 없습니다. <button className="btn sm" onClick={goManage}>학생·회차 관리</button>에서 리포트를 회차로 등록하세요.</p>
      </div>
    );
  }

  const roster = students.filter((s) =>
    showAll || !exam || ((!exam.school || s.school === exam.school) && (!exam.grade || String(s.grade) === String(exam.grade))));
  const byStudent = Object.fromEntries(scores.map((s) => [s.studentId, s]));
  const max = exam ? examMax(exam) : null;
  const doneCount = roster.filter((s) => byStudent[s.id]).length;

  const nextAfter = (id) => {
    const i = roster.findIndex((s) => s.id === id);
    const rest = roster.slice(i + 1).concat(roster.slice(0, i));
    const nx = rest.find((s) => !byStudent[s.id]);
    return nx ? nx.id : null;
  };

  return (
    <div className="panel">
      <div className="panel-row">
        <ExamSelect exams={exams} value={examId} onChange={setExamId} />
        {exam && <span className="sc-note">만점 {max.total} (객관식 {max.obj} · 서술형 {max.subj}) · 입력 {doneCount}/{roster.length}명</span>}
        <span className="spacer" />
        <label className="sc-check"><input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> 다른 학교 학생도 보기</label>
      </div>

      {exam && roster.length === 0 && (
        <p className="empty">{exam.school} {exam.grade}학년 학생이 없습니다. <button className="btn sm" onClick={goManage}>학생 추가</button></p>
      )}

      {exam && roster.length > 0 && (
        <table className="ltable sc-table">
          <thead>
            <tr><th>학생</th><th>입력 방식</th><th className="num">객관식</th><th className="num">서술형</th><th className="num">총점</th><th></th></tr>
          </thead>
          <tbody>
            {roster.map((s) => {
              const sc = byStudent[s.id];
              return (
                <React.Fragment key={s.id}>
                  <tr className={editId === s.id ? "sc-editing" : ""}>
                    <td><b>{s.name}</b> <span className="sc-dim">{s.school} {s.grade}학년{s.branch ? " · " + s.branch : ""}</span></td>
                    <td>{sc ? (MODES.find((m) => m.id === sc.mode) || {}).label : <span className="sc-dim">미입력</span>}</td>
                    <td className="num">{sc ? fmt(sc.obj) : ""}</td>
                    <td className="num">{sc ? fmt(sc.subj) : ""}</td>
                    <td className="num"><b>{sc ? fmt(sc.total) : ""}</b></td>
                    <td className="acts">
                      <button className={"btn sm" + (sc ? "" : " primary")} onClick={() => setEditId(editId === s.id ? null : s.id)}>
                        {editId === s.id ? "닫기" : sc ? "수정" : "입력"}
                      </button>
                    </td>
                  </tr>
                  {editId === s.id && (
                    <tr className="sc-editor-row">
                      <td colSpan={6}>
                        <ScoreEditor
                          exam={exam}
                          student={s}
                          existing={sc}
                          onSaved={async (goNext) => { await loadScores(); setEditId(goNext ? nextAfter(s.id) : null); }}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ScoreEditor({ exam, student, existing, onSaved }) {
  const hasItems = exam.items && exam.items.length > 0;
  const [mode, setMode] = useState(existing ? existing.mode : hasItems ? "items" : "split");
  const [objWrong, setObjWrong] = useState(existing && existing.objWrong ? existing.objWrong : []);
  const [subjEarned, setSubjEarned] = useState(existing && existing.subjEarned ? { ...existing.subjEarned } : {});
  const [obj, setObj] = useState(existing && existing.obj != null ? existing.obj : "");
  const [subj, setSubj] = useState(existing && existing.subj != null ? existing.subj : "");
  const [total, setTotal] = useState(existing && existing.total != null ? existing.total : "");
  const [busy, setBusy] = useState(false);

  const objItems = (exam.items || []).filter((i) => i.kind === "obj");
  const subjItems = (exam.items || []).filter((i) => i.kind === "subj");
  const preview = buildScore(exam, mode, { objWrong, subjEarned, obj, subj, total });

  const toggle = (k) => setObjWrong((w) => (w.includes(k) ? w.filter((x) => x !== k) : [...w, k]));
  const setEarn = (k, v) => setSubjEarned((m) => ({ ...m, [k]: v }));

  const save = async (goNext) => {
    if (mode !== "items" && (mode === "total" ? total === "" : obj === "" && subj === "")) {
      alert("점수를 입력하세요."); return;
    }
    setBusy(true);
    try {
      await saveScore(exam.id, student.id, preview);
      await onSaved(goNext);
    } catch (e) { alert("저장 실패: " + e.message); }
    setBusy(false);
  };
  const remove = async () => {
    if (!window.confirm(`${student.name} 점수를 삭제할까요?`)) return;
    await deleteScore(exam.id, student.id);
    await onSaved(false);
  };

  return (
    <div className="sc-editor">
      <div className="panel-row">
        <b>{student.name}</b>
        <div className="sc-seg">
          {MODES.map((m) => (
            <button key={m.id} disabled={m.id === "items" && !hasItems}
              className={"sc-seg-btn" + (mode === m.id ? " on" : "")} onClick={() => setMode(m.id)}>{m.label}</button>
          ))}
        </div>
        {!hasItems && <span className="sc-dim">리포트와 연결되지 않은 회차라 문항별 체크는 쓸 수 없어요.</span>}
      </div>

      {mode === "items" && (
        <>
          <p className="sc-label">객관식 — 틀린 문항을 누르세요</p>
          <div className="sc-qgrid">
            {objItems.map((it) => (
              <button key={it.key} className={"sc-q" + (objWrong.includes(it.key) ? " wrong" : "")} onClick={() => toggle(it.key)} title={`${it.type} · ${it.pts}점`}>
                <span className="sc-q-no">{it.key}</span><span className="sc-q-pts">{it.pts}</span>
              </button>
            ))}
          </div>
          <p className="sc-label">서술형 — 받은 점수 (비워두면 만점)</p>
          <div className="sc-subj">
            {subjItems.map((it) => {
              const v = subjEarned[it.key];
              const full = v == null || v === "" || num(v) >= num(it.pts);
              return (
                <div key={it.key} className={"sc-subj-row" + (full ? "" : " wrong")}>
                  <span className="sc-q-no">{it.key}</span>
                  <input type="number" step="0.1" min="0" max={it.pts} value={v ?? ""} placeholder={String(it.pts)}
                    onChange={(e) => setEarn(it.key, e.target.value)} />
                  <span className="sc-dim">/ {it.pts}</span>
                  <button className="btn sm" onClick={() => setEarn(it.key, 0)}>0</button>
                  <button className="btn sm" onClick={() => setEarn(it.key, "")}>만점</button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {mode === "split" && (
        <div className="panel-row">
          <label className="sc-field">객관식 <input type="number" step="0.1" value={obj} onChange={(e) => setObj(e.target.value)} /></label>
          <label className="sc-field">서술형 <input type="number" step="0.1" value={subj} onChange={(e) => setSubj(e.target.value)} /></label>
        </div>
      )}
      {mode === "total" && (
        <div className="panel-row">
          <label className="sc-field">총점 <input type="number" step="0.1" value={total} onChange={(e) => setTotal(e.target.value)} /></label>
        </div>
      )}

      <div className="panel-row sc-editor-foot">
        <span className="sc-sum">
          {mode !== "total" && <>객관식 <b>{preview.obj}</b> · 서술형 <b>{preview.subj}</b> · </>}총점 <b className="sc-total">{preview.total}</b>
        </span>
        <span className="spacer" />
        {existing && <button className="btn sm" onClick={remove}>삭제</button>}
        <button className="btn sm" disabled={busy} onClick={() => save(false)}>저장</button>
        <button className="btn sm primary" disabled={busy} onClick={() => save(true)}>저장 후 다음 학생</button>
      </div>
    </div>
  );
}

/* ───────── 2. 오답률 ───────── */
function RateView({ exams, onReportUpdated }) {
  const [examId, setExamId] = useState(exams[0] ? exams[0].id : "");
  const exam = exams.find((e) => e.id === examId);
  const [scores, setScores] = useState(null);
  const [sort, setSort] = useState("no");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMsg("");
    if (!examId) { setScores([]); return; }
    setScores(null);
    listScoresByExam(examId).then(setScores).catch(() => setScores([]));
  }, [examId]);

  const st = useMemo(() => (exam && scores ? examStats(exam, scores) : null), [exam, scores]);

  const apply = async () => {
    if (!exam.reportId) return;
    if (!st.nItems) { alert("문항별 체크로 입력한 학생이 없어 오답률을 계산할 수 없습니다."); return; }
    try {
      const stats = { n: st.n, nItems: st.nItems, avg: st.avg, objAvg: st.objAvg, subjAvg: st.subjAvg, updatedAt: new Date().toISOString().slice(0, 10) };
      const data = await applyStatsToReport(exam.reportId, st.errorRate, stats);
      setMsg("리포트 1면에 반영했어요.");
      if (onReportUpdated) onReportUpdated(exam.reportId, data);
    } catch (e) { alert("반영 실패: " + e.message); }
  };

  const rows = st ? [...st.rows] : [];
  if (sort === "rate") rows.sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));

  return (
    <div className="panel">
      <div className="panel-row">
        <ExamSelect exams={exams} value={examId} onChange={setExamId} />
        <span className="spacer" />
        {exam && exam.reportId && <button className="btn sm primary" onClick={apply}>리포트 1면에 반영</button>}
        {msg && <span className="busy">{msg}</span>}
      </div>
      {!exam && <p className="empty">회차를 선택하세요.</p>}
      {exam && scores === null && <p className="empty">불러오는 중…</p>}
      {st && (
        <>
          <div className="sc-stats">
            <Stat k="점수 입력" v={`${st.n}명`} />
            <Stat k="문항 체크" v={`${st.nItems}명`} />
            <Stat k="평균" v={fmt(st.avg)} />
            <Stat k="객관식 평균" v={fmt(st.objAvg)} />
            <Stat k="서술형 평균" v={fmt(st.subjAvg)} />
            <Stat k="최고 / 최저" v={st.n ? `${st.max} / ${st.min}` : "–"} />
          </div>
          {!(exam.items && exam.items.length) && <p className="empty">리포트와 연결되지 않은 회차라 문항별 오답률은 없습니다.</p>}
          {exam.items && exam.items.length > 0 && (
            <>
              <div className="panel-row">
                <span className="sc-dim">오답률 = 문항별 체크로 입력한 {st.nItems}명 중 틀린(서술형은 만점 못 받은) 비율</span>
                <span className="spacer" />
                <div className="sc-seg">
                  <button className={"sc-seg-btn" + (sort === "no" ? " on" : "")} onClick={() => setSort("no")}>번호순</button>
                  <button className={"sc-seg-btn" + (sort === "rate" ? " on" : "")} onClick={() => setSort("rate")}>오답률 높은 순</button>
                </div>
              </div>
              <table className="ltable sc-table">
                <thead><tr><th>문항</th><th>유형</th><th className="num">배점</th><th className="num">오답</th><th>오답률</th><th className="num">서술형 득점률</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <td><b>{r.key}{r.kind === "obj" ? "번" : ""}</b></td>
                      <td className="sc-dim">{r.type}</td>
                      <td className="num">{r.pts}</td>
                      <td className="num">{st.nItems ? `${r.wrong}/${st.nItems}` : "–"}</td>
                      <td>
                        {r.rate != null ? (
                          <div className="sc-bar"><div className={"sc-bar-fill" + (r.rate >= 50 ? " hot" : "")} style={{ width: r.rate + "%" }} /><span>{r.rate}%</span></div>
                        ) : "–"}
                      </td>
                      <td className="num">{r.earnRate != null ? r.earnRate + "%" : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ k, v }) {
  return <div className="sc-stat"><span className="sc-stat-k">{k}</span><span className="sc-stat-v">{v}</span></div>;
}

/* ───────── 3. 학생 지표 ───────── */
function StudentView({ students, exams }) {
  const [sid, setSid] = useState(students[0] ? students[0].id : "");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState(null);
  const student = students.find((s) => s.id === sid);

  useEffect(() => {
    if (!sid) { setRows([]); return; }
    setRows(null);
    (async () => {
      const mine = await listScoresByStudent(sid);
      const out = [];
      for (const sc of mine) {
        const ex = exams.find((e) => e.id === sc.examId);
        if (!ex) continue;
        const all = await listScoresByExam(ex.id);
        const st = examStats(ex, all);
        out.push({ exam: ex, sc, st, rank: rankOf(sc.total, all), n: st.n, max: examMax(ex) });
      }
      out.sort((a, b) =>
        (Number(a.exam.year) || 0) - (Number(b.exam.year) || 0) ||
        (Number(a.exam.semester) || 0) - (Number(b.exam.semester) || 0) ||
        (Number(a.exam.round) || 0) - (Number(b.exam.round) || 0));
      setRows(out);
    })().catch(() => setRows([]));
  }, [sid, exams]);

  const filtered = students.filter((s) => !q || (s.name + s.school).includes(q));

  /* 취약 유형: 문항별 체크 기록에서 틀린 문항의 유형 집계 */
  const weak = useMemo(() => {
    const m = {};
    (rows || []).forEach(({ exam, sc }) => {
      if (sc.mode !== "items") return;
      (exam.items || []).forEach((it) => {
        const t = (it.type || "기타").trim();
        if (!m[t]) m[t] = { type: t, wrong: 0, total: 0 };
        m[t].total++;
        const wrong = it.kind === "obj"
          ? (sc.objWrong || []).includes(it.key)
          : num((sc.subjEarned || {})[it.key] ?? it.pts) < num(it.pts);
        if (wrong) m[t].wrong++;
      });
    });
    return Object.values(m).filter((x) => x.wrong > 0).sort((a, b) => b.wrong - a.wrong || b.wrong / b.total - a.wrong / a.total).slice(0, 6);
  }, [rows]);

  return (
    <div className="panel">
      <div className="panel-row">
        <input className="sc-search" placeholder="이름·학교 검색" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="sc-select" value={sid} onChange={(e) => setSid(e.target.value)}>
          <option value="">학생 선택</option>
          {filtered.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.school} {s.grade}학년</option>)}
        </select>
      </div>
      {!student && <p className="empty">학생을 선택하세요.</p>}
      {student && rows === null && <p className="empty">불러오는 중…</p>}
      {student && rows && rows.length === 0 && <p className="empty">{student.name} 학생의 점수 기록이 없습니다.</p>}
      {student && rows && rows.length > 0 && (
        <>
          <TrendChart rows={rows} />
          <table className="ltable sc-table">
            <thead>
              <tr><th>회차</th><th className="num">객관식</th><th className="num">서술형</th><th className="num">총점</th><th className="num">원내 평균</th><th className="num">차이</th><th className="num">원내 석차</th></tr>
            </thead>
            <tbody>
              {rows.map(({ exam, sc, st, rank, n, max }) => {
                const diff = st.avg != null && sc.total != null ? r1(num(sc.total) - st.avg) : null;
                return (
                  <tr key={exam.id}>
                    <td>{examLabel(exam)}</td>
                    <td className="num">{sc.obj != null ? `${sc.obj}/${max.obj}` : "–"}</td>
                    <td className="num">{sc.subj != null ? `${sc.subj}/${max.subj}` : "–"}</td>
                    <td className="num"><b>{fmt(sc.total)}</b></td>
                    <td className="num">{fmt(st.avg)}</td>
                    <td className={"num " + (diff > 0 ? "sc-up" : diff < 0 ? "sc-down" : "")}>{diff == null ? "–" : (diff > 0 ? "+" : "") + diff}</td>
                    <td className="num">{rank}/{n}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {weak.length > 0 && (
            <>
              <p className="sc-label">자주 틀린 유형 (문항별 체크 기록 기준)</p>
              <table className="ltable sc-table">
                <thead><tr><th>유형</th><th className="num">틀림 / 출제</th></tr></thead>
                <tbody>{weak.map((w) => <tr key={w.type}><td>{w.type}</td><td className="num">{w.wrong} / {w.total}</td></tr>)}</tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}

function TrendChart({ rows }) {
  const W = 720, H = 210, L = 40, R = 16, T = 16, B = 46;
  const pts = rows.map((r) => ({
    me: r.sc.total != null ? (num(r.sc.total) / (r.max.total || 100)) * 100 : null,
    avg: r.st.avg != null ? (r.st.avg / (r.max.total || 100)) * 100 : null,
    label: `${String(r.exam.year).slice(2)}-${r.exam.semester}-${r.exam.round}`,
    sub: r.exam.subject || ""
  }));
  const n = pts.length;
  const x = (i) => (n === 1 ? L + (W - L - R) / 2 : L + (i * (W - L - R)) / (n - 1));
  const y = (v) => T + ((100 - v) * (H - T - B)) / 100;
  const line = (key) => pts.map((p, i) => (p[key] == null ? null : `${x(i)},${y(p[key])}`)).filter(Boolean).join(" ");
  return (
    <div className="sc-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="회차별 점수 추이">
        {[0, 25, 50, 75, 100].map((g) => (
          <g key={g}>
            <line x1={L} x2={W - R} y1={y(g)} y2={y(g)} className="sc-grid" />
            <text x={L - 8} y={y(g) + 4} className="sc-axis" textAnchor="end">{g}</text>
          </g>
        ))}
        <polyline points={line("avg")} className="sc-line-avg" fill="none" />
        <polyline points={line("me")} className="sc-line-me" fill="none" />
        {pts.map((p, i) => (
          <g key={i}>
            {p.avg != null && <circle cx={x(i)} cy={y(p.avg)} r="3" className="sc-dot-avg" />}
            {p.me != null && <circle cx={x(i)} cy={y(p.me)} r="4.5" className="sc-dot-me" />}
            {p.me != null && <text x={x(i)} y={y(p.me) - 9} textAnchor="middle" className="sc-val">{r1(p.me)}</text>}
            <text x={x(i)} y={H - B + 18} textAnchor="middle" className="sc-axis">{p.label}</text>
            <text x={x(i)} y={H - B + 32} textAnchor="middle" className="sc-axis sc-axis-sub">{p.sub}</text>
          </g>
        ))}
      </svg>
      <div className="sc-legend"><span className="sc-lg-me">학생 점수</span><span className="sc-lg-avg">원내 평균</span><span className="sc-dim">100점 환산</span></div>
    </div>
  );
}

/* ───────── 4. 학생·회차 관리 ───────── */
const EMPTY_STUDENT = { name: "", school: "", grade: "", branch: "", memo: "" };
const EMPTY_EXAM = { year: "", school: "", grade: "", semester: "", round: "", subject: "", objMax: "", subjMax: "", reportId: "", items: [] };

function ManageView({ students, exams, reload }) {
  return (
    <>
      <StudentManager students={students} reload={reload} />
      <ExamManager exams={exams} reload={reload} />
    </>
  );
}

function StudentManager({ students, reload }) {
  const [form, setForm] = useState(EMPTY_STUDENT);
  const [editId, setEditId] = useState(null);
  const [bulk, setBulk] = useState("");
  const [filter, setFilter] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) { alert("이름을 입력하세요."); return; }
    await saveStudent(editId, { ...form, name: form.name.trim(), school: form.school.trim(), grade: String(form.grade).trim() });
    setForm((f) => ({ ...EMPTY_STUDENT, school: f.school, grade: f.grade, branch: f.branch }));
    setEditId(null);
    reload();
  };
  const saveBulk = async () => {
    const names = bulk.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
    if (!names.length) return;
    if (!form.school.trim() || !String(form.grade).trim()) { alert("일괄 추가는 위 칸에 학교·학년을 먼저 적어주세요."); return; }
    await addStudentsBulk(names.map((name) => ({ name, school: form.school.trim(), grade: String(form.grade).trim(), branch: form.branch, memo: "" })));
    setBulk("");
    reload();
  };
  const remove = async (s) => {
    if (!window.confirm(`${s.name} 학생과 이 학생의 점수 기록을 모두 삭제할까요?`)) return;
    await deleteStudent(s.id);
    reload();
  };

  const schools = [...new Set(students.map((s) => s.school).filter(Boolean))];
  const list = students.filter((s) => !filter || s.school === filter);

  return (
    <div className="panel">
      <div className="panel-row"><h3 className="sc-h3">학생</h3><span className="sc-dim">{students.length}명</span></div>
      <div className="panel-row">
        <input className="sc-in" placeholder="이름" value={form.name} onChange={set("name")} />
        <input className="sc-in" placeholder="학교 (예: 대청고)" value={form.school} onChange={set("school")} />
        <input className="sc-in sc-in-s" placeholder="학년" value={form.grade} onChange={set("grade")} />
        <select className="sc-in sc-in-s" value={form.branch} onChange={set("branch")}>
          <option value="">지점</option><option value="율하">율하</option><option value="삼계">삼계</option>
        </select>
        <input className="sc-in" placeholder="메모" value={form.memo} onChange={set("memo")} />
        <button className="btn sm primary" onClick={save}>{editId ? "수정 저장" : "추가"}</button>
        {editId && <button className="btn sm" onClick={() => { setEditId(null); setForm(EMPTY_STUDENT); }}>취소</button>}
      </div>
      <div className="panel-row">
        <textarea className="sc-bulk" placeholder="여러 명 한 번에: 이름을 줄바꿈이나 쉼표로 구분해 붙여넣기 (학교·학년·지점은 위 칸 값 사용)" value={bulk} onChange={(e) => setBulk(e.target.value)} />
        <button className="btn sm" onClick={saveBulk}>일괄 추가</button>
      </div>
      <div className="panel-row">
        <select className="sc-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">전체 학교</option>
          {schools.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {list.length === 0 && <p className="empty">학생이 없습니다. 위에서 추가하세요.</p>}
      {list.length > 0 && (
        <table className="ltable sc-table">
          <thead><tr><th>이름</th><th>학교</th><th>학년</th><th>지점</th><th>메모</th><th></th></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td><b>{s.name}</b></td><td>{s.school}</td><td>{s.grade}</td><td>{s.branch}</td><td className="sc-dim">{s.memo}</td>
                <td className="acts">
                  <button className="btn sm" onClick={() => { setEditId(s.id); setForm({ ...EMPTY_STUDENT, ...s }); }}>수정</button>
                  <button className="btn sm" onClick={() => remove(s)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ExamManager({ exams, reload }) {
  const [form, setForm] = useState(EMPTY_EXAM);
  const [editId, setEditId] = useState(null);
  const [reports, setReports] = useState(null);
  const [repId, setRepId] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { listReports().then(setReports).catch(() => setReports([])); }, []);

  const linked = new Set(exams.map((e) => e.reportId).filter(Boolean));

  const pickReport = (id) => {
    setRepId(id);
    const rp = (reports || []).find((r) => r.id === id);
    if (!rp) return;
    try {
      const data = JSON.parse(rp.json);
      const meta = metaFromTitle(data.title || rp.title);
      const items = itemsFromReport(data);
      setEditId(null);
      setForm({ ...EMPTY_EXAM, ...meta, reportId: id, items });
    } catch (e) { alert("리포트 읽기 실패: " + e.message); }
  };

  const save = async () => {
    if (!form.school || !form.year || !form.semester || !form.round) { alert("년도·학교·학기·차수는 꼭 적어주세요."); return; }
    const v = {
      year: String(form.year).trim(), school: String(form.school).trim(), grade: String(form.grade).trim(),
      semester: String(form.semester).trim(), round: String(form.round).trim(), subject: String(form.subject).trim(),
      reportId: form.reportId || "", items: form.items || []
    };
    if (!v.items.length) { v.objMax = num(form.objMax); v.subjMax = num(form.subjMax); }
    await saveExam(editId, v);
    setForm(EMPTY_EXAM); setEditId(null); setRepId("");
    reload();
  };
  const remove = async (e) => {
    if (!window.confirm(`${examLabel(e)} 회차와 이 회차의 점수 기록을 모두 삭제할까요? (리포트는 지워지지 않습니다)`)) return;
    await deleteExam(e.id);
    reload();
  };

  const mx = form.items && form.items.length ? examMax(form) : null;

  return (
    <div className="panel">
      <div className="panel-row"><h3 className="sc-h3">시험 회차</h3><span className="sc-dim">{exams.length}개</span></div>
      <div className="panel-row">
        <select className="sc-select" value={repId} onChange={(e) => pickReport(e.target.value)}>
          <option value="">저장된 리포트에서 가져오기 (문항·배점 자동)</option>
          {(reports || []).map((r) => <option key={r.id} value={r.id}>{linked.has(r.id) ? "✓ " : ""}{r.title}</option>)}
        </select>
        <span className="sc-dim">리포트가 없는 회차는 아래 칸만 채워서 추가 (총점·객관식/서술형 점수만 기록)</span>
      </div>
      <div className="panel-row">
        <input className="sc-in sc-in-s" placeholder="년도" value={form.year} onChange={set("year")} />
        <input className="sc-in" placeholder="학교" value={form.school} onChange={set("school")} />
        <input className="sc-in sc-in-s" placeholder="학년" value={form.grade} onChange={set("grade")} />
        <input className="sc-in sc-in-s" placeholder="학기" value={form.semester} onChange={set("semester")} />
        <input className="sc-in sc-in-s" placeholder="차수" value={form.round} onChange={set("round")} />
        <input className="sc-in" placeholder="과목 (예: 공통영어2)" value={form.subject} onChange={set("subject")} />
        {!(form.items && form.items.length) && (
          <>
            <input className="sc-in sc-in-s" placeholder="객관식 만점" value={form.objMax} onChange={set("objMax")} />
            <input className="sc-in sc-in-s" placeholder="서술형 만점" value={form.subjMax} onChange={set("subjMax")} />
          </>
        )}
        <button className="btn sm primary" onClick={save}>{editId ? "수정 저장" : "회차 추가"}</button>
        {(editId || form.reportId) && <button className="btn sm" onClick={() => { setEditId(null); setForm(EMPTY_EXAM); setRepId(""); }}>취소</button>}
      </div>
      {mx && <p className="sc-note">리포트 연결 · 객관식 {form.items.filter((i) => i.kind === "obj").length}문항({mx.obj}점) + 서술형 {form.items.filter((i) => i.kind === "subj").length}문항({mx.subj}점) = {mx.total}점</p>}

      {exams.length > 0 && (
        <table className="ltable sc-table">
          <thead><tr><th>회차</th><th>문항</th><th className="num">만점</th><th>리포트</th><th></th></tr></thead>
          <tbody>
            {exams.map((e) => {
              const m = examMax(e);
              return (
                <tr key={e.id}>
                  <td><b>{examLabel(e)}</b></td>
                  <td className="sc-dim">{e.items && e.items.length ? `${e.items.length}문항` : "점수만"}</td>
                  <td className="num">{m.total}</td>
                  <td>{e.reportId ? "연결됨" : <span className="sc-dim">없음</span>}</td>
                  <td className="acts">
                    <button className="btn sm" onClick={() => { setEditId(e.id); setRepId(""); setForm({ ...EMPTY_EXAM, ...e }); }}>수정</button>
                    <button className="btn sm" onClick={() => remove(e)}>삭제</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
