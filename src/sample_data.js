export default {
  /* ───── 1면 ───── */
  title: "2026 율하고 1학년 2학기 1차 공통영어2 지필평가 출제 분석",
  examHeader: "2026학년도 2학기 1차 시험 율하고 1학년 전문항 해설",
  summary: {
    composition: "선택형 13문항(60점) + 서답형 6문항(40점) = 19문항 100점",
    range: "교과서 3과(Dark Patterns) · 4과(Stereotypes) + 외부지문(2024 9월 학평 31·33·35)",
    keyGrammar: "3과 조동사+have p.p. / suggest that+(should)동사원형 · 4과 관계대명사 what / 분사구문",
    difficulty: "상"
  },
  legend: [
    { group: "g3", label: "3과" },
    { group: "g4", label: "4과" },
    { group: "mock", label: "외부지문" }
  ],
  objective: [
    { no: 1, source: "3과", teacher: "", type: "[본문] 제목", pts: 4.2, group: "g3" },
    { no: 2, source: "3과", teacher: "", type: "[본문] 내용일치", pts: 4.3, group: "g3" },
    { no: 3, source: "4과", teacher: "", type: "[본문] 주제", pts: 4.2, group: "g4" },
    { no: 4, source: "3과", teacher: "", type: "[본문] 요약문 완성", pts: 4.5, group: "g3" },
    { no: 5, source: "4과", teacher: "", type: "[본문] 언급되지 않은 것", pts: 4.0, group: "g4" },
    { no: 6, source: "9모33", teacher: "", type: "[본문] 빈칸", pts: 4.8, group: "mock" },
    { no: 7, source: "3과", teacher: "", type: "[본문] 순서 배열", pts: 4.3, group: "g3" },
    { no: 8, source: "4과", teacher: "", type: "[본문] 빈칸", pts: 4.3, group: "g4" },
    { no: 9, source: "4과", teacher: "", type: "[문법] 어법 선택", pts: 4.8, group: "g4" },
    { no: 10, source: "9모31", teacher: "", type: "[본문] 무관한 문장", pts: 4.6, group: "mock" },
    { no: 11, source: "3과", teacher: "", type: "[본문] 문장 삽입", pts: 4.5, group: "g3" },
    { no: 12, source: "9모35", teacher: "", type: "[본문] 어휘", pts: 5.5, group: "mock" },
    { no: 13, source: "4과", teacher: "", type: "[본문] 내용일치", pts: 6.0, group: "g4" }
  ],
  subjective: [
    { no: 1, source: "3과", teacher: "", type: "[문법] 어법 고치기", pts: 6, group: "g3" },
    { no: 2, source: "4과", teacher: "", type: "[본문] 조건 영작", pts: 6, group: "g4" },
    { no: 3, source: "3과", teacher: "", type: "[본문] 우리말 영작", pts: 8, group: "g3" },
    { no: 4, source: "4과", teacher: "", type: "[본문] 요약 빈칸", pts: 6, group: "g4" },
    { no: 5, source: "9모33", teacher: "", type: "[본문] 조건 영작", pts: 7, group: "mock" },
    { no: 6, source: "4과", teacher: "", type: "[본문] 조건 영작", pts: 7, group: "g4" }
  ],
  points: {
    weakness: [
      "서답형 40점 중 30점이 조건 영작 — 조건(제시어·관계사·어형변화) 하나라도 빠지면 감점",
      "순서·삽입 문항은 담화표지(However·Ultimately)와 지시어 연결로 결정됨"
    ],
    rangeTips: [
      { range: "3과", tip: "요약문·순서·삽입 3유형이 집중 — 단락별 역할(통념→반박→정의→실험) 암기" },
      { range: "4과", tip: "definition / examples / origin 구분, delivered vs read 표현 숙지" },
      { range: "외부지문", tip: "원문+확장지문 2단 구성 — 확장지문에서 빈칸·어휘가 나옴" }
    ],
    mainTypes: ["요약문 완성", "순서 배열", "조건 영작", "언급되지 않은 것"]
  },

  /* ───── 전문항 해설 (시험지 양식) ─────
     마크업: [y:근거|①] 노랑형광  [b:근거|③] 파랑(부연설명 선지 전용)  [w:단어|뜻]  [x:배제키워드]
             [ko:우리말] [lab:(A)] [q:인용] [qb:인용] [skip] [blank:40] **굵게**  */
  items: [
    {
      no: "4", source: "교과서 3과", type: "요약문 완성", transform: "변형률 0%", stars: 4, pts: "4.5점",
      stem: "4. 다음 글의 내용을 요약하고자 한다. 빈칸에 들어갈 말로 가장 적절한 것은?",
      passage: "[y:Dark patterns not only [w:manipulate|조종하다·속이다] customers to act [w:against their intentions|의도와 반대로]|A], but they can also lead to financial losses and personal data leaks. [skip] However, regulations alone may not be [w:sufficient|충분한]. As individuals, we should take steps to [w:combat|맞서 싸우다] dark patterns. This includes [y:being [w:cautious|조심하는] while making purchases, reading terms and conditions carefully, and [w:recognizing|알아차리는] that companies' interests may not be the same as our own|B]. [skip] Ultimately, our attention and efforts [y:will protect us from [w:manipulation|조작·속임]|C] and enable us to make wise decisions in this digital age.",
      summary: "Dark patterns are [lab:(A)] online designs that cause financial damage, which has led governments to take steps to regulate them. However, since legal measures alone are not sufficient, consumers must stay [lab:(B)] and responsible when shopping online. Therefore, understanding these digital practices is necessary to protect ourselves from being [lab:(C)].",
      table: {
        heads: ["(A)", "(B)", "(C)"],
        rows: [
          { n: "①", cells: ["[x:complex]|복잡한", "[x:indifferent]|무관심한", "[x:distracted]|산만해진"] },
          { n: "②", cells: ["deceptive|속이는", "[x:independent]|독립적인", "[x:informed]|잘 아는"] },
          { n: "③", cells: ["[x:tricky]|까다로운", "alert|경계하는", "[x:persuaded]|설득된"] },
          { n: "④", cells: ["[x:complicated]|복잡한", "[x:flexible]|유연한", "manipulated|조종당한"] },
          { n: "⑤", cells: ["deceptive|속이는", "aware|깨어 있는", "tricked|속은"] }
        ],
        ev: [
          "**A** manipulate · against intentions → 속이는 = deceptive. complex · complicated · tricky는 '복잡·까다로움'이지 '속임'이 아님",
          "**B** cautious · recognizing → 깨어 있는 = aware(=alert). independent · flexible · indifferent는 본문에 없는 방향",
          "**C** protect from manipulation → 속는 것 = tricked(=manipulated). persuaded(설득)는 강도가 약함"
        ]
      },
      answer: "⑤",
      sol: { ans: "정답 ⑤ deceptive – aware – tricked", cm: "③(alert)·④(manipulated)가 한 칸씩 맞아 매력적. 세 칸 전부 맞는 조합은 ⑤뿐 — 두 칸 맞는 선지에서 멈추지 말고 셋째 칸까지 확인." }
    },
    {
      no: "7", source: "교과서 3과", type: "순서 배열", transform: "변형률 0%", stars: 3, pts: "4.3점",
      setLabel: "【7. 서·논술형 3】 다음 글을 읽고, 물음에 답하시오.",
      given: "A man [w:accidentally|우연히] drops a ten-dollar bill on the sidewalk. When he gets home, he realizes what happened, and he is very [w:upset|속상한]. A woman sees the ten-dollar bill on the sidewalk and picks it up. It's her lucky day!",
      passage: "(A) According to researcher Daniel Kahneman, [y:loss [w:aversion|회피·혐오] causes people to prefer avoiding losses to receiving gains|③].\n(B) [y:You might think|①] that the woman's feeling of happiness is equally as strong as the man's feeling of [w:disappointment|실망].\n(C) [y:However, a [w:cognitive bias|인지 편향] called \"loss aversion\" suggests that it isn't|②].\n(D) [y:Kahneman's study of loss aversion showed|④] that people value what they have more than what they may be able to get.\nHe conducted an experiment with a number of people that he divided into three groups. [skip] [w:Despite|~에도 불구하고] the potential for an improved situation or better gains, [ko:인간은 자신이 가지고 있는 것을 유지하고 손실이라는 불쾌한 감정을 회피하려는 명백한 선호도를 보여 준다].",
      stemAfter: true,
      stem: "7. 주어진 글 다음에 이어질 내용을 순서에 맞게 배열한 것으로 가장 적절한 것은?",
      choices: [
        { n: "①", text: "([x:A])-(B)-(C)-(D)", why: "(A)의 loss aversion은 (C)에서 따옴표로 처음 명명됨 → (A)가 (C)보다 앞설 수 없음" },
        { n: "②", text: "(B)-(A)-(C)-(D)", why: "답지 기준 정답. 인쇄된 순서대로면 (A) 정의가 (C) 명명보다 앞 — 논리상 순서는 ③. 실제 답지 확인 필요" },
        { n: "③", text: "(B)-(C)-(A)-(D)", why: "지문 번호 ①→②→③→④ 순 그대로: 통념 → However 반박·명명 → 정의 → 실험" },
        { n: "④", text: "([x:C])-(A)-(B)-(D)", why: "(C)의 However는 앞선 통념 (B)를 받아야 함 → 첫머리 불가" },
        { n: "⑤", text: "([x:C])-(B)-(A)-(D)", why: "같은 이유로 첫머리 불가. (B) 통념이 반박 뒤에 오면 흐름 역전" }
      ],
      answer: "②",
      sol: { ans: "정답 (B)→(C)→(A)→(D)", alt: "지문 번호 ①→④ 순", cm: "결정 근거는 **\"loss aversion\"의 첫 명명(따옴표)이 (C)**라는 점. 명명보다 정의 (A)가 먼저 올 수 없다." }
    },
    {
      no: "서3", source: "교과서 3과", type: "우리말 영작", transform: "변형률 0%", stars: 3, pts: "8점",
      stem: "[서·논술형 3] 우리말 해석을 참고하여 <조건>에 맞게 빈칸을 완성하시오.",
      passageRef: "※ 지문은 7번 참조 — 밑줄 친 우리말 부분을 영작",
      cond: [
        "주어진 표현을 활용할 것 — [y:preference for], [y:human beings]",
        "관계대명사 '[y:what]'을 활용할 것",
        "필요한 경우 단어 추가, 어형 변화 가능"
      ],
      answerLine: "[y:Human beings] show a clear [y:preference for] keeping [y:what] they have and avoiding the unpleasant feeling of loss",
      sol: { ans: "변형률 0%", alt: "우리말 밑줄 = 원문 문장 그대로, 원문 재현 영작", cm: "for 뒤 동명사 **keeping / avoiding** 병렬이 뼈대. what = the things that → keeping **what they have**. '손실이라는 불쾌한 감정' = the unpleasant feeling **of** loss(동격 of). 형광 세 곳이 조건 세 가지." }
    },
    {
      no: "8", source: "교과서 4과", type: "빈칸 추론", transform: "변형률 0%", stars: 4, pts: "4.3점",
      stem: "8. 빈칸에 들어갈 말로 가장 적절한 것은?",
      passage: "Yesterday afternoon, I sent her a message asking if she wanted to [w:hang out|놀다·어울리다] with me this weekend. I kept checking my phone because I really wanted to hear from her. [y:The message appeared in our chat, but she still hadn't opened it|①]. Later, I saw that she had posted a new photo on social media, so I knew she had been using her phone. However, [b:there was still no \"read\" sign|③] and no reply to my message. I felt [w:disappointed|실망한] because she [blank:40].",
      choices: [
        { n: "①", text: "left me on delivered", tr: "나를 '전송됨' 상태로 내버려 두었다", why: "[q:appeared in our chat, but she still hadn't opened it] — 도착했지만 안 열림 = delivered 상태" },
        { n: "②", text: "had a [x:crush] on me", tr: "나를 좋아했다", why: "그녀의 감정은 본문에 한 줄도 없음" },
        { n: "③", text: "left me on [x:read]", tr: "내 메시지를 읽고 답하지 않았다", focus: true, why: "'읽씹'은 read 표시가 떠야 성립 — 본문은 [qb:no \"read\" sign]. 폰을 쓰고 있었다는 문장은 '읽을 수 있었는데 안 읽었다'는 실망의 근거이지 읽었다는 뜻이 아님. **최대 함정**" },
        { n: "④", text: "[x:asked] me out", tr: "나에게 데이트를 신청했다", why: "신청한 쪽은 '나'(I sent her a message asking …) — 주체 뒤바뀜" },
        { n: "⑤", text: "[x:lead] me on", tr: "나에게 헛된 희망을 주다", why: "left/lead 철자 유사. 뜻도 다르고 시제도 틀림(lead → led)" }
      ],
      answer: "①",
      sol: { ans: "정답 ① left me on delivered", cm: "on delivered(전송됨에서 멈춤) vs on read(읽고 무시) — 본문의 **no \"read\" sign** 한 구절이 ③을 자른다." }
    },
    {
      no: "5", source: "교과서 4과", type: "언급되지 않은 것", transform: "변형률 6% (단어 변형)", stars: 3, pts: "4점",
      stem: "5. 다음을 읽고, stereotypes에 관해 언급되지 [u:않은] 것은?",
      passage: "A [w:stereotype|고정관념] is [y:a common idea about a group of people that is not always true|④]. People may say that [y:all Americans [w:constantly|끊임없이] eat cheeseburgers, all Koreans love kimchi, or that all French people wear scarves and [w:berets|베레모]|③]. [b:The word \"stereotype\" comes from an old machine that made printing quicker|⑤]. Now, it means an image or idea repeated without change. Stereotypes can be positive or negative. [skip] However, [y:even positive stereotypes can be [w:dangerous|위험한] because they make people believe something about an [w:entire|전체의] group that may not be true|①].",
      choices: [
        { n: "①", text: "[x:caution] with stereotypes", tr: "고정관념에 대한 주의", why: "[q:even positive stereotypes can be dangerous] — 긍정적이어도 위험 = 주의 → 언급됨" },
        { n: "②", text: "the cause of stereotypes", tr: "고정관념의 원인", why: "고정관념이 '왜 생기는지'는 본문 어디에도 없음 → 정답" },
        { n: "③", text: "[x:examples] of stereotypes", tr: "고정관념의 예", why: "[q:all Americans … all Koreans … all French people] — 사례 셋 → 언급됨" },
        { n: "④", text: "the [x:definition] of a stereotype", tr: "고정관념의 정의", why: "[q:A stereotype is a common idea … not always true] — 정의문 → 언급됨" },
        { n: "⑤", text: "the [x:origin] of the word stereotype", tr: "stereotype이라는 단어의 유래", focus: true, why: "[qb:comes from an old machine] — 낱말의 유래(origin) → 언급됨. 이걸 '원인'으로 읽으면 ②가 아닌 ⑤를 고름 — **origin(어원) ≠ cause(원인)**, 이 문항의 유일한 함정" }
      ],
      answer: "②",
      sol: { ans: "정답 ② the cause of stereotypes", cm: "'언급되지 않은 것'이므로 ✕는 '본문에 있어서 배제'. 넷은 형광 문장에 1:1 근거, 남는 하나가 ②." }
    }
    ,
    {
      no: "10", source: "교과서 3과", type: "보기 판단(개수)", transform: "변형률 2% (단어 변형)", stars: 4, pts: "3.3점",
      stem: "10. 다음 글에 대한 설명으로 [u:옳은] 것을 <보기>에서 있는 대로 고른 것의 개수는?",
      passage: "[y:The efforts of the Monuments Men did not end with the war|a]. For several years, they continued the work of recovering cultural treasures. [skip] In the end, the Monuments Men [y:returned more than five million works of art|b] to their places of origin. [skip] Without this determined group, the search for stolen works of art [b:might never have begun|d]. Thanks to their efforts, [y:many incredible cultural sites and works of art have survived|c].",
      bogi: [
        { t: "(a) The Monuments Men [x:stopped all the activities] they had undertaken as soon as the war ended.", v: "X", why: "[q:did not end with the war] — 전쟁 후에도 계속" },
        { t: "(b) Through continuous efforts, the Monuments Men succeeded in recovering the stolen works of art but [x:failed to return] any of them.", v: "X", why: "[q:returned more than five million works of art] — 돌려줌" },
        { t: "(c) Despite the Monuments Men's hard work, [x:all] the significant cultural sites and works of art have been lost.", v: "X", why: "[q:many … have survived] — 살아남음" },
        { t: "(d) (a) is grammatically incorrect whereas (b) is correct.", v: "X", why: "둘 다 문법상 정상 — 틀린 건 내용" },
        { t: "(e) (c) is grammatically inappropriate.", v: "O", why: "worth 뒤 동명사 remembering이어야 하므로 (c)는 틀린 문장 — 옳은 진술" }
      ],
      stemAfter: true,
      choices: [
        { n: "①", text: "없음", why: "(e)는 옳음" },
        { n: "②", text: "1개", why: "(e)만 옳음" },
        { n: "③", text: "2개", why: "(d)를 옳다고 본 경우 — [qb:might never have begun]도 begun이어야 해서 (d) 전제가 거짓", focus: true },
        { n: "④", text: "3개", why: "내용 보기 (a)~(c) 중 하나라도 맞다고 본 경우 — 셋 다 본문과 반대" },
        { n: "⑤", text: "4개", why: "성립 불가" }
      ],
      answer: "②",
      sol: { ans: "정답 ② 1개 (e)", cm: "개수 유형은 보기마다 ○✕ 판정이 곧 풀이. (d)는 앞 절은 참·뒤 절은 거짓인 반쪽 진술 — begun을 놓치면 2개로 오답." }
    },
    {
      no: "서4", source: "출처 미확인", type: "조건 영작", transform: "원문 미보유", stars: 3, pts: "6점",
      stem: "[서·논술형 4] 다음 우리말을 주어진 <조건>에 맞게 영작하시오.",
      cond: ["주어진 영어 단어를 반드시 모두 포함할 것", "우리말에 맞게 단어를 추가할 것", "필요시 어법에 맞게 변형할 것"],
      subs: [
        { label: "4-1.", stem: "그녀는 나에게 새 물건을 사기 전에 고객 리뷰를 확인하라고 조언하였다. (advise / check / customer review)", pts: "2점",
          answerLine: "She [y:advised] me to [y:check] [y:customer reviews] before buying a new product.", cm: "advise + 목적어 + **to부정사**. customer review(단수) 인정 여부는 학교 확인 요망." },
        { label: "4-2.", stem: "나는 나의 자전거를 지난주에 수리하였다. (get / fix)", pts: "2점",
          answerLine: "I [y:got] my bike [y:fixed] last week.", cm: "직접 고친 게 아니므로 사역 **get + 목적어 + p.p.**" },
        { label: "4-3.", stem: "Jay는 조금 더 조심했어야 했다. (more careful)", pts: "2점",
          answerLine: "Jay should have been [y:more careful].", cm: "과거에 대한 후회 **should have p.p.** — been 빠뜨리기 쉬움." }
      ],
      sol: { ans: "원문 미보유", alt: "정답 직접 풀이, 검토 필요", cm: "대화 구분 표기는 \\[A\\] 처럼 이스케이프하면 대괄호 그대로 출력. 여러 단어 배제는 [x:Do you like] 처럼 구간 전체에 ✕." }
    }
  ]
};
