import React, { useState, useEffect, useRef } from "react";
import { Check, ArrowRight, Loader2, AlertTriangle, RotateCcw, X } from "lucide-react";

/* ------------------------------------------------------------------------
   MOCK API LAYER
   Mirrors the contract in the spec (A3, A5). Swap the bodies of these two
   functions for real fetch()/axios calls to POST /interview/start and
   POST /interview/answer — every caller downstream stays the same.
------------------------------------------------------------------------- */

const QUESTION_BANKS = {
  dsa: [
    { topic: "Graph Traversal", q: "Explain the difference between BFS and DFS. When would you reach for one over the other?" },
    { topic: "Linked Lists", q: "How would you detect a cycle in a linked list?" },
    { topic: "Sorting", q: "What's the time complexity of quicksort in the average and worst case, and why do they differ?" },
    { topic: "Selection Algorithms", q: "How would you find the kth largest element in an unsorted array?" },
    { topic: "Hashing", q: "Explain how a hash map handles collisions." },
  ],
  backend: [
    { topic: "REST Design", q: "Walk me through what happens when a client sends a REST API request to a server." },
    { topic: "Rate Limiting", q: "How would you design a rate limiter for an API?" },
    { topic: "Databases", q: "What's the difference between SQL and NoSQL databases, and when would you choose one over the other?" },
    { topic: "Auth", q: "How do you handle authentication and authorization in a web application?" },
    { topic: "Distributed Systems", q: "Explain the CAP theorem and how it applies to distributed systems." },
  ],
};

const FOLLOW_UPS = {
  0: "Why does that approach cost what it costs — walk through the complexity.",
  2: "What would you change if the input was already mostly sorted?",
};

const APPROACH_NOTES = [
  "You picked a workable approach, but the trade-offs weren't spelled out.",
  "Solid choice of approach — reasoning was easy to follow end to end.",
  "The approach works, but there's a simpler one worth knowing for this pattern.",
  "Good instinct on the approach; a note on edge cases would round it out.",
];
const COMMS_NOTES = [
  "Understandable, but could be more structured — try stating the plan before diving in.",
  "Clear and well-paced. This is close to how you'd want to sound in the room.",
  "You got to the right place, but talked in circles a bit getting there.",
  "Confident delivery. Naming the data structure up front would make it sharper.",
];

