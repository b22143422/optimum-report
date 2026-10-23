# 옵티멈 내신분석 리포트 (optimum-report)

- 리포트 탭: data.js 붙여넣기 → 미리보기 → 목록에 저장 / 인쇄·PDF
- 목록 탭: Firebase 저장본 불러오기·삭제
- 점수기록 탭: (3차 작업 예정)

## 파일
- src/App.jsx        화면(탭·입력·목록)
- src/Cover.jsx      1면(제목·요약·문항별 분석표·출제 포인트)
- src/Explain.jsx    전문항 해설(시험지 양식, 자동 단 배치)
- src/markup.jsx     인라인 마크업([y:…|①] [w:단어|뜻] [x:…] 등) 해석기
- src/parseData.js   붙여넣은 data.js 텍스트 → 객체
- src/firebase.js    Firebase 설정·저장/목록/삭제
- src/sample_data.js 샘플 데이터(율하고1 4문항)
- src/styles.css     전체 스타일
- public/logo.png    학원 로고
