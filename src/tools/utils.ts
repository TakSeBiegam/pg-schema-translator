import { FieldType, Options, ParserField, TypeDefinition } from 'graphql-js-tree';
import { GqlEnum, GqlUnion } from './types.js';
import { checkFieldTypeIsScalar, checkIfNodeIsObject, isGqlScalar, isUnion } from './checkers.js';
import { getEnumByName, getEnums, getObjects, getUnions } from './getters.js';
import {
  convertDirective,
  convertScalarsToUpperCase,
  convertToArrayScalar,
  convertToEnumOrScalar,
  convertToUnionOrScalar,
} from './converters.js';

export let enumArray: GqlEnum[] = [];
export let unionArray: GqlUnion[] = [];
export let objectsArray: ParserField[] = [];

const createResolver = (node: ParserField) => {
  let nestedObjects: string[] = [];
  const prefix = `\n  (${node.name}Type: ${node.name} {`;
  const nodes = node.args.map((arg) => {
    const isRequired = arg.type.fieldType.type === Options.required;
    const isNested = checkIfNodeIsObject(arg, objectsArray);
    if (
      arg.type.fieldType.type === Options.required &&
      arg.type.fieldType.nest.type === Options.name &&
      !isGqlScalar(arg.type.fieldType.nest.name) &&
      !isUnion(arg.type.fieldType.nest.name)
    ) {
      nestedObjects.push(
        `(:${node.name}Type)-[${arg.type.fieldType.nest.name}: ${arg.type.fieldType.nest.name}Type]->(:${arg.type.fieldType.nest.name}Type)`,
      );
      return ``;
    }
    const curArg =
      arg.type.fieldType.type === Options.name
        ? convertToEnumOrScalar(arg.type.fieldType)
        : arg.type.fieldType.nest.type === Options.name
        ? convertToUnionOrScalar(arg.type.fieldType.nest.name)
        : arg.type.fieldType.nest.type === Options.array
        ? convertToArrayScalar(arg.type.fieldType.nest)
        : (console.error(`NOT HANDLED TYPE (got: ${node})`), '<UNKNOWN>');
    const dir = arg.directives.length ? convertDirective(arg.directives[0]) : undefined;
    return `${isRequired ? '' : ' OPTIONAL'} ${isNested ? curArg : arg.name + ' ' + curArg}${!!dir ? dir : ''}`;
  });
  const suffix = ` }),`;
  let result = '';
  if (!nodes.every((n) => n === '')) {
    result = prefix + nodes.map((n) => n) + suffix;
  }
  result += nestedObjects.map((no) => `\n  ${no}`);
  return result;
};

const cleanUpArrays = () => {
  enumArray = [];
  unionArray = [];
  objectsArray = [];
};

export const CreateGraphWithoutInputs = (nodes: ParserField[]) => {
  let result = '';
  enumArray = getEnums(nodes);
  unionArray = getUnions(nodes);
  objectsArray = getObjects(nodes);
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.name === 'schema') continue;
    if (node.type.fieldType.type === Options.name && node.type.fieldType.name === 'enum') continue;
    result += node.args.every((arg) => arg && arg.args && arg.args.length > 0) ? '' : createResolver(node);
  }
  cleanUpArrays();
  return result;
};

export const CreateGraphWithInputs = (nodes: ParserField[]) => {
  const result = nodes.flatMap((node, i) =>
    node.args.length
      ? node.args
          .flatMap((arg) => {
            if (arg.args.length) {
              const curArg =
                arg.type.fieldType.type === Options.name
                  ? convertScalarsToUpperCase(arg.type.fieldType.name)
                  : arg.type.fieldType.nest.type === Options.name
                  ? convertScalarsToUpperCase(arg.type.fieldType.nest.name)
                  : '<UNKNOWN>';
              return `\n  (:${node.name}Type)-[${arg.args.flatMap(
                (input) =>
                  `${input.name}: ${
                    input.type.fieldType.type === Options.name
                      ? input.type.fieldType.name
                      : input.type.fieldType.nest.type === Options.name
                      ? input.type.fieldType.nest.name
                      : '<UNKNOWN>'
                  }`,
              )}]->(:${curArg}Type)`;
            }
            return '';
          })
          .filter(Boolean)
      : '',
  );
  cleanUpArrays();
  return result;
};
