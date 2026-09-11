# AI Mock Interviewer

An AI-powered mock interview platform that simulates technical interviews and provides instant, structured feedback on a candidate's responses.

## 🚀 Overview

AI Mock Interviewer conducts technical mock interviews using an LLM-powered interviewer. The system evaluates each response across multiple dimensions and dynamically decides whether to:

* Move to the next main question
* Ask a follow-up question to probe the candidate's understanding
* Provide detailed feedback on the response

The platform supports different technical interview tracks such as **DSA, Backend, and Machine Learning**.

## ✨ Features

* AI-powered technical mock interviews
* Multiple interview tracks
* Dynamic follow-up questions
* Response evaluation using an LLM
* Correctness scoring on a 1–5 scale
* Approach/solution feedback
* Communication feedback
* Overall interview score
* Average scores across evaluation dimensions
* Weak-area identification
* Complete interview transcript
* Session-based interview state management

## 🧠 How It Works

```text
User
  ↓
Select Interview Track
  ↓
Start Interview
  ↓
Backend creates interview session
  ↓
AI asks technical question
  ↓
User submits answer
  ↓
Backend sends question + answer to LLM
  ↓
LLM evaluates the response
  ↓
┌─────────────────────────────┐
│ Correctness                 │
│ Approach / Reasoning        │
│ Communication               │
└─────────────────────────────┘
  ↓
Decision
  ├── Strong response → Next main question
  └── Weak / incomplete → Follow-up question
  ↓
Continue Interview
  ↓
Generate Final Summary
```

## 🏗️ Architecture

```text
┌──────────────┐
│   Frontend   │
│ React / Web  │
└──────┬───────┘
       │ HTTP API
       ↓
┌──────────────┐
│   Backend    │
│   FastAPI    │
└──────┬───────┘
       │
       ├──────────────→ Session Store
       │
       ↓
┌──────────────┐
│   LLM API    │
│ AI Evaluation│
└──────────────┘
```

## 📊 Evaluation

Each candidate response is evaluated on:

| Metric        | Description                                       |
| ------------- | ------------------------------------------------- |
| Correctness   | How technically correct the answer is             |
| Approach      | Quality of reasoning and problem-solving approach |
| Communication | Clarity and effectiveness of the explanation      |

Correctness is scored from **1 to 5**:

* **1** — Fundamentally incorrect
* **2** — Major gaps or misconceptions
* **3** — Partially correct
* **4** — Mostly correct with minor gaps
* **5** — Correct, clear, and technically strong

## 🔄 Dynamic Follow-Up System

The interviewer does not simply follow a fixed list of questions.

After evaluating an answer, the AI determines whether the candidate has demonstrated sufficient understanding.

For example:

```text
Main Question
     ↓
Candidate Answer
     ↓
AI Evaluation
     ↓
Correctness >= Threshold?
     │
   ┌─┴─┐
  Yes  No
   │    │
   ↓    ↓
Next   Follow-up
Question Question
```

This allows the interview to adapt to the candidate's responses.

## 🔌 API Endpoints

### Start Interview

```http
POST /interview/start
```

Request:

```json
{
  "track": "dsa"
}
```

Response:

```json
{
  "session_id": "abc123",
  "question": "What is the time complexity of binary search?",
  "question_number": 1
}
```

### Submit Answer

```http
POST /interview/answer
```

Request:

```json
{
  "session_id": "abc123",
  "answer": "Binary search takes O(log n) time..."
}
```

Response:

```json
{
  "correctness": 5,
  "approach_feedback": "The complexity was correctly identified and explained.",
  "communication_feedback": "The response was concise and clear.",
  "follow_up_question": null,
  "next_question": "Explain how binary search works on a sorted array.",
  "question_number": 2
}
```

### Get Interview Summary

```http
GET /interview/summary?session_id=abc123
```

Returns:

* Overall score
* Correctness average
* Approach average
* Communication average
* Weak areas
* Interview transcript

## 🛠️ Tech Stack

### Frontend

* React
* HTML/CSS/JavaScript

### Backend

* Python
* FastAPI

### AI

* Large Language Model API
* Structured JSON output

### Storage

* In-memory session management
* SQLite (optional)

## 📁 Project Structure

```text
ai-mock-interviewer/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── api/
│   │   └── styles/
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── session_manager.py
│   ├── question_manager.py
│   ├── llm_service.py
│   ├── scoring.py
│   ├── question_bank/
│   │   ├── dsa.py
│   │   ├── backend.py
│   │   └── ml.py
│   ├── requirements.txt
│   └── .env
│
├── .gitignore
├── .env.example
└── README.md
```

## 🔐 Environment Variables

Create a `.env` file and configure the required LLM API key:

```env
LLM_API_KEY=your_api_key_here
```

**Do not commit `.env` or API keys to GitHub.**

## 👥 Team Responsibilities

| Role     | Responsibility                                                         |
| -------- | ---------------------------------------------------------------------- |
| Frontend | Interview UI, answer interface, feedback display, progress and results |
| Backend  | APIs, session management, question flow, LLM integration and scoring   |
| AI       | Question bank, evaluation prompts, scoring rubric and follow-up logic  |

## 🎯 Project Goal

The goal of AI Mock Interviewer is to make technical interview practice more interactive and adaptive by providing **real-time AI evaluation and response-based questioning**, rather than simply presenting a fixed sequence of interview questions.

## 🚧 Future Scope

* Voice-based interviews
* Speech-to-text
* More interview domains
* Code execution for coding questions
* Personalized interview difficulty
* Historical performance tracking
* Advanced analytics
* Resume-based interview generation
