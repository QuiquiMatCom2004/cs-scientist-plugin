#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_SRC = join(__dirname, "..", "agents");

const TARGETS = {
  opencode: join(homedir(), ".config", "opencode", "agents"),
  claude:   join(homedir(), ".claude", "agents"),
};

const PLATFORM_PRESENCE = {
  opencode: join(homedir(), ".config", "opencode"),
  claude:   join(homedir(), ".claude"),
};

function copyAgents(dest) {
  mkdirSync(dest, { recursive: true });
  const files = readdirSync(AGENTS_SRC).filter(f => f.endsWith(".md"));
  for (const file of files) {
    copyFileSync(join(AGENTS_SRC, file), join(dest, file));
    console.log(`  ✓ ${file}`);
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
  const silent        = args.includes("--silent"); // used by postinstall
  const detected      = detect();

  let installOpencode = forceOpencode || (detected.opencode && !forceClaude);
  let installClaude   = forceClaude   || (detected.claude   && !forceOpencode);

  if (!silent && !forceOpencode && !forceClaude) {
    if (detected.opencode) {
      const ans = await ask("Install agents for opencode? [Y/n] ");
      installOpencode = ans === "" || ans === "y";
    }
    if (detected.claude) {
      const ans = await ask("Install agents for Claude Code? [Y/n] ");
      installClaude = ans === "" || ans === "y";
    }
  }

  if (!installOpencode && !installClaude) {
    console.log("Nothing to install. Use --opencode or --claude to force.");
    process.exit(0);
  }

  if (installOpencode) {
    console.log(`\nInstalling for opencode → ${TARGETS.opencode}`);
    copyAgents(TARGETS.opencode);
  }

  if (installClaude) {
    console.log(`\nInstalling for Claude Code → ${TARGETS.claude}`);
    copyAgents(TARGETS.claude);
  }

  console.log("\nDone. Restart your tool to pick up the new agents.");
}

main().catch(err => { console.error(err.message); process.exit(1); });
