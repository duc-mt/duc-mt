#!/usr/bin/env node

import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";
import open from "open";
import fs from "fs";
import https from "https";
import path from "path";
import ora from "ora";
import cliSpinners from "cli-spinners";
import { exec } from "child_process";
import figlet from "figlet";
import gradient from "gradient-string";

console.clear();

const dim  = chalk.dim;
const bold = chalk.bold;
const brand = gradient(["#22c55e", "#38bdf8"]); // green → blue

// ─── Small helpers ──────────────────────────────────────────────
const row = (icon, label, value) =>
  `  ${icon}  ${dim(label.padEnd(9))}${value}`;

const httpsGet = (url, headers = {}) =>
  new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "duc-mt-card", ...headers } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
        }
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });

const copyToClipboard = (text) =>
  new Promise((resolve, reject) => {
    const cmd =
      process.platform === "darwin" ? "pbcopy" :
      process.platform === "win32"  ? "clip"   :
                                       "xclip -selection clipboard";
    const child = exec(cmd, (err) => (err ? reject(err) : resolve()));
    child.stdin.write(text);
    child.stdin.end();
  });

const localTime = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date()) + " ICT";

// ─── Fetch live data (best-effort, silent on failure) ──────────
const fetchLiveData = async () => {
  const data = { stats: null, post: null }; // post: { count, url }

  try {
    const raw = await httpsGet("https://api.github.com/users/duc-mt");
    const user = JSON.parse(raw);
    data.stats = `${user.public_repos} repos  ·  ${user.followers} followers`;
  } catch {
    /* offline or rate-limited — skip silently */
  }

  try {
    const feed  = await httpsGet("https://ducmt.netlify.app/index.xml");
    const count = (feed.match(/<item>/g) || []).length;
    // also grab the latest post URL so the menu link still works
    const linkMatch = feed.match(/<item>[\s\S]*?<link>(.*?)<\/link>/);
    if (count > 0) {
      data.post = {
        count,
        url: linkMatch ? linkMatch[1].trim() : "https://ducmt.netlify.app/",
      };
    }
  } catch {
    /* offline — skip silently */
  }

  return data;
};

// ─── Loading ─────────────────────────────────────────────────────
const spinner = ora({ text: dim(" loading card…"), spinner: cliSpinners.dots }).start();
const live = await fetchLiveData();
spinner.stop();
console.clear();

// ─── ASCII name banner ───────────────────────────────────────────
const banner = figlet.textSync("Mai Tan Duc", { font: "Slant" });
console.log(brand.multiline(banner));
console.log(dim("  Network Engineer  ·  CCNP-EI holder  ·  Security & Automation\n"));

// ─── Info card ────────────────────────────────────────────────────
const lines = [
  row("💼", "Work",     bold.hex("#38bdf8")("CMC Telecom")),
  row("🐙", "GitHub",   dim("github.com/")      + chalk.green("duc-mt")),
  row("💼", "LinkedIn", dim("linkedin.com/in/") + chalk.blueBright("duc-mt")),
  row("📝", "Blog",     dim("ducmt")            + chalk.cyan(".netlify.app")),
  row("🕐", "Local",    chalk.white(localTime())),
];

if (live.stats) lines.push(row("⭐", "GitHub",  chalk.yellow(live.stats)));
if (live.post)  lines.push(row("📰", "Posts",   chalk.magenta(`${live.post.count} posts written`)));

console.log(
  boxen(lines.join("\n"), {
    margin:      { top: 0, bottom: 1, left: 1, right: 1 },
    float:       "center",
    padding:     { top: 1, bottom: 1, left: 2, right: 2 },
    borderStyle: "round",
    borderColor: "green",
    dimBorder:   false,
  })
);

// ─── Menu ────────────────────────────────────────────────────────
const choices = [
  { name: `${chalk.green("✉ ")}  Send me an email`,     value: "email"       },
  { name: `${chalk.green("📋")}  Copy email address`,     value: "copyEmail"  },
  new inquirer.Separator(dim("  ─── links ───")),
  { name: `${chalk.cyan("🌐")}  Visit my blog`,           value: "blog"       },
];

