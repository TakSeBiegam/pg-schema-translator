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
  console.log(`Konwersja zakończona`);
}

const { i } = await yargs(hideBin(process.argv))
  .usage('Użycie: $0 -i [plik]')
  .option('i', {
    alias: 'input',
    describe: 'Plik źródłowy GraphQL',
    type: 'string',
    demandOption: true,
  })
  // .option('o', {
  //   alias: 'output',
  //   describe: 'Plik docelowy PG Schema',
  //   type: 'string',
  //   demandOption: true,
  // })
  .showHelpOnFail(true)
  .epilog('Bye!').argv;
convertGraphqlToPgSchema(i);
