const full_schema = `
type Post {
  name: String!
  content: String!
  createdAt: String!
  comments: Comment!
}

type Comment {
  title: String!
  isLiked: Likes!
}

type Likes {
  liked: Boolean!
  loved: Boolean!
}

type Query {
  publicQuery: PublicQuery
  userQuery: UserQuery
}

type PublicQuery {
  version: String!
}

type User {
  username: String! @constraint(format: "^[0-9a-zA-Z]*$")
  nickname: String! @constraint(maxLength: 2137)
  sex: SEX
  friends: [String!]!
  payments: AccountType!
}

union AccountType = Company | Personal

type Company {
  title: String!
  NIP: String!
}

type Personal {
  firstName: String!
  lastName: String!
}

type UserQuery {
  me: User!
  getPost(id: String!): Post!
}

enum SEX {
  M
  F
}

schema {
  query: Query
}
`;

const simple_inheritance = `
interface Salaried {
  salary: Int!
}

interface Person {
  name: String!
  birthday: Date
}

type employee implements Salaried & Person {
  salary: Int!
  name: String!
  birthday: Date
  _id: String!
}

type Query {
  emp: employee!
}

schema {
  query: Query
}
`;

const simple_union_2 = `
type Book {
  title: String!
}

union SearchResult = Book | Author

type Author {
  name: String!
}

type Query {
  search(contains: String): [SearchResult]!
}

schema {
  query: Query
}
`;
const simple_union = `
type Query {
  currentVersion: String!
  payments: Account!
}
schema {
  query: Query
}

union Account = Company | Personal

type Company {
  title: String!
  NIP: String!
}

type Personal {
  firstName: String!
  lastName: String!
}
`;

const simple_graphql = `
type Query {
  currentVersion: String!
}
schema {
  query: Query
}
`;

export const GraphQLMocks = { full_schema, simple_graphql, simple_inheritance, simple_union, simple_union_2 };
