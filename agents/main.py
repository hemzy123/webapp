"""Autonomous local agent runtime for LifeMap AI."""

from __future__ import annotations

import argparse
import json
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from queue import Queue
from threading import Event


@dataclass
class Task:
    id: str
    description: str


class MemoryStore:
    """File-backed memory store that can be upgraded with vector embeddings."""

    def __init__(self, path: Path = Path("agents/memory.jsonl")):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def store(self, task: Task, output: str) -> None:
        row = {"task": asdict(task), "output": output, "ts": int(time.time())}
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(row) + "\n")


class TaskQueue:
    """Simple queue fed from roadmap and watch events."""

    def __init__(self) -> None:
        self.queue: Queue[Task] = Queue()

    def seed(self) -> None:
        self.queue.put(Task(id="boot-1", description="Generate initial project scaffolding"))

    def next(self) -> Task:
        return self.queue.get()

    def complete(self, task: Task) -> None:
        print(f"[queue] completed: {task.id}")


class Planner:
    def execute(self, task: Task) -> str:
        return f"Plan for: {task.description}"


class Builder:
    def execute(self, plan: str) -> str:
        return f"Code generated from ({plan})"


class Reviewer:
    def approve(self, code: str) -> bool:
        return bool(code and "generated" in code)


class Tester:
    def validate(self, code: str) -> bool:
        return bool(code)


class Refactor:
    def execute(self, code: str) -> str:
        return code.replace("generated", "generated+refined")


class AgentSystem:
    def __init__(self) -> None:
        self.memory = MemoryStore()
        self.task_queue = TaskQueue()
        self.agents = {
            "planner": Planner(),
            "builder": Builder(),
            "reviewer": Reviewer(),
            "tester": Tester(),
            "refactor": Refactor(),
        }
        self.stop_event = Event()

    def run_once(self) -> None:
        task = self.task_queue.next()

        plan = self.agents["planner"].execute(task)
        code = self.agents["builder"].execute(plan)

        if not self.agents["reviewer"].approve(code):
            print(f"[review] rejected task={task.id}")
            return

        if not self.agents["tester"].validate(code):
            print(f"[test] failed task={task.id}")
            return

        refined = self.agents["refactor"].execute(code)
        self.memory.store(task, refined)
        self.task_queue.complete(task)

    def run(self, loop: bool = False, interval_seconds: int = 2) -> None:
        self.task_queue.seed()
        if not loop:
            self.run_once()
            return

        while not self.stop_event.is_set():
            if self.task_queue.queue.empty():
                self.task_queue.queue.put(
                    Task(id=f"auto-{int(time.time())}", description="Auto-generated roadmap task")
                )
            self.run_once()
            time.sleep(interval_seconds)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="LifeMap AI autonomous agent runtime")
    parser.add_argument("--loop", action="store_true", help="Run in continuous mode")
    parser.add_argument("--watch", action="store_true", help="Reserved for file watcher mode")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    system = AgentSystem()
    system.run(loop=args.loop)


if __name__ == "__main__":
    main()
