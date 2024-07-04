import { ParserField } from "graphql-js-tree";
import {
  CreateGraphWithInputs,
  CreateGraphWithoutInputs,
} from "./tools/utils.js";
import { doubleCommaRemover } from "./tools/removers.js";

export const convertGraph = (title: string, nodes: ParserField[]) => {
  let convertedSchema =
    `CREATE GRAPH TYPE ${title}GraphType STRICT { ` +
    CreateGraphWithoutInputs(nodes) +
    CreateGraphWithInputs(nodes) +
    `\n}`;
  const lastCommaIndex = convertedSchema.lastIndexOf(",");
  if (lastCommaIndex !== -1) {
    convertedSchema = doubleCommaRemover(
      convertedSchema.slice(0, lastCommaIndex) +
        convertedSchema.slice(lastCommaIndex + 1)
    );
  }
  return convertedSchema;
};
