from app.services.ai import RecommendationService, UserData


def test_free_plan_uses_rules() -> None:
    svc = RecommendationService()
    result = svc.generate_recommendation(
        UserData(goal="Launch MVP", blockers=["No landing page"], plan="free")
    )
    assert "Handle blocker first" in result


def test_paid_plan_uses_llm() -> None:
    svc = RecommendationService()
    result = svc.generate_recommendation(
        UserData(goal="Grow revenue", blockers=[], plan="pro")
    )
    assert "LLM recommendation" in result
