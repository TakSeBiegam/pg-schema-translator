import { Options, ParserField, TypeDefinition, TypeSystemDefinition } from 'graphql-js-tree';
import { GqlEnum, GqlInterface, GqlUnion } from './types.js';
import { checkIfNodeIsObject, isGqlScalar, isUnion, isUnionArg } from './checkers.js';
import { findUnionAndReturn, getEnums, getInterfaces, getObjects, getUnions } from './getters.js';
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
export let interfacesArray: GqlInterface[] = [];
let unionEdgeTypes: string[] = [];
let nestedObjects: string[] = [];

const cleanUpArrays = () => {
  enumArray = [];
  unionArray = [];
  objectsArray = [];
  interfacesArray = [];
  unionEdgeTypes = [];
  nestedObjects = [];
};

const reduceArgumentsWithInterfaces = (args: ParserField[], listOfInterfaces: string[]) => {
  const interfaceFields = new Set();
  interfacesArray.forEach((interfaceObj) => {
    if (listOfInterfaces.includes(interfaceObj.name)) {
      interfaceObj.fields.forEach((field) => interfaceFields.add(field));
    }
  });
  return args.filter((arg) => !interfaceFields.has(arg.name));
};

const createExclusiveEdgeTypes = (baseType: string, middleType: string, targetType: string) =>
  `FOR y WITHIN (:${baseType}Type)-[y:${middleType}]->(:${targetType}Type) EXCLUSIVE x, z WITHIN (x:${baseType}Type)-[y]->(z:${targetType}Type),`;

const createResolver = (node: ParserField) => {
  const prefix = `\n  (${node.name}Type: `;
  let keys: string[] = [];
  let args = node.args;
  if (node.interfaces.length !== 0) {
    args = reduceArgumentsWithInterfaces(node.args, node.interfaces);
  }
  keys = args
    .map((arg) => {
      const isRequired =
        arg.type.fieldType.type === Options.required ||
        (arg.type.fieldType.type === Options.name && isUnionArg(arg.type.fieldType.name));
      const isNested = checkIfNodeIsObject(arg, objectsArray);
      if (
        arg.type.fieldType.type === Options.required &&
        arg.type.fieldType.nest.type === Options.name &&
        isUnion(arg.type.fieldType.nest.name)
      ) {
        if (arg.type)
          unionEdgeTypes.push(
            `(:${node.name}Type)-[${arg.name}Type: ${arg.name}]->(:${findUnionAndReturn(
              arg.type.fieldType.nest.name,
            )}Type)`,
          );
        unionEdgeTypes.push(createExclusiveEdgeTypes(node.name, arg.name, arg.type.fieldType.nest.name));
        return ``;
      }
      if (
        arg.type.fieldType.type === Options.required &&
        arg.type.fieldType.nest.type === Options.name &&
        !isGqlScalar(arg.type.fieldType.nest.name) &&
        !isUnion(arg.type.fieldType.nest.name)
      ) {
        nestedObjects.push(
          `(:${node.name}Type)-[${arg.type.fieldType.nest.name}Type: ${arg.type.fieldType.nest.name}]->(:${arg.type.fieldType.nest.name}Type)`,
        );
        return ``;
      }
      const curArg =
        arg.data.type === TypeSystemDefinition.UnionMemberDefinition
          ? arg.name + 'Type'
          : arg.type.fieldType.type === Options.name
          ? convertToEnumOrScalar(arg.type.fieldType)
          : arg.type.fieldType.nest.type === Options.name
          ? convertToUnionOrScalar(arg.type.fieldType.nest.name)
          : arg.type.fieldType.nest.type === Options.array
          ? convertToArrayScalar(arg.type.fieldType.nest)
          : (console.error(`NOT HANDLED TYPE (got: ${node})`), '<UNKNOWN>');
      const dir = arg.directives.length ? convertDirective(arg.directives[0]) : undefined;
      return `${isRequired ? '' : 'OPTIONAL '}${isNested ? curArg : arg.name + ' ' + curArg}${!!dir ? dir : ''}`;
    })
    .filter(Boolean);
  let suffix = ` }),`;
  if (node.interfaces.length !== 0) {
    suffix = ` )`;
  }
  let result = '';
  if (!keys.every((n) => n === '')) {
    result =
      prefix +
      (isUnion(node.name) ? '' : `${node.name} {`) +
      (isUnion(node.name) ? keys.join(' | ') : keys.join(', ')) +
      (node.interfaces.length ? ` } & ${node.interfaces.join(' & ')}` : '') +
      suffix;
  }

  return result;
};

export const CreateGraphWithoutInputs = (nodes: ParserField[]) => {
  let result = '';
  enumArray = getEnums(nodes);
  unionArray = getUnions(nodes);
  objectsArray = getObjects(nodes);
  interfacesArray = getInterfaces(nodes);
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.name === 'schema') continue;
    if (node.type.fieldType.type === Options.name && node.type.fieldType.name === 'enum') continue;
    result += node.args.every((arg) => arg && arg.args && arg.args.length > 0) ? '' : createResolver(node);
  }
  result += nestedObjects.map((no) => `\n  ${no}`);
  result += unionEdgeTypes.map((no) => `\n  ${no}`);
  cleanUpArrays();
  return result;
};

export const CreateGraphWithInputs = (nodes: ParserField[]) => {
  const result = nodes.flatMap((node, i) =>
    node.args.length
      ? node.args
          .flatMap((arg) => {
            if (arg.args.length) {
              const isRequired = arg.type.fieldType.type === Options.required;
              const isArray =
                arg.type.fieldType.type === Options.array ||
                (arg.type.fieldType.type === Options.required && arg.type.fieldType.nest.type === Options.array);
              const curArg =
                arg.type.fieldType.type === Options.name
                  ? convertScalarsToUpperCase(arg.type.fieldType.name)
                  : arg.type.fieldType.nest.type === Options.name
                  ? convertToUnionOrScalar(arg.type.fieldType.nest.name)
                  : arg.type.fieldType.nest.type === Options.array && arg.type.fieldType.nest.nest.type === Options.name
                  ? arg.type.fieldType.nest.nest.name
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
              )}]->(:${isRequired ? '' : ' OPTIONAL'}${curArg}Type ${isArray ? 'ARRAY' : ''})`;
            }
            return '';
          })
          .filter(Boolean)
      : '',
  );
  cleanUpArrays();
  return result;
};
