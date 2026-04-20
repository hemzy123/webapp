from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.ai import RecommendationService, UserData

router = APIRouter()
service = RecommendationService()


class RecommendationRequest(BaseModel):
    goal: str
    blockers: list[str] = Field(default_factory=list)
    plan: str = "free"


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/recommend")
def recommend(payload: RecommendationRequest) -> dict[str, str]:
    recommendation = service.generate_recommendation(
        UserData(goal=payload.goal, blockers=payload.blockers, plan=payload.plan)
    )
    return {"recommendation": recommendation}
