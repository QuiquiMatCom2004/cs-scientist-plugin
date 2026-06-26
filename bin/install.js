#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_SRC = join(__dirname, "..", "agents");
const SKILLS_SRC = join(__dirname, "..", "skills");

// Claude Code requires explicit model IDs in agent frontmatter.
// opencode works without model: (uses default model from opencode.json).
const CLAUDE_MODELS = {
  "cs-scientist.md":            "claude-sonnet-4-6",
  "cs-scientist-research.md":   "claude-sonnet-4-6",
  "cs-scientist-dev.md":        "claude-sonnet-4-6",
  "cs-scientist-teach.md":      "claude-sonnet-4-6",
  "cs-scientist-critic.md":     "claude-sonnet-4-6",
  "cs-scientist-consultant.md": "claude-haiku-4-5-20251001",
  "cs-scientist-arbiter.md":    "claude-sonnet-4-6",
};

const CLAUDE_COLORS = {
  "cs-scientist.md":            "cyan",
  "cs-scientist-research.md":   "blue",
  "cs-scientist-dev.md":        "green",
  "cs-scientist-teach.md":      "yellow",
  "cs-scientist-critic.md":     "red",
  "cs-scientist-consultant.md": "magenta",
  "cs-scientist-arbiter.md":    "cyan",
};

// Tool whitelists for Claude Code — translates OpenCode's permission blocks.
// undefined = full tool access (orchestrator and mode agents need unrestricted access).
// [] = no tools (critic, arbiter must not touch disk or session context).
const CLAUDE_TOOLS = {
  "cs-scientist-critic.md":     [],
  "cs-scientist-consultant.md": ["WebFetch", "WebSearch"],
  "cs-scientist-arbiter.md":    [],
};

// Default model to register in opencode.json for each agent.
// null = inherit the global default model from opencode.json.
// Individual users can override these in opencode.json after install.
const OPENCODE_AGENT_MODELS = {
  "cs-scientist":            null,
  "cs-scientist-research":   null,
  "cs-scientist-dev":        null,
  "cs-scientist-teach":      null,
  "cs-scientist-critic":     null,
  "cs-scientist-consultant": null,
  "cs-scientist-arbiter":    null,
};

const TARGETS = {
  opencode: {
    agents:     join(homedir(), ".config", "opencode", "agents"),
    skills:     join(homedir(), ".config", "opencode", "skills"),
    configJson: join(homedir(), ".config", "opencode", "opencode.json"),
  },
  claude: {
    agents: join(homedir(), ".claude", "agents"),
    skills: join(homedir(), ".claude", "commands"),
  },
};

const PLATFORM_PRESENCE = {
  opencode: join(homedir(), ".config", "opencode"),
  claude:   join(homedir(), ".claude"),
};

// Transforms an agent file's frontmatter from OpenCode format to Claude Code format:
//   - strips mode: and permission: (OpenCode-specific)
//   - injects name:, model:, color:, tools: (Claude Code fields)
function transformForClaude(content, filename) {
  if (!content.startsWith('---\n')) return content;
  const fmClose = content.indexOf('\n---\n', 3);
  if (fmClose === -1) return content;

  let fm     = content.slice(4, fmClose + 1); // frontmatter body (trailing \n included)
  const body = content.slice(fmClose + 5);    // everything after closing ---\n

  // Strip OpenCode-specific fields
  fm = fm.replace(/^mode: [^\n]*\n/m, '');
  fm = fm.replace(/^permission:\n(?:  [^\n]*\n)*/m, '');

  const name    = basename(filename, '.md');
  const modelId = CLAUDE_MODELS[filename];
  const color   = CLAUDE_COLORS[filename];
  const tools   = CLAUDE_TOOLS[filename];

  fm = `name: ${name}\n` + fm;
  if (modelId !== undefined) fm += `model: ${modelId}\n`;
  if (color   !== undefined) fm += `color: ${color}\n`;
  if (tools   !== undefined) {
    const toolStr = tools.length === 0
      ? '[]'
      : `[${tools.map(t => `"${t}"`).join(', ')}]`;
    fm += `tools: ${toolStr}\n`;
  }

  return `---\n${fm}---\n${body}`;
}

