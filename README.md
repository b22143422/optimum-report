# 옵티멈 내신분석 리포트 (optimum-report)

- 리포트 탭: data.js 붙여넣기 → 미리보기 → 목록에 저장 / 인쇄·PDF
- 목록 탭: Firebase 저장본 불러오기·삭제
- 점수기록 탭: 학생·회차 관리 → 점수 입력(문항별 체크·객관식/서술형·총점) → 오답률 → 학생 지표, 리포트 1면에 오답률·원내 성적 반영

## 파일
- src/App.jsx        화면(탭·입력·목록)
- src/Cover.jsx      1면(제목·요약·문항별 분석표·출제 포인트)
- src/Explain.jsx    전문항 해설(시험지 양식, 자동 단 배치)
- src/markup.jsx     인라인 마크업([y:…|①] [w:단어|뜻] [x:…] 등) 해석기
- src/parseData.js   붙여넣은 data.js 텍스트 → 객체
- src/firebase.js    Firebase 설정·저장/목록/삭제
- src/ScoreTab.jsx   점수기록 탭(점수 입력·오답률·학생 지표·학생/회차 관리)
- src/scoreDb.js     점수기록 Firestore 저장(students·exams·scores) + 리포트 반영
- src/calc.js        점수·오답률·석차 계산
- src/score.css      점수기록 탭 스타일
- src/sample_data.js 샘플 데이터(율하고1 4문항)
- src/styles.css     전체 스타일
- public/logo.png    학원 로고
