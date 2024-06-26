#!/usr/bin/env node

import { Parser } from 'graphql-js-tree';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import { convertGraph } from './convert.js';

function convertGraphqlToPgSchema(inputFile: string) {
  console.log(`Konwersja ${inputFile}`);
  try {
    let nodes = Parser.parse(fs.readFileSync(inputFile, 'utf-8')).nodes.filter((node) => node.name !== 'schema');
    const schema = convertGraph('schema', nodes);
    console.log(schema);
  } catch (e) {
    console.error(`your schema is not valid.
        ${e}`);
    throw new Error('not valid schema');
  }
}

yargs(hideBin(process.argv))
  .usage('Usage: $0 -i [file]')
  .version(false)
  .help('h')
  .alias('h', 'help')
  .alias('i', 'input')
  .command(
    'convert',
    'Convert your GraphQL schema to PG-schema',
    (yargs) => {
      yargs.option('i', {
        alias: 'input',
        type: 'string',
        describe: 'Input file',
        demandOption: true,
      });
    },
    (argv) => {
      if (argv.input && typeof argv.input === 'string') {
        convertGraphqlToPgSchema(argv.input);
      }
    },
  )
  .demandCommand(1, 'You need at least one command before moving on').argv;
