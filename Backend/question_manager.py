from question_bank import dsa, backend as backend_qb

BANKS = {
    "dsa": dsa.QUESTIONS,
    "backend": backend_qb.QUESTIONS,
}

def get_bank(track: str):
    if track not in BANKS:
        raise ValueError(f"Unknown track: {track}")
    return BANKS[track]

def get_question(track: str, index: int):
    """index is 0-based"""
    bank = get_bank(track)
    if index >= len(bank):
        return None
    return bank[index]

def total_questions(track: str) -> int:
    return len(get_bank(track))