#!/usr/bin/env node

import { Parser } from 'graphql-js-tree';
import { welcome } from './cli/welcome.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import { convertGraph } from './convert.js';

function convertGraphqlToPgSchema(inputFile: string, outputFile: string) {
  console.log(`Konwersja ${inputFile} do ${outputFile}`);
  try {
    let nodes = Parser.parse(fs.readFileSync(inputFile, 'utf-8')).nodes.filter((node) => node.name !== 'schema');
    const schema = convertGraph('schema', nodes);
    fs.writeFileSync(outputFile, schema);
  } catch (e) {
    console.error(`your schema is not valid.
        ${e}`);
    throw new Error('not valid schema');
  }
  console.log(`Konwersja zakończona`);
}

const { i, o } = await yargs(hideBin(process.argv))
  .usage('Użycie: $0 -i [plik] -o [plik]')
  .option('i', {
    alias: 'input',
    describe: 'Plik źródłowy GraphQL',
    type: 'string',
    demandOption: true,
  })
  .option('o', {
    alias: 'output',
    describe: 'Plik docelowy PG Schema',
    type: 'string',
    demandOption: true,
  })
  .showHelpOnFail(true)
  .epilog('Bye!').argv;
convertGraphqlToPgSchema(i, o);
