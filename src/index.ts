import * as readline from 'readline';
import { welcome } from './cli/welcome.js';
import { convertGraph } from './convert.js';
import { Parser, ParserField } from 'graphql-js-tree';
import * as fs from 'fs';
import { displayHelp, displayVersion } from './cli/commands.js';
import { MockSchema } from './mocks.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const startCLI = () => {
  rl.question('Enter your name or type "help" for assistance: ', (answer) => {
    if (answer.toLowerCase() === 'help' || answer.toLowerCase() === 'h' || answer === '') {
      welcome();
      displayHelp();
    } else if (answer.split(' ')[0].toLowerCase() === 'version') {
      displayVersion();
    } else if (answer.split(' ')[0].toLowerCase() === 'mock') {
      if (!answer.split(' ')[1]) {
        console.log(`type "full" for full graphql schema mock or type "simple" to generate simple pg-schema graph`);
      } else {
        let mock = '';
        switch (answer.split(' ')[1].toLowerCase()) {
          case 'full':
            mock = MockSchema.full;
            break;
          case 'simple':
            mock = MockSchema.simple;
            break;
        }
        try {
          let nodes = Parser.parse(mock).nodes.filter((node) => node.name !== 'schema');
          const schema = convertGraph('Mock', nodes);
          console.log(schema);
        } catch (e) {
          console.error(`your schema is not valid.
              ${e}`);
          throw new Error('not valid schema');
        }
      }
    } else if (answer.split(' ')[0].toLowerCase() === 'convert') {
      const flags = answer.split(' ');
      if (flags.length !== 3) {
        console.log(`unexpected amount of arguments try:
convert <input file> <output file>    Convert current graphql schema provided on input, and generate output file with pg-schema`);
        return -1;
      }
      const inputFile = flags[1];
      const outputFile = flags[2];
      let nodes: ParserField[] = [];
      try {
        nodes = Parser.parse(fs.readFileSync(inputFile, 'utf-8')).nodes.filter((node) => node.name !== 'schema');
      } catch (e) {
        console.error(`your schema is not valid.
            ${e}`);
        throw new Error('not valid schema');
      }
      const schema = convertGraph('schema', nodes);
      fs.writeFileSync(outputFile, schema);
    } else {
      console.log(`Unknown command, if you need help type 'help'`);
    }
    rl.close();
  });
};

startCLI();
