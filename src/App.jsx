import { useState, useRef, useCallback } from "react";

// ─── 정답지 (기본값: 모두 1) ───
const ANSWER_KEYS = {
  헌법: "1111111111111111111111111",           // 25문제
  언어논리: "1111111111111111111111111111111111111111", // 40문제
  자료해석: "1111111111111111111111111111111111111111", // 40문제
  상황판단: "1111111111111111111111111111111111111111", // 40문제
};

const SUBJECT_META = {
  헌법: { count: 25, lines: 5, color: "#E8453C" },
  언어논리: { count: 40, lines: 8, color: "#2D7FF9" },
  자료해석: { count: 40, lines: 8, color: "#18BFFF" },
  상황판단: { count: 40, lines: 8, color: "#FF6F2C" },
};

const POINTS_PER_Q = 2.5;

function ScoreCircle({ score, max, color, label }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#1a1a2e" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease", transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        <text x="65" y="58" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="700" fontFamily="'JetBrains Mono', monospace">
          {score.toFixed(1)}
        </text>
        <text x="65" y="78" textAnchor="middle" fill="#666" fontSize="13" fontFamily="'JetBrains Mono', monospace">
          / {max}
        </text>
      </svg>
      <div style={{ color: color, fontWeight: 700, fontSize: 14, marginTop: 4, fontFamily: "'Pretendard', sans-serif" }}>{label}</div>
    </div>
  );
}

function SubjectInput({ name, meta, value, onChange }) {
  const textareaRef = useRef(null);
  const placeholder = Array.from({ length: meta.lines }, (_, i) => {
    const start = i * 5 + 1;
    const end = Math.min(start + 4, meta.count);
    return `${start}~${end}번`;
  }).join("\n");

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      const { selectionStart, selectionEnd } = ta;
      const newVal = value.substring(0, selectionStart) + "\n" + value.substring(selectionEnd);
      onChange(newVal);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 1;
      }, 0);
    }
  };

  const digitCount = (value.match(/[1-5]/g) || []).length;

  return (
    <div style={{
      background: "#0d0d1a",
      border: `1px solid ${meta.color}22`,
      borderRadius: 16,
      padding: "20px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${meta.color}, ${meta.color}44)`,
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: meta.color, fontWeight: 800, fontSize: 16, fontFamily: "'Pretendard', sans-serif" }}>
          {name}
        </span>
        <span style={{
          color: digitCount === meta.count ? "#4ade80" : "#666",
          fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600, transition: "color 0.3s",
        }}>
          {digitCount} / {meta.count}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={meta.lines}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        style={{
          width: "100%",
          background: "#08081a",
          border: "1px solid #222",
          borderRadius: 10,
          color: "#e0e0e0",
          fontSize: 22,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.35em",
          padding: "14px 16px",
          resize: "none",
          outline: "none",
          lineHeight: "2",
          boxSizing: "border-box",
        }}
      />
      <div style={{ color: "#444", fontSize: 11, marginTop: 6, fontFamily: "'Pretendard', sans-serif" }}>
        한 줄에 5개씩 · 1~5 숫자만 · Tab 또는 Enter로 줄바꿈
      </div>
    </div>
  );
}

