from dataclasses import dataclass

from app.services.gating import PlanContext, can_use_ai


@dataclass
class UserData:
    goal: str
    blockers: list[str]
    plan: str


class RuleEngine:
    def suggest(self, user_data: UserData) -> str:
        if user_data.blockers:
            return f"Handle blocker first: {user_data.blockers[0]}"
        return f"Take one small action toward: {user_data.goal}"


class LLMClient:
    def generate(self, prompt: str) -> str:
        return f"LLM recommendation based on prompt: {prompt[:80]}"


class RecommendationService:
    def __init__(self, llm: LLMClient | None = None):
        self.llm = llm or LLMClient()
        self.rules = RuleEngine()

    def generate_recommendation(self, user_data: UserData) -> str:
        if not can_use_ai(PlanContext(plan=user_data.plan)):
            return self.rules.suggest(user_data)

        prompt = (
            "Analyze this user's goals and tasks. "
            "Suggest the most impactful next action. "
            f"Goal: {user_data.goal}. Blockers: {user_data.blockers}."
        )
        return self.llm.generate(prompt)
