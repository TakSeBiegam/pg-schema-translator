import { Options, ParserField, TypeDefinition } from 'graphql-js-tree';
import { GqlEnum, GqlInterface, GqlUnion } from './types.js';
import { enumArray, unionArray } from './utils.js';

const mapNodes = <T>(
  nodes: ParserField[],
  typeCheck: (node: ParserField) => boolean,
  createType: (node: ParserField) => T,
): T[] =>
  nodes.map((node): T | undefined => (typeCheck(node) ? createType(node) : undefined)).filter((e): e is T => !!e);

export const getEnums = (nodes: ParserField[]): GqlEnum[] =>
  mapNodes(
    nodes,
    (node) => node.type.fieldType.type === Options.name && node.type.fieldType.name === 'enum',
    (node) => ({
      fields: node.args.map((a) => a.name),
      name: node.name,
    }),
  );

export const getUnions = (nodes: ParserField[]): GqlUnion[] =>
  mapNodes(
    nodes,
    (node) => node.data.type === TypeDefinition.UnionTypeDefinition,
    (node) => ({
      fields: node.args.map((a) => a.name),
      name: node.name,
    }),
  );

export const getInterfaces = (nodes: ParserField[]): GqlInterface[] =>
  mapNodes(
    nodes,
    (node) => node.data.type === TypeDefinition.InterfaceTypeDefinition,
    (node) => ({
      fields: node.args.map((a) => a.name),
      name: node.name,
    }),
  );

export const getEnumByName = (enumName: string): GqlEnum => {
  const e = enumArray.find((enumObj) => enumObj.name === enumName);
  if (!e) {
    throw new Error('UNKNOWN ENUM TYPE');
  }
  return e;
};

export const getObjects = (nodes: ParserField[]) =>
  nodes.filter((node) => node.data.type === TypeDefinition.ObjectTypeDefinition);

export const findUnionAndReturn = (input: string) => {
  const union = unionArray.find((u) => u.name === input);
  if (!union) {
    throw new Error('Schema is not valid');
  }
  return union.fields.map((f) => f + 'Type').join(' | ');
};