function ResultDetail({ name, meta, userAnswers, answerKey }) {
  const items = [];
  for (let i = 0; i < answerKey.length; i++) {
    const correct = answerKey[i];
    const user = userAnswers[i] || "?";
    const isCorrect = user === correct;
    items.push({ num: i + 1, user, correct, isCorrect });
  }
  const wrongItems = items.filter((x) => !x.isCorrect);

  return (
    <div style={{
      background: "#0d0d1a", borderRadius: 16, padding: "20px 24px",
      border: `1px solid ${meta.color}22`,
    }}>
      <div style={{ color: meta.color, fontWeight: 800, fontSize: 15, marginBottom: 14, fontFamily: "'Pretendard', sans-serif" }}>
        {name} — 오답 {wrongItems.length}개
      </div>
      {wrongItems.length === 0 ? (
        <div style={{ color: "#4ade80", fontSize: 14, fontFamily: "'Pretendard', sans-serif" }}>전문항 정답 🎉</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {wrongItems.map((w) => (
            <div key={w.num} style={{
              background: "#1a1a2e", borderRadius: 8, padding: "6px 12px",
              fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
              border: "1px solid #2a2a3e",
            }}>
              <span style={{ color: "#888" }}>#{w.num}</span>
              <span style={{ color: "#ff6b6b", margin: "0 4px" }}>{w.user}</span>
              <span style={{ color: "#444" }}>→</span>
              <span style={{ color: "#4ade80", marginLeft: 4 }}>{w.correct}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [inputs, setInputs] = useState({ 헌법: "", 언어논리: "", 자료해석: "", 상황판단: "" });
  const [results, setResults] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const updateInput = useCallback((name, val) => {
    setInputs((prev) => ({ ...prev, [name]: val }));
  }, []);

  const parseAnswers = (raw) => raw.replace(/[^1-5]/g, "");

  const handleScore = () => {
    const scores = {};
    const parsed = {};

    for (const [name, meta] of Object.entries(SUBJECT_META)) {
      const userStr = parseAnswers(inputs[name]);
      const keyStr = ANSWER_KEYS[name];
      parsed[name] = userStr;

      let correct = 0;
      for (let i = 0; i < keyStr.length; i++) {
        if (userStr[i] === keyStr[i]) correct++;
      }
      scores[name] = {
        correct,
        total: meta.count,
        score: correct * POINTS_PER_Q,
        max: meta.count * POINTS_PER_Q,
      };
    }

    const allScores = Object.values(scores);
    const avg = allScores.reduce((s, x) => s + x.score, 0) / allScores.length;

    setResults({ scores, parsed, avg });
    setShowDetail(false);
  };

  const handleReset = () => {
    setInputs({ 헌법: "", 언어논리: "", 자료해석: "", 상황판단: "" });
    setResults(null);
    setShowDetail(false);
  };

  const allFilled = Object.entries(SUBJECT_META).every(
    ([name, meta]) => parseAnswers(inputs[name]).length === meta.count
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07071a",
      color: "#e0e0e0",
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, color: "#666", letterSpacing: 4, fontWeight: 600, marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            PSAT 채점기
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, margin: 0,
            background: "linear-gradient(135deg, #E8453C, #2D7FF9, #18BFFF, #FF6F2C)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontFamily: "'Noto Sans KR', sans-serif",
          }}>
            5급 PSAT 채점
          </h1>
          <p style={{ color: "#555", fontSize: 14, marginTop: 8 }}>
            한 줄에 5개씩 답을 입력하세요
          </p>
        </div>

        {!results ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {Object.entries(SUBJECT_META).map(([name, meta]) => (
                <SubjectInput
                  key={name}
                  name={name}
                  meta={meta}
                  value={inputs[name]}
                  onChange={(v) => updateInput(name, v)}
                />
              ))}
            </div>

            <button
              onClick={handleScore}
              disabled={!allFilled}
              style={{
                width: "100%", marginTop: 28, padding: "16px 0",
                background: allFilled
                  ? "linear-gradient(135deg, #E8453C, #FF6F2C)"
                  : "#1a1a2e",
                color: allFilled ? "#fff" : "#444",
                border: "none", borderRadius: 14, fontSize: 17, fontWeight: 800,
                cursor: allFilled ? "pointer" : "not-allowed",
                fontFamily: "'Pretendard', sans-serif",
                transition: "all 0.3s",
                letterSpacing: 2,
              }}
            >
              채점하기
            </button>
          </>
        ) : (
          <>
            {/* Average */}
            <div style={{
              textAlign: "center", marginBottom: 32, padding: "28px 0",
              background: "linear-gradient(135deg, #0d0d2a, #0d1a2e)",
              borderRadius: 20, border: "1px solid #1a1a3e",
            }}>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 3, marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                AVERAGE
              </div>
              <div style={{
                fontSize: 56, fontWeight: 900, fontFamily: "'JetBrains Mono', monospace",
                background: "linear-gradient(135deg, #4ade80, #2D7FF9)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {results.avg.toFixed(2)}
              </div>
              <div style={{ color: "#666", fontSize: 13 }}>4과목 평균</div>
            </div>

            {/* Score circles */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24,
            }}>
              {Object.entries(SUBJECT_META).map(([name, meta]) => (
                <ScoreCircle
                  key={name}
                  score={results.scores[name].score}
                  max={results.scores[name].max}
                  color={meta.color}
                  label={name}
                />
              ))}
            </div>

            {/* Score table */}
            <div style={{
              background: "#0d0d1a", borderRadius: 16, overflow: "hidden",
              border: "1px solid #1a1a3e", marginBottom: 20,
            }}>
              {Object.entries(SUBJECT_META).map(([name, meta], i) => {
                const r = results.scores[name];
                return (
                  <div key={name} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 20px",
                    borderBottom: i < 3 ? "1px solid #111" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 4, height: 24, borderRadius: 2, background: meta.color }} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
                      <span style={{ color: "#4ade80", fontWeight: 700 }}>{r.correct}</span>
                      <span style={{ color: "#444" }}>/{r.total}</span>
                      <span style={{ color: "#888", marginLeft: 12 }}>{r.score.toFixed(1)}점</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail toggle */}
            <button
              onClick={() => setShowDetail(!showDetail)}
              style={{
                width: "100%", padding: "14px 0",
                background: "transparent",
                color: "#2D7FF9", border: "1px solid #2D7FF922",
                borderRadius: 12, fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Pretendard', sans-serif",
                marginBottom: 16,
              }}
            >
              {showDetail ? "오답 숨기기 ▲" : "오답 확인하기 ▼"}
            </button>

            {showDetail && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {Object.entries(SUBJECT_META).map(([name, meta]) => (
                  <ResultDetail
                    key={name}
                    name={name}
                    meta={meta}
                    userAnswers={results.parsed[name]}
                    answerKey={ANSWER_KEYS[name]}
                  />
                ))}
              </div>
            )}

            {/* Reset */}
            <button
              onClick={handleReset}
              style={{
                width: "100%", marginTop: 20, padding: "16px 0",
                background: "linear-gradient(135deg, #1a1a2e, #0d0d2a)",
                color: "#888", border: "1px solid #1a1a3e",
                borderRadius: 14, fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Pretendard', sans-serif",
              }}
            >
              다시 채점하기
            </button>
          </>
        )}

        <div style={{ textAlign: "center", marginTop: 48, color: "#333", fontSize: 11 }}>
          한 문제당 2.5점 · 정답 미확정 시 임시정답 적용
        </div>
      </div>
    </div>
  );
}