function copyDir(src, dest, force = false, indent = "  ") {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath, force, indent + "  ");
    } else if (entry.endsWith(".md")) {
      const existed = existsSync(destPath);
      if (!force && existed) {
        console.log(`${indent}~ ${entry} (already exists — skipped, use --force to overwrite)`);
        continue;
      }
      copyFileSync(srcPath, destPath);
      console.log(`${indent}✓ ${entry}${force && existed ? " (overwritten)" : ""}`);
    }
  }
}

function copyDirForClaude(src, dest, force = false, indent = "  ") {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath  = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirForClaude(srcPath, destPath, force, indent + "  ");
    } else if (entry.endsWith(".md")) {
      const existed = existsSync(destPath);
      if (!force && existed) {
        console.log(`${indent}~ ${entry} (already exists — skipped, use --force to overwrite)`);
        continue;
      }
      const raw     = readFileSync(srcPath, "utf-8");
      const content = transformForClaude(raw, entry);
      writeFileSync(destPath, content);
      const modelId = CLAUDE_MODELS[entry];
      const tools   = CLAUDE_TOOLS[entry];
      const notes   = [
        modelId                  ? `model: ${modelId}`                          : null,
        tools !== undefined      ? `tools: ${tools.length === 0 ? '∅' : tools.join(',')}` : null,
      ].filter(Boolean).join(', ');
      console.log(`${indent}✓ ${entry}${notes ? ` [${notes}]` : ''}${force && existed ? " (overwritten)" : ""}`);
    }
  }
}

// Adds missing cs-scientist agent entries to opencode.json.
// ONLY adds — never removes or modifies existing entries.
function patchOpencodeJson(configPath) {
  if (!existsSync(configPath)) return;
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    console.log("  ~ opencode.json unreadable — skipping agent registration");
    return;
  }
  if (!config.agent) config.agent = {};
  let added = 0;
  for (const [name, model] of Object.entries(OPENCODE_AGENT_MODELS)) {
    if (config.agent[name] !== undefined) continue;
    config.agent[name] = model ? { model } : {};
    console.log(`  + ${name} (uses default model)`);
    added++;
  }
  if (added > 0) {
    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  } else {
    console.log("  ~ all agent entries already present");
  }
}

function detect() {
  return {
    opencode: existsSync(PLATFORM_PRESENCE.opencode),
    claude:   existsSync(PLATFORM_PRESENCE.claude),
  };
}

async function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const forceOpencode = args.includes("--opencode");
  const forceClaude   = args.includes("--claude");
  const force         = args.includes("--force");
  const silent        = args.includes("--silent"); // used by postinstall
  const detected      = detect();

  const copy = (src, dest) => copyDir(src, dest, force);

  let installOpencode = forceOpencode || (detected.opencode && !forceClaude);
  let installClaude   = forceClaude   || (detected.claude   && !forceOpencode);

  if (!silent && !forceOpencode && !forceClaude) {
    if (detected.opencode) {
      const ans = await ask("Install agents + skills for opencode? [Y/n] ");
      installOpencode = ans === "" || ans === "y";
    }
    if (detected.claude) {
      const ans = await ask("Install agents + skills for Claude Code? [Y/n] ");
      installClaude = ans === "" || ans === "y";
    }
  }

  if (!installOpencode && !installClaude) {
    console.log("Nothing to install. Use --opencode or --claude to force.");
    process.exit(0);
  }

  if (installOpencode) {
    console.log(`\nInstalling agents for opencode → ${TARGETS.opencode.agents}`);
    copy(AGENTS_SRC, TARGETS.opencode.agents);
    console.log(`\nInstalling skills for opencode → ${TARGETS.opencode.skills}`);
    copy(SKILLS_SRC, TARGETS.opencode.skills);
    console.log(`\nRegistering agents in opencode.json → ${TARGETS.opencode.configJson}`);
    patchOpencodeJson(TARGETS.opencode.configJson);
  }

  if (installClaude) {
    console.log(`\nInstalling agents for Claude Code → ${TARGETS.claude.agents}`);
    copyDirForClaude(AGENTS_SRC, TARGETS.claude.agents, force);
    console.log(`\nInstalling skills for Claude Code → ${TARGETS.claude.skills}`);
    copy(SKILLS_SRC, TARGETS.claude.skills);
  }

  console.log("\nDone. Restart your tool to pick up the new agents and skills.");
  if (!force) {
    console.log("Tip: use --force to overwrite existing files on future updates.");
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
