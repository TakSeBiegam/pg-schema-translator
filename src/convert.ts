import { ParserField } from 'graphql-js-tree';
import { CreateGraphWithInputs, CreateGraphWithoutInputs } from './tools/utils.js';

export const convertGraph = (title: string, nodes: ParserField[]) => {
  return (
    `CREATE GRAPH TYPE ${title}GraphType STRICT { ` +
    CreateGraphWithoutInputs(nodes) +
    CreateGraphWithInputs(nodes) +
    `\n}`
  );
};
