#!/usr/bin/env node
import { Command } from "commander";
import callCommand from "./command/call.js";
import addCommand from "./command/add.js";
import openCommand from "./command/open.js";

const program = new Command();

program.name("blog").description("Personal knowledge blog CLI").version("1.0.0");

program.command("call").description("Copy blog prompt to clipboard").action(callCommand);

program
    .command("add <filepath>")
    .description("Add document to blog")
    .option("-d, --delete", "Delete original file after adding")
    .action(addCommand);

program.command("open").description("Open blog project in Cursor").action(openCommand);

program.parse();
