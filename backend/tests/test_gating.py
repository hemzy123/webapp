from app.services.gating import PlanContext, can_use_ai


def test_can_use_ai_only_for_paid_plans() -> None:
    assert can_use_ai(PlanContext(plan="pro"))
    assert can_use_ai(PlanContext(plan="premium"))
    assert not can_use_ai(PlanContext(plan="free"))
