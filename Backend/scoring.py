def compute_summary(scores: list, transcript: list) -> dict:
    if not scores:
        return {
            "overall_score": 0, "correctness_avg": 0,
            "approach_avg": 0, "communication_avg": 0,
            "weak_areas": [], "transcript": transcript,
        }

    correctness_avg = sum(s["correctness"] for s in scores) / len(scores)
    approach_avg = sum(s["approach_score"] for s in scores) / len(scores)
    communication_avg = sum(s["communication_score"] for s in scores) / len(scores)

    overall_score = round(((correctness_avg + approach_avg + communication_avg) / 15) * 100, 1)

    weak_areas = [s["topic"] for s in scores if s["correctness"] <= 2 and s.get("topic")]
    weak_areas = list(dict.fromkeys(weak_areas))

    return {
        "overall_score": overall_score,
        "correctness_avg": round(correctness_avg, 2),
        "approach_avg": round(approach_avg, 2),
        "communication_avg": round(communication_avg, 2),
        "weak_areas": weak_areas,
        "transcript": transcript,
    }
