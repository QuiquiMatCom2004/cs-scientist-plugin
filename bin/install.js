#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_SRC = join(__dirname, "..", "agents");
const SKILLS_SRC = join(__dirname, "..", "skills");

const TARGETS = {
  opencode: {
    agents: join(homedir(), ".config", "opencode", "agents"),
    skills: join(homedir(), ".config", "opencode", "skills"),
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

function copyDir(src, dest, force = false, indent = "  ") {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath, force, indent + "  ");
    } else if (entry.endsWith(".md")) {
      if (!force && existsSync(destPath)) {
        console.log(`${indent}~ ${entry} (already exists — skipped, use --force to overwrite)`);
        continue;
      }
      copyFileSync(srcPath, destPath);
      console.log(`${indent}✓ ${entry}${force && existsSync(destPath) ? " (overwritten)" : ""}`);
    }
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
  }

  if (installClaude) {
    console.log(`\nInstalling agents for Claude Code → ${TARGETS.claude.agents}`);
    copy(AGENTS_SRC, TARGETS.claude.agents);
    console.log(`\nInstalling skills for Claude Code → ${TARGETS.claude.skills}`);
    copy(SKILLS_SRC, TARGETS.claude.skills);
  }

  console.log("\nDone. Restart your tool to pick up the new agents and skills.");
  if (!force) {
    console.log("Tip: use --force to overwrite existing files on future updates.");
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
