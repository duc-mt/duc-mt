#!/usr/bin/env node

import boxen from "boxen";
import chalk from "chalk";
import inquirer from "inquirer";
import clear from "clear";
import open from "open";
import fs from "fs";
import request from "request";
import path from "path";
import ora from "ora";
import cliSpinners from "cli-spinners";

clear();

// Profile data
const data = {
  name: chalk.bold.green("             Duke Mike"),
  handle: chalk.white("@duc-mt"),
  work: `${chalk.white("Network Engineer at")} ${chalk.hex("#2b82b2").bold("CMC Telecom")}`,
  github: chalk.gray("https://github.com/") + chalk.green("duc-mt"),
  linkedin: chalk.gray("https://linkedin.com/in/") + chalk.blue("duc-mt"),
  web: chalk.gray("https://") + chalk.cyan("ducmt") + chalk.gray(".netlify.app/"),
  npx: chalk.white("npx") + " " + chalk.red("duc-mt"),

  labelWork: chalk.white.bold("       Work:"),
  labelGitHub: chalk.white.bold("     GitHub:"),
  labelLinkedIn: chalk.white.bold("   LinkedIn:"),
  labelWeb: chalk.white.bold("        Web:"),
  labelCard: chalk.white.bold("       Card:"),
};

// Business card box
const me = boxen(
  [
    `${data.name}`,
    ``,
    `${data.labelWork}  ${data.work}`,
    ``,
    `${data.labelGitHub}  ${data.github}`,
    `${data.labelLinkedIn}  ${data.linkedin}`,
    `${data.labelWeb}  ${data.web}`,
    ``,
    `${data.labelCard}  ${data.npx}`,
    ``,
    chalk.italic(`Network Engineer specialising in ${chalk.green("IP networking")},`),
    chalk.italic(`  ${chalk.cyan("advanced routing protocols")} and ${chalk.cyan("telecom systems")}.`),
    chalk.italic(`Experienced with ${chalk.yellow("multi‑vendor technologies")},`),
    chalk.italic(`  ${chalk.blue("Wi‑Fi infra")}, and ${chalk.magenta("cross‑functional collaboration")}.`),
  ].join("\n"),
  {
    margin: 1,
    float: "center",
    padding: 1,
    borderStyle: "single",
    borderColor: "green",
  }
);

console.log(me);

// Menu choices
const questions = [
  {
    type: "rawlist",
    name: "action",
    message: "What do you want to do?",
    choices: [
      { name: `Send me an ${chalk.green.bold("💬 email")}?`, value: "email" },
      { name: `Head to my ${chalk.redBright.bold("💳 website")}?`, value: "website" },
      { name: `View my ${chalk.magentaBright.bold("🎓 resume")}?`, value: "resume" },
      { name: `Attain my ${chalk.hex("#FFD700").bold("🔑 PGP")} public key?`, value: "pgp" },
      { name: "Just quit.", value: "quit" },
    ],
  },
];

// Action handler
const handleAction = async (choice) => {
  switch (choice) {
    case "email":
      await open("mailto:ducmai.network@gmail.com");
      console.log("\nDone, see you soon at inbox.");
      break;

    case "website":
      await open("https://ducmt.netlify.app/");
      console.log("\nDone, happy browsing!");
      break;

    case "resume":
      const loader = ora({ text: " Downloading Resume", spinner: cliSpinners.material }).start();
      const resumeUrl = "https://ducmt.netlify.app/resume/MaiTanDuc_Resume.pdf";
      const outputFile = "./MaiTanDuc_Resume.pdf";

      try {
        const pipe = request(resumeUrl).pipe(fs.createWriteStream(outputFile));
        pipe.on("finish", () => {
          const downloadPath = path.join(process.cwd(), "MaiTanDuc_Resume.pdf");
          console.log(`\nResume downloaded at ${downloadPath}`);
          open(downloadPath);
          loader.stop();
        });
      } catch (err) {
        loader.fail("Failed to download resume.");
        console.error(err);
      }
      break;

    case "pgp":
      console.log("D2F1 F373 9A4E 465E 737C 1F38 F9E9 1488 183E D044");
      break;

    case "quit":
      console.log("Cheers!");
      break;
  }
};

// Run prompt
inquirer.prompt(questions).then((answers) => handleAction(answers.action));
