import { Parser, ParserField } from 'graphql-js-tree';
import { CreateGraphWithInputs, CreateGraphWithoutInputs } from './utils.js';
import { MockSchema } from './mocks.js';

const input = MockSchema.full;

const convertGraph = (title: string, nodes: ParserField[]) => {
  return (
    `CREATE GRAPH TYPE ${title}GraphType STRICT { ` +
    CreateGraphWithoutInputs(nodes) +
    CreateGraphWithInputs(nodes) +
    `\n}`
  );
};
let nodes: ParserField[] = [];
try {
  nodes = Parser.parse(input).nodes.filter((node) => node.name !== 'schema');
} catch (e) {
  console.error(`your schema is not valid.
      ${e}`);
  throw new Error('not valid schema');
}
console.log(convertGraph('schema', nodes));
