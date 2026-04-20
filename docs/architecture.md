# LifeMap AI — Autonomous SaaS Architecture

## 1) Self-Hosted AI Dev System

- `agents/main.py` provides a production-style `AgentSystem` loop with planner, builder, reviewer, tester, and refactor roles.
- Memory is file-backed (`agents/memory.jsonl`) and can be upgraded to vector DB adapters (Chroma/FAISS) later.
- Continuous mode is supported:

```bash
python agents/main.py --loop --watch
```

## 2) CI/CD Auto Deployment

- Workflow: `.github/workflows/deploy.yml`
- Trigger: push to `main`
- Pipeline:
  1. Build frontend when present
  2. Install backend dependencies
  3. Run backend tests
  4. Build Docker image
  5. Deploy placeholder for Render/Railway/AWS

## 3) Multi-User Collaboration Data Model

Implemented SQLAlchemy entities in `backend/app/models/entities.py`:

- `User(id, email, password_hash, plan)`
- `Workspace(id, owner_id)`
- `Member(user_id, workspace_id, role)`
- `LifeMap(id, workspace_id)`
- `Subscription(user_id, plan, status, renewal_date)`

## 4) Monetization & Feature Gating

`backend/app/services/gating.py`:

- `can_use_ai()` returns true only for `pro` and `premium`

## 5) Hybrid AI Layer

`backend/app/services/ai.py`:

- Free: rule-based suggestions via `RuleEngine`
- Paid: LLM-driven suggestions via `LLMClient`
- Shared entrypoint: `RecommendationService.generate_recommendation`

## 6) API Surface

`backend/app/main.py` + `backend/app/api/routes.py`:

- `GET /api/health`
- `POST /api/recommend`

## 7) Realistic Delivery Path

1. Local autonomous agents and service scaffolding ✅
2. CI deploy and Docker build ✅
3. Add auth + billing providers (JWT + Stripe) ⏳
4. WebSockets + collaboration UI ⏳
5. Scale to AWS/Kubernetes ⏳
