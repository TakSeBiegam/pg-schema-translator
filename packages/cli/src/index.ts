#!/usr/bin/env node

import { Parser } from 'graphql-js-tree';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import { tableCreator } from './cli/table.js';
import { convertGraph } from '@pg-converter/utils';

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
    'pg-schema': 'pgs',
  };
  return mapping[input] || null;
};
const mappingLanguages = (input: string): string | null => {
  const mapping: { [key: string]: string } = {
    pgschema: 'pg-schema',
    graphql: 'graphql',
  };
  return mapping[input] || input;
};

yargs(hideBin(process.argv))
  .usage('Usage: $0 <command>')
  .version(false)
  .help('h')
  .alias('h', 'help')
  .command(
    'convert',
    'Convert your GraphQL schema to PG-schema',
    (yargs) => {
      yargs.option('i', {
        alias: 'input',
        type: 'string',
        describe: 'Input file',
      });
    },
    (argv) => {
      if (!argv._[1] || typeof argv._[1] !== 'string') {
        console.log(`correct usage
> convert -i <file name>`);
      } else {
        try {
          convertGraphqlToPgSchema(argv._[1]);
        } catch (e) {
          console.error('schema cannot be converted, check schema syntax', e);
        }
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
        demandOption: true,
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
      } else {
        console.log(`correct usage
> list <graphql/pgschema>`);
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
      yargs.positional('file', {
        type: 'string',
        describe: 'file name of schema to show',
        demandOption: true,
      });
    },
    (argv) => {
      if (argv._[1] && typeof argv._[1] === 'string' && argv._[2] && typeof argv._[2] === 'string') {
        let schema: Buffer = Buffer.from('');
        try {
          schema = fs.readFileSync(`examples/${argv._[1]}/${argv._[2]}`);
        } catch (e) {
          schema = fs.readFileSync(`examples/${argv._[1]}/${argv._[2]}.${mappingFiles(argv._[1])}`);
        }
        console.log(schema.toString());
      } else {
        console.log(`correct usage
> show <graphql/pg-schema> -f <file name>`);
      }
    },
  )
  .demandCommand(1, 'You need at least one command before moving on').argv;
