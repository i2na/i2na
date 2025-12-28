#!/usr/bin/env node
import { Command } from "commander";
import callCommand from "./commands/call.js";
import addCommand from "./commands/add.js";
import openCommand from "./commands/open.js";

const program = new Command();

program.name("archive").description("Personal knowledge archive CLI").version("1.0.0");

program.command("call").description("Copy archive prompt to clipboard").action(callCommand);

program
    .command("add <filepath>")
    .description("Add document to archive")
    .option("-d, --delete", "Delete original file after adding")
    .action(addCommand);

program.command("open").description("Open archive project in Cursor").action(openCommand);

program.parse();
