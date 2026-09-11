from pydantic import BaseModel
from typing import Optional, List

class StartRequest(BaseModel):
    track: str  # "dsa" | "backend"

class StartResponse(BaseModel):
    session_id: str
    question: str
    question_number: int

class AnswerRequest(BaseModel):
    session_id: str
    answer: str

class AnswerResponse(BaseModel):
    correctness: int
    approach_score: int
    communication_score: int
    approach_feedback: str
    communication_feedback: str
    topic: str
    follow_up_question: Optional[str] = None
    next_question: Optional[str] = None
    question_number: int
    interview_complete: bool = False

class TranscriptEntry(BaseModel):
    question: str
    answer: str
    correctness: int
    approach_score: int
    communication_score: int
    approach_feedback: str
    communication_feedback: str

class SummaryResponse(BaseModel):
    overall_score: float
    correctness_avg: float
    approach_avg: float
    communication_avg: float
    weak_areas: List[str]
    transcript: List[TranscriptEntry]
