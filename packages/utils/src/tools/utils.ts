import { Options, ParserField, TypeSystemDefinition } from "graphql-js-tree";
import { GqlEnum, GqlInterface, GqlUnion } from "./types.js";
import {
  checkIfNodeIsObject,
  isGqlScalar,
  isUnion,
  isUnionArg,
} from "./checkers.js";
import {
  findUnionAndReturn,
  getEnums,
  getInterfaces,
  getObjects,
  getUnions,
} from "./getters.js";
import {
  convertDirective,
  convertScalarsToUpperCase,
  convertToArrayScalar,
  convertToEnumOrScalar,
  convertToUnionOrScalar,
} from "./converters.js";

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

const reduceArgumentsWithInterfaces = (
  args: ParserField[],
  listOfInterfaces: string[]
) => {
  const interfaceFields = new Set();
  interfacesArray.forEach((interfaceObj) => {
    if (listOfInterfaces.includes(interfaceObj.name)) {
      interfaceObj.fields.forEach((field) => interfaceFields.add(field));
    }
  });
  return args.filter((arg) => !interfaceFields.has(arg.name));
};

const createExclusiveEdgeTypes = (
  baseType: string,
  middleType: string,
  targetType: string
) =>
  `FOR y WITHIN (:${baseType}Type)-[y:${middleType}]->(:${targetType}Type) EXCLUSIVE x, z WITHIN (x:${baseType}Type)-[y]->(z:${targetType}Type),`;

const createEdgeType = (
  baseType: string,
  middleType: string,
  middleLabel: string,
  targetType: string,
  addComma?: boolean
) =>
  `(:${baseType}Type)-[${middleType}Type: ${middleLabel}]->(:${targetType}Type)`;

const createResolver = (node: ParserField): string => {
  const prefix = `\n  (${node.name}Type: `;
  let args = node.args;
  if (node.interfaces.length !== 0) {
    args = reduceArgumentsWithInterfaces(node.args, node.interfaces);
  }

  const keys = args
    .map((arg) => {
      const { type } = arg;
      const { fieldType } = type;
      const isRequired =
        fieldType.type === Options.required ||
        (fieldType.type === Options.name && isUnionArg(fieldType.name));
      const isNested = checkIfNodeIsObject(arg, objectsArray);

      if (
        fieldType.type === Options.required &&
        fieldType.nest.type === Options.name
      ) {
        const { nest } = fieldType;
        if (isUnion(nest.name)) {
          if (type) {
            unionEdgeTypes.push(
              createEdgeType(
                node.name,
                arg.name,
                arg.name,
                findUnionAndReturn(nest.name)
              )
            );
          }
          unionEdgeTypes.push(
            createExclusiveEdgeTypes(node.name, arg.name, nest.name)
          );
          return "";
        }
        if (!isGqlScalar(nest.name) && !isUnion(nest.name)) {
          nestedObjects.push(
            createEdgeType(node.name, nest.name, arg.name, nest.name, true)
          );
          return "";
        }
      }

      const curArg =
        arg.data.type === TypeSystemDefinition.UnionMemberDefinition
          ? `${arg.name}Type`
          : fieldType.type === Options.name
          ? convertToEnumOrScalar(fieldType)
          : fieldType.nest.type === Options.name
          ? convertToUnionOrScalar(fieldType.nest.name)
          : fieldType.nest.type === Options.array
          ? convertToArrayScalar(fieldType.nest)
          : (console.error(`NOT HANDLED TYPE (got: ${node})`), "<UNKNOWN>");

      const dir = arg.directives.length
        ? convertDirective(arg.directives[0])
        : undefined;
      return `${isRequired ? "" : "OPTIONAL "}${
        isNested ? curArg : `${arg.name} ${curArg}`
      }${dir ? dir : ""}`;
    })
    .filter(Boolean);

  const suffix = `),`;

  if (!keys.every((n) => n === "") || node.interfaces.length) {
    const interfacesPart = node.interfaces.length
      ? node.interfaces.map((i) => `${i}Type`).join(" & ")
      : "";
    const keysPart = !keys.every((n) => n === "")
      ? isUnion(node.name)
        ? keys.join(" | ")
        : `${node.name} { ${keys.join(", ")} }`
      : "";
    const joiner = keys.length && node.interfaces.length ? ` & ` : ``;

    return `${prefix}${interfacesPart}${joiner}${keysPart}${suffix}`;
  }

  return "";
};

export const CreateGraphWithoutInputs = (nodes: ParserField[]) => {
  let result = "";
  enumArray = getEnums(nodes);
  unionArray = getUnions(nodes);
  objectsArray = getObjects(nodes);
  interfacesArray = getInterfaces(nodes);
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (node.name === "schema") continue;
    if (
      node.type.fieldType.type === Options.name &&
      node.type.fieldType.name === "enum"
    )
      continue;
    result += node.args.every((arg) => arg && arg.args && arg.args.length > 0)
      ? ""
      : createResolver(node);
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
                (arg.type.fieldType.type === Options.required &&
                  arg.type.fieldType.nest.type === Options.array);
              const curArg =
                arg.type.fieldType.type === Options.name
                  ? convertScalarsToUpperCase(arg.type.fieldType.name)
                  : arg.type.fieldType.nest.type === Options.name
                  ? convertToUnionOrScalar(arg.type.fieldType.nest.name)
                  : arg.type.fieldType.nest.type === Options.array &&
                    arg.type.fieldType.nest.nest.type === Options.name
                  ? arg.type.fieldType.nest.nest.name
                  : "<UNKNOWN>";
              return `\n  (:${node.name}Type)-[${arg.args.flatMap(
                (input) =>
                  `${input.name}: ${
                    input.type.fieldType.type === Options.name
                      ? input.type.fieldType.name
                      : input.type.fieldType.nest.type === Options.name
                      ? input.type.fieldType.nest.name
                      : "<UNKNOWN>"
                  }`
              )}]->(:${isRequired ? "" : " OPTIONAL"}${curArg}Type ${
                isArray ? "ARRAY" : ""
              }),`;
            }
            return "";
          })
          .filter(Boolean)
      : ""
  );
  cleanUpArrays();
  return result;
};
