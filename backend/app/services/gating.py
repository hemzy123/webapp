from dataclasses import dataclass


@dataclass
class PlanContext:
    plan: str


def can_use_ai(ctx: PlanContext) -> bool:
    return ctx.plan in {"pro", "premium"}
