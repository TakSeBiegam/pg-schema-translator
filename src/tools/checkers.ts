import { Options, ParserField } from 'graphql-js-tree';
import { GqlScalars } from './scalars.js';
import { enumArray, interfacesArray, unionArray } from './utils.js';

export const isInArray = <T>(element: T, arr: T[]): boolean => arr.findIndex((u) => u === element) !== -1;

export const isUnion = (input: string): boolean => unionArray.findIndex((u) => u.name === input) !== -1;

export const isInterface = (input: string): boolean => interfacesArray.findIndex((u) => u.name === input) !== -1;

export const isGqlScalar = (input: string): boolean => GqlScalars.indexOf(input.toUpperCase()) !== -1;

export const checkFieldTypeIsScalar = (enumName: string) => enumArray.some((enumObj) => enumObj.name === enumName);

export const checkIfNodeIsObject = (obj: ParserField, nodes: ParserField[]) =>
  nodes.some((node) => obj.type.fieldType.type === Options.name && node.id === obj.type.fieldType.name);

export const isUnionArg = (input: string): boolean => unionArray.findIndex((u) => u.fields.includes(input)) !== -1;