if (live.post) {
  choices.push({ name: `${chalk.magenta("📰")}  Read latest post`, value: "latestPost" });
}

choices.push(
  { name: `${chalk.white("🐙")}  Open GitHub profile`,       value: "github"   },
  { name: `${chalk.blueBright("💼")}  Connect on LinkedIn`,   value: "linkedin" },
  new inquirer.Separator(dim("  ─── more ───")),
  { name: `${chalk.yellow("📄")}  Download resume`,            value: "resume"   },
  { name: `${chalk.hex("#FFD700")("🔑")}  Get PGP public key`,  value: "pgp"      },
  new inquirer.Separator(" "),
  { name: dim("   Quit"),                                       value: "quit"     }
);

const { action } = await inquirer.prompt([
  { type: "rawlist", name: "action", message: chalk.bold("What would you like to do?"), choices },
]);

// ─── Actions ──────────────────────────────────────────────────────
switch (action) {
  case "email":
    await open("mailto:ducmai.network@gmail.com");
    console.log(chalk.green("\n✓") + " Opening your mail client…\n");
    break;

  case "copyEmail":
    try {
      await copyToClipboard("ducmai.network@gmail.com");
      console.log(chalk.green("\n✓") + " Email copied to clipboard.\n");
    } catch {
      console.log(chalk.yellow("\n!") + " Couldn't access clipboard — ducmai.network@gmail.com\n");
    }
    break;

  case "blog":
    await open("https://ducmt.netlify.app/");
    console.log(chalk.green("\n✓") + " Opening blog…\n");
    break;

  case "latestPost":
    await open(live.post.url);
    console.log(chalk.green("\n✓") + " Opening latest post…\n");
    break;

  case "github":
    await open("https://github.com/duc-mt");
    console.log(chalk.green("\n✓") + " Opening GitHub profile…\n");
    break;

  case "linkedin":
    await open("https://linkedin.com/in/duc-mt");
    console.log(chalk.green("\n✓") + " Opening LinkedIn…\n");
    break;

  case "resume": {
    const outFile = path.join(process.cwd(), "MaiTanDuc_Resume.pdf");
    const loader  = ora({ text: " Downloading resume…", spinner: cliSpinners.dots }).start();

    const download = (url) =>
      new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outFile);
        https.get(url, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return download(res.headers.location).then(resolve).catch(reject);
          }
          res.pipe(file);
          file.on("finish", resolve);
          file.on("error", reject);
        }).on("error", reject);
      });

    try {
      await download("https://ducmt.netlify.app/resume/MaiTanDuc_Resume.pdf");
      loader.succeed(chalk.green(" Resume saved → ") + chalk.cyan(outFile));
      await open(outFile);
    } catch (err) {
      loader.fail(" Download failed.");
      console.error(chalk.red(err.message));
    }
    break;
  }

  case "pgp": {
    const loader = ora({ text: " Fetching PGP key…", spinner: cliSpinners.dots }).start();
    try {
      const fingerprint = "D2F1F3739A4E465E737C1F38F9E91488183ED044";
      const body = await httpsGet(
        `https://keys.openpgp.org/vks/v1/by-fingerprint/${fingerprint}`
      );
      loader.stop();
      if (body.includes("BEGIN PGP PUBLIC KEY BLOCK")) {
        console.log("\n" + body.trim() + "\n");
      } else {
        throw new Error("key not found on keyserver");
      }
    } catch {
      loader.stop();
      console.log(
        `\n  ${dim("Fingerprint")}  ` +
        chalk.yellow("D2F1 F373 9A4E 465E 737C 1F38 F9E9 1488 183E D044")
      );
      console.log(
        `  ${dim("Lookup")}       ` +
        chalk.cyan("https://keys.openpgp.org") +
        dim(" → search ducmai-network@gmail.com\n")
      );
    }
    break;
  }

  case "quit":
    console.log(dim("\nCheers.\n"));
    break;
}
