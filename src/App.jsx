import React, { useEffect, useState } from "react";
import Cover from "./Cover.jsx";
import Explain from "./Explain.jsx";
import { parseDataText } from "./parseData.js";
import { saveReport, listReports, deleteReport } from "./firebase.js";
import { SAMPLE_TEXT } from "./sample.js";
import ScoreTab from "./ScoreTab.jsx";
import { listExams, listScoresByExam, applyStatsToReport } from "./scoreDb.js";
import { examStats } from "./calc.js";

const TABS = [
  { id: "report", label: "리포트" },
  { id: "list", label: "목록" },
  { id: "score", label: "점수기록" }
];

function fmtDate(d) {
  if (!d) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function App() {
  const [tab, setTab] = useState("report");
  const [text, setText] = useState("");
  const [data, setData] = useState(null);
  const [docId, setDocId] = useState(null);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [coverPages, setCoverPages] = useState(1);
  const [showInput, setShowInput] = useState(true);
  const [busy, setBusy] = useState("");
  const [list, setList] = useState(null);

  const apply = (t) => {
    try {
      const d = parseDataText(t);
      setData(d);
      setError("");
      setShowInput(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const onSave = async () => {
    if (!data) return;
    const title = data.title || data.examHeader || "제목 없음";
    setBusy("저장 중…");
    try {
      const id = await saveReport(docId, title, data);
      setDocId(id);
      setBusy("저장 완료");
      setTimeout(() => setBusy(""), 1500);
    } catch (e) {
      setBusy("");
      alert("저장 실패: " + e.message);
    }
  };

  const loadList = async () => {
    setList(null);
    try { setList(await listReports()); }
    catch (e) { setList([]); alert("목록 불러오기 실패: " + e.message); }
  };
  useEffect(() => { if (tab === "list") loadList(); }, [tab]);

  const openItem = (it) => {
    try {
      const d = JSON.parse(it.json);
      setData(d); setDocId(it.id); setText(it.json); setError(""); setShowInput(false); setTab("report");
    } catch (e) { alert("불러오기 실패: " + e.message); }
  };
  /* 점수기록 → 오답률·원내 성적 다시 계산해 이 리포트에 반영 */
  const refreshStats = async () => {
    if (!docId) return;
    setBusy("오답률 계산 중…");
    try {
      const exam = (await listExams()).find((e) => e.reportId === docId);
      if (!exam) { setBusy(""); alert("점수기록 탭에 이 리포트로 등록된 회차가 없습니다.\n점수기록 > 학생·회차 관리에서 먼저 등록하세요."); return; }
      const st = examStats(exam, await listScoresByExam(exam.id));
      if (!st.n) { setBusy(""); alert("이 회차에 입력된 점수가 없습니다."); return; }
      const stats = { n: st.n, nItems: st.nItems, avg: st.avg, objAvg: st.objAvg, subjAvg: st.subjAvg, updatedAt: new Date().toISOString().slice(0, 10) };
      const d = await applyStatsToReport(docId, st.errorRate, stats);
      setData(d); setText(JSON.stringify(d, null, 2));
      setBusy("오답률 갱신 완료");
      setTimeout(() => setBusy(""), 1500);
    } catch (e) { setBusy(""); alert("갱신 실패: " + e.message); }
  };
  const onReportUpdated = (reportId, d) => {
    if (reportId === docId) { setData(d); setText(JSON.stringify(d, null, 2)); }
  };

  const removeItem = async (it) => {
    if (!window.confirm(`삭제할까요?\n${it.title}`)) return;
    await deleteReport(it.id);
    if (docId === it.id) setDocId(null);
    loadList();
  };

  return (
    <div className="app">
      <nav className="topbar no-print">
        <div className="brand"><img src="/logo.png" alt="" /><span>내신분석 리포트</span></div>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t.id} className={"tab" + (tab === t.id ? " on" : "")} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </nav>

      {tab === "report" && (
        <>
          <div className="panel no-print">
            <div className="panel-row">
              <button className="btn" onClick={() => setShowInput((v) => !v)}>{showInput ? "입력창 접기" : "입력창 열기"}</button>
              <button className="btn" onClick={() => { setText(SAMPLE_TEXT); apply(SAMPLE_TEXT); setDocId(null); }}>샘플 불러오기</button>
              <span className="spacer" />
              {data && <button className="btn" onClick={onSave}>{docId ? "수정 저장" : "목록에 저장"}</button>}
              {data && docId && <button className="btn" onClick={refreshStats}>오답률 갱신</button>}
              {data && <button className="btn primary" onClick={() => window.print()}>인쇄 / PDF</button>}
              {busy && <span className="busy">{busy}</span>}
            </div>
            {showInput && (
              <>
                <textarea
                  className="input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="채팅에서 뽑은 data.js 내용을 통째로 붙여넣고 [미리보기 적용]을 누르세요."
                  spellCheck={false}
                />
                <div className="panel-row">
                  <button className="btn primary" onClick={() => { apply(text); setDocId(null); }}>미리보기 적용</button>
                  {error && <span className="err">⚠ {error}</span>}
                </div>
              </>
            )}
            {warnings.length > 0 && (
              <ul className="warn">{warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}</ul>
            )}
          </div>

          {data && (
            <div className="report-wrap">
              <Cover data={data} onPages={setCoverPages} />
              <Explain data={data} startPage={coverPages + 1} onWarnings={setWarnings} />
            </div>
          )}
          {!data && <p className="empty no-print">리포트 데이터를 붙여넣거나 목록에서 불러오세요.</p>}
        </>
      )}

      {tab === "list" && (
        <div className="panel">
          <div className="panel-row">
            <h2 className="ptitle">저장된 리포트</h2>
            <span className="spacer" />
            <button className="btn" onClick={loadList}>새로고침</button>
          </div>
          {list === null && <p className="empty">불러오는 중…</p>}
          {list && list.length === 0 && <p className="empty">저장된 리포트가 없습니다.</p>}
          {list && list.length > 0 && (
            <table className="ltable">
              <thead><tr><th>제목</th><th>수정일</th><th></th></tr></thead>
              <tbody>
                {list.map((it) => (
                  <tr key={it.id}>
                    <td>{it.title}</td>
                    <td>{fmtDate(it.updatedAt)}</td>
                    <td className="acts">
                      <button className="btn sm primary" onClick={() => openItem(it)}>불러오기</button>
                      <button className="btn sm" onClick={() => removeItem(it)}>삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "score" && <ScoreTab onReportUpdated={onReportUpdated} />}
    </div>
  );
}
