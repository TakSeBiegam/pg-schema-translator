import { FieldType, Options, ParserField } from "graphql-js-tree";
import { GqlScalars } from "./scalars.js";
import { unionArray } from "./utils.js";
import { checkFieldTypeIsScalar, isUnion } from "./checkers.js";
import { getEnumByName } from "./getters.js";

export const convertDirective = (directive: ParserField) => {
  switch (directive.name) {
    case "constraint": {
      return handleConstraintDirective(directive.args[0]);
    }
    default:
      console.error("NOT HANDLED DIRECTIVE");
  }
};

const handleConstraintDirective = (arg: ParserField) => {
  switch (arg.name) {
    case "maxLength":
      return `(${arg.value ? arg.value.value : "<UNKNOWN>"})`;
    case "format":
    case "pattern":
      return ` ${arg.value ? arg.value.value : "<UNKNOWN>"}`;
    default:
      console.error(`NOT HANDLED CONSTRAINT DIRECTIVE ARGUMENT ${arg.name}`);
      break;
  }
};

export const convertScalarsToUpperCase = (input: string): string =>
  GqlScalars.indexOf(input.toUpperCase()) !== -1
    ? input.toUpperCase()
    : isUnion(input)
    ? `${input}`
    : input;

export const convertToEnumOrScalar = (obj: {
  type: Options.name;
  name: string;
}) =>
  checkFieldTypeIsScalar(obj.name)
    ? `ENUM(${getEnumByName(obj.name).fields.map((f) => `"${f}"`)}) `
    : convertScalarsToUpperCase(obj.name);

export const convertToArrayScalar = (obj: {
  type: Options.array;
  nest: FieldType;
}) => {
  console.log(obj);
  if (obj.nest.type === Options.required) {
    if (obj.nest.nest.type === Options.name) {
      return `${convertScalarsToUpperCase(obj.nest.nest.name)} ARRAY`;
    }
  }
  console.error(`NOT HANDLED TYPE (got: ${obj})`);
  return "<UNKNIOWN>";
};

export const convertToUnionOrScalar = (input: string) => {
  return isUnion(input)
    ? convertToUnion(input)
    : convertScalarsToUpperCase(input);
};

export const convertToUnion = (input: string) => {
  const union = unionArray.find((u) => u.name === input);
  if (union) {
    return union.fields.map((f) => f).join(" | ");
  }
  return "";
};
