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

console.clear();

// ─── Profile data ────────────────────────────────────────────────
const dim  = chalk.dim;
const bold = chalk.bold;

const row = (label, value) =>
  `  ${dim(label.padEnd(10))}${value}`;

const card = boxen(
  [
    row("Work",     bold.hex("#2b82b2")("CMC Telecom")),
    row("GitHub",   dim("github.com/")    + chalk.green("duc-mt")),
    row("LinkedIn", dim("linkedin.com/in/") + chalk.blue("duc-mt")),
    row("Blog",     dim("ducmt") + chalk.cyan(".netlify.app")),
    row("Card",     chalk.white("npx ") + chalk.red("duc-mt")),
    "",
    dim("  " + "─".repeat(38)),
    "",
    "  " + chalk.italic(
      `Network Engineer · CCNP track\n` +
      `  Python · SNMP · Cisco IOS · Open-source`
    ),
  ].join("\n"),
  {
    title:          chalk.green.bold(" Duc Mai "),
    titleAlignment: "center",
    margin:         1,
    float:          "center",
    padding:        1,
    borderStyle:    "round",
    borderColor:    "green",
  }
);

console.log(card);

// ─── Menu ─────────────────────────────────────────────────────────
const { action } = await inquirer.prompt([
  {
    type:    "rawlist",
    name:    "action",
    message: "What would you like to do?",
    choices: [
      { name: `${chalk.green("✉")}  Send me an email`,       value: "email"    },
      { name: `${chalk.cyan("🌐")}  Visit my blog`,           value: "blog"     },
      { name: `${chalk.white("🐙")}  Open GitHub profile`,    value: "github"   },
      { name: `${chalk.blue("💼")}  Connect on LinkedIn`,     value: "linkedin" },
      { name: `${chalk.yellow("📄")}  Download resume`,        value: "resume"   },
      { name: `${chalk.hex("#FFD700")("🔑")}  Get PGP public key`, value: "pgp"  },
      { name: dim("   Quit"),                                  value: "quit"     },
    ],
  },
]);

// ─── Actions ──────────────────────────────────────────────────────
switch (action) {
  case "email":
    await open("mailto:ducmai.network@gmail.com");
    console.log(chalk.green("\n✓") + " Opening your mail client…\n");
    break;

  case "blog":
    await open("https://ducmt.netlify.app/");
    console.log(chalk.green("\n✓") + " Opening blog…\n");
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
    const loader  = ora({
      text:    " Downloading resume…",
      spinner: cliSpinners.dots,
    }).start();

    const download = (url) =>
      new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outFile);
        https.get(url, (res) => {
          // Follow one redirect (HTTP → HTTPS or CDN hop)
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

  case "pgp":
    console.log(
      `\n  ${dim("Fingerprint")}  ` +
      chalk.yellow("D2F1 F373 9A4E 465E 737C 1F38 F9E9 1488 183E D044")
    );
    console.log(
      `  ${dim("Lookup")}       ` +
      chalk.cyan("https://keys.openpgp.org") +
      dim(" → search ducmai-network@gmail.com\n")
    );
    break;

  case "quit":
    console.log(dim("\nCheers.\n"));
    break;
}
