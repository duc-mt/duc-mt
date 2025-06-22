#!/usr/bin/env node

'use strict'

const boxen = require("boxen");
const chalk = require("chalk");
const inquirer = require("inquirer");
const clear = require("clear");
const open = require("open");
const fs = require('fs');
const request = require('request');
const path = require('path');
const ora = require('ora');
const cliSpinners = require('cli-spinners');
clear();

const prompt = inquirer.createPromptModule();

const questions = [
    {
        type: "list",
        name: "action",
        message: "What do you want to do?",
        choices: [
            {
                name: `Send me an ${chalk.green.bold("💬 email")}?`,
                value: () => {
                    open("mailto:ducmai.network@gmail.com");
                    console.log("\nDone, see you soon at inbox.");
                }
            },
            {
                name: `Download my ${chalk.magentaBright.bold("🎓 resume")}?`,
                value: () => {
                    // cliSpinners.dots;
                    const loader = ora({
                        text: ' Downloading Resume',
                        spinner: cliSpinners.material,
                    }).start();
                    let pipe = request('https://tandukemai.com/resume/MaiTanDuc_Resume.docx').pipe(fs.createWriteStream('./MaiTanDuc_Resume.docx'));
                    pipe.on("finish", function () {
                        let downloadPath = path.join(process.cwd(), 'MaiTanDuc_Resume.docx')
                        console.log(`\nResume downloaded at ${downloadPath}`);
                        open(downloadPath)
                        loader.stop();
                    });
                }
            },
            {
                name: `Head to my ${chalk.redBright.bold("💳 website")}?`,
                value: () => {
                    open('https://tandukemai.com/');
                    console.log("\nDone, happy browsing!");
                }
            },
            {
                name: `Attain my ${chalk.hex("#FFD700").bold("🔑 PGP")} public key?`,
                value: () => {
                    console.log("D2F1 F373 9A4E 465E 737C 1F38 F9E9 1488 183E D044");
                }
            },
            {
                name: "Just quit.",
                value: () => {
                    console.log("Cheers!");
                }
            }
        ]
    }
];

const data = {
    name: chalk.bold.green("             Duke Mai"),
    handle: chalk.white("@duc-mt"),
    work: `${chalk.white("Network Engineer at")} ${chalk
        .hex("#2b82b2")
        .bold("CMC Telecom")}`,
    github: chalk.gray("https://github.com/") + chalk.green("duke-mai"),
    linkedin: chalk.gray("https://linkedin.com/in/") + chalk.blue("duc-mt"),
    web: chalk.cyan("https://tandukemai.com/"),
    twitter: chalk.gray("https://twitter.com/") + chalk.cyan("hacker0ten"),
    npx: chalk.red("npx") + " " + chalk.white("duc-mt"),

    labelWork: chalk.white.bold("       Work:"),
    labelGitHub: chalk.white.bold("     GitHub:"),
    labelLinkedIn: chalk.white.bold("   LinkedIn:"),
    labelWeb: chalk.white.bold("        Web:"),
    labelTwitter: chalk.white.bold("    Twitter:"),
    labelCard: chalk.white.bold("       Card:")
};

const me = boxen(
    [
        `${data.name}`,
        ``,
        `${data.labelWork}  ${data.work}`,
        ``,
        `${data.labelGitHub}  ${data.github}`,
        `${data.labelLinkedIn}  ${data.linkedin}`,
        `${data.labelWeb}  ${data.web}`,
        `${data.labelTwitter}  ${data.twitter}`,
        ``,
        `${data.labelCard}  ${data.npx}`,
        ``,
        `${chalk.italic("Network Engineer with a focus on IP networking,")}`,
        `${chalk.italic("  routing protocols, and telecom systems.")}`,
        `${chalk.italic("Skilled in Cisco technologies, monitoring tools,")}`,
        `${chalk.italic( "  and cross-functional collaboration.")}`,
        `${chalk.italic("Always exploring new ways to \"network\".")}`
    ].join("\n"),
    {
        margin: 1,
        float: 'center',
        padding: 1,
        borderStyle: "single",
        borderColor: "green"
    }
);

console.log(me);

prompt(questions).then(answer => answer.action());
