from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import StartRequest, StartResponse, AnswerRequest, AnswerResponse, SummaryResponse
import session_manager as sm
import question_manager as qm
import llm_service
import scoring

app = FastAPI(title="AI Mock Interviewer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/interview/start", response_model=StartResponse)
def start_interview(req: StartRequest):
    try:
        first_q = qm.get_question(req.track, 0)
    except ValueError:
        raise HTTPException(status_code=400, detail="Unknown track")
    if not first_q:
        raise HTTPException(status_code=500, detail="Question bank empty")

    session_id = sm.create_session(req.track, first_q)
    return StartResponse(session_id=session_id, question=first_q["question"], question_number=1)


@app.post("/interview/answer", response_model=AnswerResponse)
def submit_answer(req: AnswerRequest):
    try:
        session = sm.get_session(req.session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Invalid session_id")

    track = session["track"]

    if session["follow_up_pending"]:
        current_q = session["follow_up_question"]
        expected = session["current_question"]["expected_concepts"]
        topic = session["current_question"]["topic"]

        result = llm_service.evaluate_answer(track, current_q, expected, req.answer)

        session["scores"].append({
            "correctness": result["correctness"],
            "approach_score": result["approach_score"],
            "communication_score": result["communication_score"],
            "topic": topic,
        })
        session["transcript"].append({
            "question": current_q, "answer": req.answer,
            "correctness": result["correctness"],
            "approach_score": result["approach_score"],
            "communication_score": result["communication_score"],
            "approach_feedback": result["approach_feedback"],
            "communication_feedback": result["communication_feedback"],
        })

        session["follow_up_pending"] = False
        session["follow_up_question"] = None

        return _advance_to_next(session, result, topic)

    current_q_data = session["current_question"]
    result = llm_service.evaluate_answer(
        track, current_q_data["question"], current_q_data["expected_concepts"], req.answer
    )

    session["scores"].append({
        "correctness": result["correctness"],
        "approach_score": result["approach_score"],
        "communication_score": result["communication_score"],
        "topic": current_q_data["topic"],
    })
    session["transcript"].append({
        "question": current_q_data["question"], "answer": req.answer,
        "correctness": result["correctness"],
        "approach_score": result["approach_score"],
        "communication_score": result["communication_score"],
        "approach_feedback": result["approach_feedback"],
        "communication_feedback": result["communication_feedback"],
    })

    if result["correctness"] < 4 and result.get("follow_up_question"):
        session["follow_up_pending"] = True
        session["follow_up_question"] = result["follow_up_question"]
        return AnswerResponse(
            correctness=result["correctness"],
            approach_score=result["approach_score"],
            communication_score=result["communication_score"],
            approach_feedback=result["approach_feedback"],
            communication_feedback=result["communication_feedback"],
            topic=current_q_data["topic"],
            follow_up_question=result["follow_up_question"],
            next_question=None,
            question_number=session["question_index"] + 1,
            interview_complete=False,
        )

    return _advance_to_next(session, result, current_q_data["topic"])


def _advance_to_next(session, result, topic):
    session["question_index"] += 1
    next_q = qm.get_question(session["track"], session["question_index"])

    base_kwargs = dict(
        correctness=result["correctness"],
        approach_score=result["approach_score"],
        communication_score=result["communication_score"],
        approach_feedback=result["approach_feedback"],
        communication_feedback=result["communication_feedback"],
        topic=topic,
        follow_up_question=None,
    )

    if next_q is None:
        return AnswerResponse(
            **base_kwargs,
            next_question=None,
            question_number=session["question_index"],
            interview_complete=True,
        )

    session["current_question"] = next_q
    return AnswerResponse(
        **base_kwargs,
        next_question=next_q["question"],
        question_number=session["question_index"] + 1,
        interview_complete=False,
    )


@app.get("/interview/summary", response_model=SummaryResponse)

def get_summary(session_id: str):
    try:
        session = sm.get_session(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Invalid session_id")

    return scoring.compute_summary(session["scores"], session["transcript"])
