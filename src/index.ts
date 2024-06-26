#!/usr/bin/env node

import { Parser } from 'graphql-js-tree';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import { convertGraph } from './convert.js';
import { tableCreator } from './cli/table.js';
import { printTable } from 'console-table-printer';

const convertGraphqlToPgSchema = (inputFile: string) => {
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
};

const mappingFiles = (input: string): string | null => {
  const mapping: { [key: string]: string } = {
    graphql: 'graphql',
    pgschema: 'pgs',
  };
  return mapping[input] || null;
};
const mappingLanguages = (input: string): string | null => {
  const mapping: { [key: string]: string } = {
    pgschema: 'pg-schema',
    graphql: 'graphql',
  };
  return mapping[input] || null;
};

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
  .command(
    'list',
    'List example schemas',
    (yargs) => {
      yargs.positional('type', {
        describe: 'The type of schema to list',
        type: 'string',
        choices: ['graphql', 'pgschema'],
      });
    },
    (argv) => {
      if (argv._[1] && typeof argv._[1] === 'string') {
        const schemas = fs.readdirSync(`examples/${mappingLanguages(argv._[1])}`);
        const table = tableCreator();

        table.addRows(
          schemas.map((s) => ({
            path: s,
            'file name': s.split('.')[0],
          })),
        );
        table.printTable();
      }
    },
  )
  .command(
    'show',
    'Show specific generated schema',
    (yargs) => {
      yargs.positional('type', {
        describe: 'The type of schema to list',
        type: 'string',
        choices: ['graphql', 'pgschema'],
      });
      yargs.option('f', {
        alias: 'input',
        type: 'string',
        describe: 'file name',
        demandOption: true,
      });
    },
    (argv) => {
      if (argv._[1] && typeof argv._[1] === 'string' && argv.f && typeof argv.f === 'string') {
        let schema: Buffer = Buffer.from('');
        try {
          schema = fs.readFileSync(`examples/${argv._[1]}/${argv.f}`);
        } catch (e) {
          schema = fs.readFileSync(`examples/${argv._[1]}/${argv.f}.${mappingFiles(argv._[1])}`);
        }
      }
    },
  )
  .demandCommand(1, 'You need at least one command before moving on').argv;
