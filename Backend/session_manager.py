import uuid

sessions = {}

def create_session(track: str, first_question: dict) -> str:
    session_id = str(uuid.uuid4())[:8]
    sessions[session_id] = {
        "track": track,
        "question_index": 0,          # 0-based index into question bank
        "current_question": first_question,
        "follow_up_pending": False,
        "follow_up_question": None,
        "scores": [],                 # list of dicts: correctness/approach/comm per Q
        "transcript": [],
        "weak_topics": [],
    }
    return session_id

def get_session(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise KeyError("Invalid session_id")
    return session

def update_session(session_id: str, **kwargs):
    session = get_session(session_id)
    session.update(kwargs)
    return session