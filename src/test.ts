import { Options, Parser, ParserField, TreeToGraphQL } from 'graphql-js-tree';

const input = `
type Post{
  name: String!
  content: String!
  createdAt: String!
}

type Query{
  publicQuery: PublicQuery
  userQuery: UserQuery
}

type PublicQuery{
  version: String!
}

type User {
  username: String!
  sex: Sex!
}

type UserQuery {
  me: User!
  getPosts(
    input: getPostsInput
  ): [Post!]
  getPost(
    id: String!
  ): Post!
}

input getPostsInput {
  content: String!
  fromTime: Int
}

enum Sex {
  F
  M
}

schema {
  query: Query
}
`;

const GqlScalars = ['INT', 'FLOAT', 'STRING', 'BOOLEAN', 'ID'];

const convertScalarsToUpperCase = (input: string): string =>
  GqlScalars.indexOf(input.toUpperCase()) !== -1 ? input.toUpperCase() : input;

const CreateGraphWithoutInputs = (nodes: ParserField[]) => {
  let result = '';
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    result += node.args.every((arg) => arg && arg.args && arg.args.length > 0)
      ? ''
      : `\n  (${node.name}: ${node.name} {` +
        node.args.map((arg) => {
          const isRequired = arg.type.fieldType.type === Options.required;
          const curArg =
            arg.type.fieldType.type === Options.name
              ? convertScalarsToUpperCase(arg.type.fieldType.name)
              : arg.type.fieldType.nest.type === Options.name
              ? convertScalarsToUpperCase(arg.type.fieldType.nest.name)
              : '<UNKNOWN>';
          return ` ${arg.name}: ${curArg}${isRequired ? '!' : ''}`;
        }) +
        ` }),`;
  }
  return result;
};

const CreateGraphWithInputs = (nodes: ParserField[]) => {
  return nodes.flatMap((node, i) =>
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
              return `\n  (:${node.name})-[${arg.args.flatMap(
                (input) =>
                  `${input.name}: ${
                    input.type.fieldType.type === Options.name
                      ? input.type.fieldType.name
                      : input.type.fieldType.nest.type === Options.name
                      ? input.type.fieldType.nest.name
                      : '<UNKNOWN>'
                  }`,
              )}]->(:${curArg})`;
            }
            return '';
          })
          .filter(Boolean)
      : '',
  );
};

const convertGraph = (title: string, nodes: ParserField[]) => {
  return (
    `CREATE GRAPH TYPE ${title}GraphType STRICT { ` +
    CreateGraphWithoutInputs(nodes) +
    CreateGraphWithInputs(nodes) +
    `\n}`
  );
};

// const rawGql = tokenizeGraphql(input);
const nodes = Parser.parse(input).nodes.filter((node) => node.name !== 'schema');
console.log(convertGraph('schema', nodes));
// console.log(JSON.parse(JSON.stringify(nodes[0].args[0].type.fieldType)));
// const preParsedGql = findParentForNodes(rawGql);
// console.log(preParsedGql);
// const pgGraph = createGraph("First", preParsedGql);
// console.log(pgGraph);
