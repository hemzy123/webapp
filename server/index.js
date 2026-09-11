import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = process.env.NOVA_DATA_FILE || join(root, "data", "nova.json");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8787);
const allowedOrigin = process.env.NOVA_CORS_ORIGIN || "http://127.0.0.1:5173";

const seed = {
  projects: [
    {
      id: "personal-ai-robot",
      title: "Personal AI Robot",
      problem: "Personal automation needs open, adaptable hardware.",
      solution: "An open hardware platform with adaptable intelligence.",
      city: "Forge",
      skills: "Robotics, embedded systems, industrial design",
      roadmap: "Complete a safe home prototype.",
      stage: "PROTOTYPE",
      collaborators: 18,
      createdAt: "2026-01-15T00:00:00.000Z",
    },
    {
      id: "orbital-garden",
      title: "Orbital Garden",
      problem: "Future habitats need resilient food systems.",
      solution: "A closed-loop growing system for orbital environments.",
      city: "Horizon",
      skills: "Life sciences, aerospace engineering",
      roadmap: "Validate growth cycles in a controlled environment.",
      stage: "RESEARCH",
      collaborators: 9,
      createdAt: "2026-02-02T00:00:00.000Z",
    },
    {
      id: "synthetic-aurora",
      title: "Synthetic Aurora",
      problem: "Digital culture needs more participatory spatial art.",
      solution: "A generative audiovisual world for collective performance.",
      city: "Aurora",
      skills: "Creative coding, sound design, 3D design",
      roadmap: "Publish an interactive exhibition.",
      stage: "DEVELOP",
      collaborators: 14,
      createdAt: "2026-02-20T00:00:00.000Z",
    },
  ],
  citizens: [],
};

async function readStore() {
  try {
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeStore(seed);
    return structuredClone(seed);
  }
}
async function writeStore(data) {
  await mkdir(dirname(dataFile), { recursive: true });
  const tempFile = `${dataFile}.${process.pid}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(data, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(tempFile, dataFile);
}
function send(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": allowedOrigin,
    vary: "Origin",
  });
  res.end(JSON.stringify(payload));
}
async function body(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    if (Buffer.concat(chunks).length > 100_000)
      throw new Error("Request body is too large.");
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}
const text = (value, max = 300) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
function validateProject(payload) {
  const project = {
    title: text(payload.title, 100),
    problem: text(payload.problem, 1500),
    solution: text(payload.solution, 1500),
    city: text(payload.city, 40),
    skills: text(payload.skills, 300),
    roadmap: text(payload.roadmap, 500),
  };
  const missing = Object.entries(project)
    .filter(
      ([key, value]) =>
        ["title", "problem", "solution", "city"].includes(key) && !value,
    )
    .map(([key]) => key);
  return missing.length
    ? { error: `Missing required fields: ${missing.join(", ")}.` }
    : { project };
}
function validateCitizen(payload) {
  const citizen = {
    displayName: text(payload.displayName, 80),
    email: text(payload.email, 254).toLowerCase(),
    interests: text(payload.interests, 300),
  };
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(citizen.email);
  if (!citizen.displayName || !citizen.interests || !emailOk)
    return {
      error: "Display name, a valid email, and interests are required.",
    };
  return { citizen };
}

const server = createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": allowedOrigin,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
      vary: "Origin",
    });
    return res.end();
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/health")
      return send(res, 200, { status: "ok", service: "nova-api" });
    if (req.method === "GET" && url.pathname === "/api/projects") {
      const q = text(url.searchParams.get("q") || "").toLowerCase();
      const { projects } = await readStore();
      const matches = projects.filter(
        (project) =>
          !q ||
          Object.values(project).some((value) =>
            String(value).toLowerCase().includes(q),
          ),
      );
      return send(res, 200, { projects: matches });
    }
    if (req.method === "POST" && url.pathname === "/api/projects") {
      const validation = validateProject(await body(req));
      if (validation.error) return send(res, 422, validation);
      const store = await readStore();
      const project = {
        id: randomUUID(),
        ...validation.project,
        stage: "IDEA",
        collaborators: 1,
        createdAt: new Date().toISOString(),
      };
      store.projects.unshift(project);
      await writeStore(store);
      return send(res, 201, { project });
    }
    if (req.method === "POST" && url.pathname === "/api/citizens") {
      const validation = validateCitizen(await body(req));
      if (validation.error) return send(res, 422, validation);
      const store = await readStore();
      if (
        store.citizens.some(
          (citizen) => citizen.email === validation.citizen.email,
        )
      )
        return send(res, 409, {
          error: "A founding identity already exists for this email.",
        });
      const citizen = {
        id: randomUUID(),
        ...validation.citizen,
        rank: "Citizen",
        residence: "Nexus",
        createdAt: new Date().toISOString(),
      };
      store.citizens.push(citizen);
      await writeStore(store);
      return send(res, 201, {
        citizen: {
          id: citizen.id,
          displayName: citizen.displayName,
          rank: citizen.rank,
          residence: citizen.residence,
        },
      });
    }
    return send(res, 404, { error: "Route not found." });
  } catch (error) {
    console.error(error);
    return send(res, 400, {
      error: error.message || "Request could not be processed.",
    });
  }
});
server.listen(port, host, () =>
  console.log(`NOVA API listening on http://${host}:${port}`),
);
