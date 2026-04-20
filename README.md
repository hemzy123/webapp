# webapp

LifeMap AI scaffolding for an autonomous SaaS platform.

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload
```

### Autonomous agents

```bash
python agents/main.py --loop --watch
```

## Architecture

See `docs/architecture.md`.
