import random
from typing import Dict, Any

# In-memory store for citizen verification states
_VERIFICATION_STORE: Dict[str, Dict[str, Any]] = {}


def get_or_create_verification(village_id: str) -> Dict[str, Any]:
    if village_id not in _VERIFICATION_STORE:
        _VERIFICATION_STORE[village_id] = {
            "village_id": village_id,
            "total_sent": 50,
            "confirmed_flood": 0,
            "false_alarm": 0,
            "status": "IDLE",
            "sar_initial_confidence": 78.5,
            "recalibrated_confidence": 78.5,
            "verified_flood_score": 0.0,
            "threshold_met": False,
        }
    return _VERIFICATION_STORE[village_id]


def request_citizen_confirmation(village_id: str) -> Dict[str, Any]:
    """
    Simulates sending confirmation pings to registered local contacts in the target village.
    """
    state = get_or_create_verification(village_id)
    state["status"] = "PINGED_AWAITING_REPLIES"
    state["total_sent"] = 50
    return {
        "village_id": village_id,
        "status": state["status"],
        "total_sent": state["total_sent"],
        "message": f"Broadcast SMS ping sent to {state['total_sent']} registered farmers in village {village_id}."
    }


def simulate_citizen_response(
    village_id: str,
    sar_inundation_pct: float = 65.0,
    yes_votes: int = 38,
    no_votes: int = 4
) -> Dict[str, Any]:
    """
    Simulates incoming farmer confirmation replies (e.g. 38 YES, 4 NO).
    Recalibrates risk score:
    verified_flood_score = min(100.0, (sar_inundation_pct * 0.5) + ((yes_votes / total_votes) * 50.0))
    """
    state = get_or_create_verification(village_id)
    total_votes = yes_votes + no_votes
    if total_votes == 0:
        total_votes = 1

    state["confirmed_flood"] = yes_votes
    state["false_alarm"] = no_votes
    state["status"] = "VERIFIED_RESPONSES_RECEIVED"

    # Dynamic recalibration formula
    yes_ratio = (yes_votes / total_votes) * 50.0
    sar_contrib = sar_inundation_pct * 0.5
    verified_score = min(100.0, round(sar_contrib + yes_ratio, 1))

    # Recalibrated AI flood confidence weight
    citizen_weight = (yes_votes / total_votes) * 100.0
    recalibrated_conf = round((state["sar_initial_confidence"] * 0.6) + (citizen_weight * 0.4), 1)

    state["verified_flood_score"] = verified_score
    state["recalibrated_confidence"] = recalibrated_conf
    state["threshold_met"] = (yes_votes / total_votes) >= 0.6

    return {
        "village_id": village_id,
        "total_sent": state["total_sent"],
        "total_responses": total_votes,
        "confirmed_flood": yes_votes,
        "false_alarm": no_votes,
        "yes_pct": round((yes_votes / total_votes) * 100, 1),
        "no_pct": round((no_votes / total_votes) * 100, 1),
        "sar_initial_confidence": state["sar_initial_confidence"],
        "recalibrated_confidence": recalibrated_conf,
        "verified_flood_score": verified_score,
        "threshold_met": state["threshold_met"],
        "status": state["status"]
    }
