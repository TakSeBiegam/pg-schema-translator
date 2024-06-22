import { Options, ParserField, TypeDefinition } from 'graphql-js-tree';
import { GqlEnum, GqlUnion } from './types.js';
import { enumArray } from './utils.js';

export const getEnums = (nodes: ParserField[]) => {
  const enums = nodes.map((node): GqlEnum | undefined => {
    if (node.type.fieldType.type === Options.name && node.type.fieldType.name === 'enum') {
      return {
        fields: node.args.map((a) => a.name),
        name: node.name,
      };
    }
  });
  return enums.filter((e): e is GqlEnum => !!e);
};

export const getUnions = (nodes: ParserField[]) => {
  const unions = nodes.map((node): GqlUnion | undefined => {
    if (node.data.type === TypeDefinition.UnionTypeDefinition) {
      return {
        fields: node.args.map((a) => a.name),
        name: node.name,
      };
    }
  });
  return unions.filter((e): e is GqlUnion => !!e);
};

export const getEnumByName = (enumName: string): GqlEnum => {
  const e = enumArray.find((enumObj) => enumObj.name === enumName);
  if (!e) {
    throw new Error('UNKNOWN ENUM TYPE');
  }
  return e;
};

export const getObjects = (nodes: ParserField[]) =>
  nodes.filter((node) => node.data.type === TypeDefinition.ObjectTypeDefinition);
