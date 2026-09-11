import { useState } from "react";
import "./App.css";

function App() {
  const [track, setTrack] = useState("");

  const handleStart = () => {
    if (!track) {
      alert("Please select a track first");
      return;
    }

    alert(`Starting ${track.toUpperCase()} interview`);
  };

  return (
    <div className="app">
      <div className="container">

        <div className="robot">🤖</div>

        <h1>AI MOCK INTERVIEWER</h1>

        <p className="tagline">
          Practice technical interviews
        </p>

        <p className="description">
          Get instant AI-powered feedback
        </p>

        <h2>Choose your track</h2>

        <div className="tracks">

          <div
            className={`track ${track === "dsa" ? "active" : ""}`}
            onClick={() => setTrack("dsa")}
          >
            <div className="icon">⚡</div>
            <h3>DSA</h3>
            <p>Algorithms</p>
          </div>

          <div
            className={`track ${track === "backend" ? "active" : ""}`}
            onClick={() => setTrack("backend")}
          >
            <div className="icon">⚙️</div>
            <h3>BACKEND</h3>
            <p>Development</p>
          </div>

        </div>

        <button className="start-btn" onClick={handleStart}>
          Start Interview →
        </button>

      </div>
    </div>
  );
}

export default App;