function rand(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function delay(ms) { return new Promise((res) => setTimeout(res, ms)); }

const mockInterviewApi = {
  async startInterview(track) {
    await delay(700);
    const bank = QUESTION_BANKS[track];
    return {
      session_id: "sess_" + Math.random().toString(36).slice(2, 9),
      question: bank[0].q,
      question_number: 1,
    };
  },

  async submitAnswer({ track, questionIndex, isFollowUp, askedFollowUpAlready }) {
    await delay(900);
    const bank = QUESTION_BANKS[track];
    const correctness = rand(3, 5);
    const approach = rand(3, 5);
    const communication = rand(3, 5);

    const feedback = {
      correctness,
      approach_score: approach,
      communication_score: communication,
      approach_feedback: pick(APPROACH_NOTES),
      communication_feedback: pick(COMMS_NOTES),
      topic: bank[questionIndex].topic,
    };

    const hasFollowUp = !isFollowUp && FOLLOW_UPS[questionIndex] && !askedFollowUpAlready;

    if (hasFollowUp) {
      return { ...feedback, follow_up_question: FOLLOW_UPS[questionIndex], next_question: null, done: false };
    }

    const nextIndex = questionIndex + 1;
    if (nextIndex >= bank.length) {
      return { ...feedback, follow_up_question: null, next_question: null, done: true };
    }
    return {
      ...feedback,
      follow_up_question: null,
      next_question: bank[nextIndex].q,
      question_number: nextIndex + 1,
      done: false,
    };
  },
};

/* ------------------------------------------------------------------------
   SMALL PRESENTATIONAL PIECES
------------------------------------------------------------------------- */

function ScoreBar({ value, max = 5 }) {
  const segments = Array.from({ length: max });
  return (
    <div className="score-bar" aria-label={`${value} out of ${max}`}>
      {segments.map((_, i) => (
        <span key={i} className={`seg ${i < Math.round(value) ? "filled" : ""}`} />
      ))}
    </div>
  );
}

function StepTrack({ total, current, done }) {
  return (
    <div className="step-track" role="progressbar" aria-valuenow={current} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const state = done ? "done" : n < current ? "done" : n === current ? "current" : "todo";
        return (
          <React.Fragment key={n}>
            <div className={`step-dot ${state}`}>
              {state === "done" ? <Check size={12} strokeWidth={3} /> : n}
            </div>
            {n < total && <div className={`step-line ${n < current || done ? "done" : ""}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------------
   SCREENS
------------------------------------------------------------------------- */

function Landing({ onStart, starting }) {
  const [track, setTrack] = useState(null);
  return (
    <div className="screen landing">
      <div className="landing-inner">
        <p className="eyebrow-plain">Mock interview practice</p>
        <h1>Practice the interview before it counts.</h1>
        <p className="lede">
          Answer real technical questions out loud, then get feedback on what you got
          right, what you glossed over, and how you explained it — not just a score.
        </p>

        <div className="track-picker">
          <button
            className={`track-card ${track === "dsa" ? "active" : ""}`}
            onClick={() => setTrack("dsa")}
          >
            <span className="track-name">DSA</span>
            <span className="track-desc">Algorithms &amp; data structures</span>
          </button>
          <button
            className={`track-card ${track === "backend" ? "active" : ""}`}
            onClick={() => setTrack("backend")}
          >
            <span className="track-name">Backend</span>
            <span className="track-desc">Systems &amp; API design</span>
          </button>
        </div>

        <button
          className="btn-primary btn-large"
          disabled={!track || starting}
          onClick={() => onStart(track)}
        >
          {starting ? (
            <>
              <Loader2 size={16} className="spin" /> Starting interview…
            </>
          ) : (
            <>
              Start interview <ArrowRight size={16} />
            </>
          )}
        </button>
        <p className="hint">Five questions. Answer in your own words — this isn't multiple choice.</p>
      </div>
    </div>
  );
}

function ChatBubble({ from, children }) {
  return (
    <div className={`bubble-row ${from}`}>
      <div className="bubble-tag">{from === "ai" ? "AI" : "You"}</div>
      <div className="bubble-body">{children}</div>
    </div>
  );
}

function InterviewScreen({
  track, questionIndex, questionText, isFollowUp,
  answer, setAnswer, onSubmit, submitting, transcriptPreview,
}) {
  const areaRef = useRef(null);
  useEffect(() => { areaRef.current?.focus(); }, [questionText]);

  return (
    <div className="screen interview">
      <div className="interview-head">
        <StepTrack total={5} current={questionIndex + 1} />
        <span className="qcount">Question {questionIndex + 1} / 5</span>
      </div>

      <div className="chat-log">
        {transcriptPreview.map((t, i) => (
          <React.Fragment key={i}>
            <ChatBubble from="ai">{t.question}</ChatBubble>
            <ChatBubble from="user">{t.answer}</ChatBubble>
          </React.Fragment>
        ))}
        <ChatBubble from="ai">
          {isFollowUp && <span className="followup-tag">Follow-up</span>}
          {questionText}
        </ChatBubble>
      </div>

      <div className="answer-dock">
        <textarea
          ref={areaRef}
          className="answer-box"
          placeholder="Type your answer…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
        />
        <button
          className="btn-primary"
          disabled={!answer.trim() || submitting}
          onClick={onSubmit}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="spin" /> Evaluating…
            </>
          ) : (
            "Submit answer"
          )}
        </button>
      </div>
    </div>
  );
}

function FeedbackCard({ feedback, onContinue, isFinal }) {
  return (
    <div className="screen feedback">
      <div className="feedback-card">
        <div className="feedback-head">
          <span className="feedback-topic">{feedback.topic}</span>
          <h2>Feedback</h2>
        </div>

        <div className="feedback-row">
          <div className="feedback-label">Correctness</div>
          <div className="feedback-value-row">
            <ScoreBar value={feedback.correctness} />
            <span className="feedback-num">{feedback.correctness.toFixed(1)}/5</span>
          </div>
        </div>

        <div className="feedback-row">
          <div className="feedback-label">Approach</div>
          <p className="feedback-text">{feedback.approach_feedback}</p>
        </div>

        <div className="feedback-row">
          <div className="feedback-label">Communication</div>
          <p className="feedback-text">{feedback.communication_feedback}</p>
        </div>

        {feedback.follow_up_question && (
          <div className="feedback-row followup-row">
            <div className="feedback-label">Follow-up question</div>
            <p className="feedback-text">{feedback.follow_up_question}</p>
          </div>
        )}

        <button className="btn-primary btn-full" onClick={onContinue}>
          {feedback.follow_up_question ? "Answer follow-up" : isFinal ? "See results" : "Continue"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ResultsScreen({ transcript, track, onRestart }) {
  const [showTranscript, setShowTranscript] = useState(false);

  const avg = (key) => transcript.reduce((s, t) => s + t.feedback[key], 0) / transcript.length;
  const correctness = avg("correctness");
  const approach = avg("approach_score");
  const communication = avg("communication_score");
  const overall = Math.round(((correctness + approach + communication) / 15) * 100);

  const weak = [...transcript]
    .sort((a, b) => a.feedback.correctness - b.feedback.correctness)
    .slice(0, 2)
    .map((t) => t.feedback.topic);

  return (
    <div className="screen results">
      <div className="results-card">
        <p className="eyebrow-plain">{track === "dsa" ? "DSA interview" : "Backend interview"} complete</p>

        <div className="score-hero">
          <span className="score-number">{overall}%</span>
          <span className="score-caption">overall score</span>
        </div>

        <div className="cat-list">
          <div className="cat-row">
            <span>Correctness</span>
            <ScoreBar value={correctness} />
            <span className="feedback-num">{correctness.toFixed(1)}/5</span>
          </div>
          <div className="cat-row">
            <span>Approach</span>
            <ScoreBar value={approach} />
            <span className="feedback-num">{approach.toFixed(1)}/5</span>
          </div>
          <div className="cat-row">
            <span>Communication</span>
            <ScoreBar value={communication} />
            <span className="feedback-num">{communication.toFixed(1)}/5</span>
          </div>
        </div>

        <div className="weak-areas">
          <div className="feedback-label">Weak areas</div>
          {weak.map((w) => (
            <div className="weak-item" key={w}>
              <AlertTriangle size={13} strokeWidth={2} /> {w}
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button className="btn-secondary" onClick={() => setShowTranscript((s) => !s)}>
            {showTranscript ? "Hide transcript" : "View transcript"}
          </button>
          <button className="btn-primary" onClick={onRestart}>
            <RotateCcw size={15} /> New interview
          </button>
        </div>

        {showTranscript && (
          <div className="transcript">
            {transcript.map((t, i) => (
              <div className="transcript-item" key={i}>
                <div className="transcript-q"><span className="bubble-tag">AI</span>{t.question}</div>
                <div className="transcript-a"><span className="bubble-tag">You</span>{t.answer}</div>
                <div className="transcript-f">
                  <ScoreBar value={t.feedback.correctness} />
                  <span className="feedback-num">{t.feedback.correctness.toFixed(1)}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------
   APP — screen/state machine
------------------------------------------------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | interview | feedback | results
  const [track, setTrack] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionText, setQuestionText] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [askedFollowUpAlready, setAskedFollowUpAlready] = useState(false);
  const [answer, setAnswer] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [transcriptPreview, setTranscriptPreview] = useState([]);
  const [isFinalFeedback, setIsFinalFeedback] = useState(false);

  async function handleStart(chosenTrack) {
    setStarting(true);
    const res = await mockInterviewApi.startInterview(chosenTrack);
    setTrack(chosenTrack);
    setSessionId(res.session_id);
    setQuestionText(res.question);
    setQuestionIndex(0);
    setIsFollowUp(false);
    setAskedFollowUpAlready(false);
    setTranscript([]);
    setTranscriptPreview([]);
    setStarting(false);
    setScreen("interview");
  }

  async function handleSubmit() {
    setSubmitting(true);
    const res = await mockInterviewApi.submitAnswer({
      track, questionIndex, isFollowUp, askedFollowUpAlready,
    });

    setTranscript((t) => [...t, { question: questionText, answer, feedback: res }]);
    setTranscriptPreview((t) => [...t, { question: questionText, answer }]);
    setFeedback(res);
    setIsFinalFeedback(!!res.done);
    setSubmitting(false);
    setScreen("feedback");
  }

  function handleContinue() {
    if (feedback.follow_up_question) {
      setQuestionText(feedback.follow_up_question);
      setIsFollowUp(true);
      setAskedFollowUpAlready(true);
      setAnswer("");
      setScreen("interview");
      return;
    }
    if (feedback.done) {
      setScreen("results");
      return;
    }
    setQuestionText(feedback.next_question);
    setQuestionIndex((i) => i + 1);
    setIsFollowUp(false);
    setAskedFollowUpAlready(false);
    setAnswer("");
    setScreen("interview");
  }

  function handleRestart() {
    setScreen("landing");
    setTrack(null);
    setSessionId(null);
    setTranscript([]);
    setTranscriptPreview([]);
    setAnswer("");
    setFeedback(null);
  }

  return (
    <div className="aimi-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

        .aimi-app {
          --bg: #F2F3EF;
          --paper: #FFFFFF;
          --ink: #1C2321;
          --ink-soft: #5B625E;
          --line: #D7D9D1;
          --line-strong: #1C2321;
          --blue: #2451C4;
          --blue-dark: #1B3D99;
          --green: #21785A;
          --rust: #B23A2E;

          font-family: 'IBM Plex Sans', sans-serif;
          color: var(--ink);
          background: var(--bg);
          background-image:
            linear-gradient(var(--line) 1px, transparent 1px),
            linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size: 28px 28px;
          background-position: -1px -1px;
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 40px 20px 64px;
          display: flex;
          justify-content: center;
        }
        .aimi-app *, .aimi-app *::before, .aimi-app *::after { box-sizing: border-box; }
        .aimi-app :focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }

        .screen { width: 100%; max-width: 640px; }

        .eyebrow-plain {
          font-size: 13px; color: var(--ink-soft); margin: 0 0 10px; font-weight: 500;
        }

        /* ---------- Landing ---------- */
        .landing-inner { padding-top: 6vh; }
        .landing h1 {
          font-size: clamp(2rem, 4.6vw, 2.9rem);
          font-weight: 600;
          line-height: 1.12;
          letter-spacing: -0.01em;
          margin: 0 0 18px;
          max-width: 11ch;
        }
        .lede {
          font-size: 16.5px; line-height: 1.6; color: var(--ink-soft);
          max-width: 46ch; margin: 0 0 36px;
        }
        .track-picker { display: flex; gap: 14px; margin-bottom: 28px; }
        .track-card {
          flex: 1; text-align: left; background: var(--paper);
          border: 1px solid var(--line-strong);
          box-shadow: 3px 3px 0 var(--line);
          padding: 18px 18px 16px; cursor: pointer;
          display: flex; flex-direction: column; gap: 4px;
          font-family: inherit; transition: transform 90ms ease, box-shadow 90ms ease;
        }
        .track-card:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--line); }
        .track-card.active {
          border-color: var(--blue); box-shadow: 3px 3px 0 var(--blue);
          background: #EEF2FC;
        }
        .track-name { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 15px; }
        .track-desc { font-size: 13px; color: var(--ink-soft); }

        .hint { font-size: 13px; color: var(--ink-soft); margin-top: 12px; }

        /* ---------- Buttons ---------- */
        .btn-primary, .btn-secondary {
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 600; font-size: 14.5px;
          border: 1px solid var(--line-strong);
          padding: 12px 18px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; transition: transform 90ms ease, opacity 90ms ease;
        }
        .btn-primary { background: var(--blue); border-color: var(--blue); color: #fff; }
        .btn-primary:hover:not(:disabled) { background: var(--blue-dark); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-secondary { background: transparent; color: var(--ink); }
        .btn-secondary:hover { background: var(--paper); }
        .btn-large { padding: 14px 22px; font-size: 15px; }
        .btn-full { width: 100%; margin-top: 20px; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ---------- Step track ---------- */
        .step-track { display: flex; align-items: center; gap: 4px; }
        .step-dot {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600;
          border: 1.5px solid var(--line-strong); background: var(--paper); color: var(--ink-soft);
          flex-shrink: 0;
        }
        .step-dot.current { background: var(--blue); border-color: var(--blue); color: #fff; }
        .step-dot.done { background: var(--green); border-color: var(--green); color: #fff; }
        .step-line { width: 18px; height: 1.5px; background: var(--line); }
        .step-line.done { background: var(--green); }

        /* ---------- Interview screen ---------- */
        .interview-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 22px;
        }
        .qcount { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--ink-soft); }

        .chat-log { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }
        .bubble-row { display: flex; gap: 12px; align-items: flex-start; }
        .bubble-row.user { flex-direction: row-reverse; text-align: right; }
        .bubble-tag {
          flex-shrink: 0; width: 26px; height: 26px;
          border: 1.5px solid var(--line-strong); background: var(--paper);
          display: flex; align-items: center; justify-content: center;
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700;
        }
        .bubble-row.ai .bubble-tag { background: var(--ink); color: var(--bg); border-color: var(--ink); }
        .bubble-body {
          font-family: 'IBM Plex Mono', monospace; font-size: 14.5px; line-height: 1.55;
          background: var(--paper); border: 1px solid var(--line); padding: 12px 14px;
          max-width: 78%;
        }
        .bubble-row.user .bubble-body { background: #EEF2FC; border-color: #C7D3F2; }
        .followup-tag {
          display: block; font-family: 'IBM Plex Sans', sans-serif; font-weight: 600;
          font-size: 11px; color: var(--blue); margin-bottom: 4px;
        }

        .answer-dock {
          background: var(--paper); border: 1px solid var(--line-strong);
          box-shadow: 3px 3px 0 var(--line); padding: 14px;
        }
        .answer-box {
          width: 100%; border: none; resize: vertical; font-family: 'IBM Plex Mono', monospace;
          font-size: 14.5px; line-height: 1.55; padding: 8px 6px 14px; background: transparent;
          color: var(--ink);
        }
        .answer-box:focus { outline: none; }
        .answer-dock .btn-primary { float: right; }

        /* ---------- Feedback card ---------- */
        .feedback { display: flex; justify-content: center; padding-top: 4vh; }
        .feedback-card {
          width: 100%; background: var(--paper); border: 1px solid var(--line-strong);
          box-shadow: 5px 5px 0 var(--blue); padding: 30px 30px 26px;
        }
        .feedback-topic {
          font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--ink-soft);
        }
        .feedback-head h2 { margin: 2px 0 22px; font-size: 22px; font-weight: 600; }
        .feedback-row { margin-bottom: 20px; }
        .feedback-label {
          font-size: 12.5px; font-weight: 600; color: var(--ink-soft); margin-bottom: 8px;
        }
        .feedback-value-row { display: flex; align-items: center; gap: 10px; }
        .feedback-text { font-size: 15px; line-height: 1.55; margin: 0; max-width: 54ch; }
        .feedback-num { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--ink-soft); }
        .followup-row .feedback-text { color: var(--blue-dark); font-weight: 500; }

        .score-bar { display: flex; gap: 4px; }
        .score-bar .seg { width: 22px; height: 10px; border: 1.5px solid var(--line-strong); background: transparent; }
        .score-bar .seg.filled { background: var(--blue); border-color: var(--blue); }

        /* ---------- Results ---------- */
        .results { display: flex; justify-content: center; padding-top: 3vh; }
        .results-card {
          width: 100%; background: var(--paper); border: 1px solid var(--line-strong);
          box-shadow: 5px 5px 0 var(--line); padding: 32px 32px 28px;
        }
        .score-hero {
          display: flex; align-items: baseline; gap: 12px;
          border: 1.5px solid var(--line-strong); padding: 20px 22px; margin: 4px 0 26px;
        }
        .score-number {
          font-family: 'IBM Plex Mono', monospace; font-weight: 700; font-size: 48px;
          line-height: 1; letter-spacing: -0.02em;
        }
        .score-caption { font-size: 14px; color: var(--ink-soft); }

        .cat-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 26px; }
        .cat-row { display: grid; grid-template-columns: 110px 1fr 44px; align-items: center; gap: 12px; font-size: 14px; }

        .weak-areas { margin-bottom: 26px; }
        .weak-item {
          display: flex; align-items: center; gap: 8px; font-size: 14.5px;
          color: var(--rust); margin-top: 6px; font-weight: 500;
        }

        .results-actions { display: flex; gap: 12px; }
        .results-actions .btn-secondary, .results-actions .btn-primary { flex: 1; }

        .transcript { margin-top: 24px; border-top: 1px solid var(--line); padding-top: 20px; display: flex; flex-direction: column; gap: 18px; }
        .transcript-item { border-left: 2px solid var(--line); padding-left: 14px; }
        .transcript-q, .transcript-a { display: flex; gap: 8px; font-size: 13.5px; margin-bottom: 6px; align-items: flex-start; }
        .transcript-q .bubble-tag, .transcript-a .bubble-tag { width: 20px; height: 20px; font-size: 9px; }
        .transcript-f { display: flex; align-items: center; gap: 8px; margin-top: 6px; }

        @media (max-width: 520px) {
          .track-picker { flex-direction: column; }
          .cat-row { grid-template-columns: 92px 1fr 40px; font-size: 13px; }
          .feedback-card, .results-card { padding: 22px 18px; }
        }
      `}</style>

      {screen === "landing" && <Landing onStart={handleStart} starting={starting} />}

      {screen === "interview" && (
        <InterviewScreen
          track={track}
          questionIndex={questionIndex}
          questionText={questionText}
          isFollowUp={isFollowUp}
          answer={answer}
          setAnswer={setAnswer}
          onSubmit={handleSubmit}
          submitting={submitting}
          transcriptPreview={transcriptPreview}
        />
      )}

      {screen === "feedback" && feedback && (
        <FeedbackCard feedback={feedback} onContinue={handleContinue} isFinal={isFinalFeedback} />
      )}

      {screen === "results" && (
        <ResultsScreen transcript={transcript} track={track} onRestart={handleRestart} />
      )}
    </div>
  );
}
