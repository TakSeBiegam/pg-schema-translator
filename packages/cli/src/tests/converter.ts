import assert from 'node:assert';
import test, { describe } from 'node:test';
import { Parser } from 'graphql-js-tree';
import { convertGraph } from '@pg-converter/utils';
import { GraphQLMocks } from './mocks.js';

describe('GraphQL mocks[simple] tests', () => {
  const expect = `CREATE GRAPH TYPE MockGraphType STRICT {
  (QueryType: Query { currentVersion STRING })
}`.replaceAll(' ', '');
  const result = convertGraph('Mock', Parser.parse(GraphQLMocks.simple_graphql).nodes).replaceAll(' ', '');
  test('simple GraphQL schema', () => {
    assert.strictEqual(result, expect);
  });
});

describe('GraphQL mocks[full] tests', () => {
  const expect = `CREATE GRAPH TYPE MockGraphType STRICT {
  (PostType: Post { name STRING, content STRING, createdAt STRING }),
  (CommentType: Comment { title STRING }),
  (LikesType: Likes { liked BOOLEAN, loved BOOLEAN }),
  (QueryType: Query { OPTIONAL PublicQuery, OPTIONAL UserQuery }),
  (PublicQueryType: PublicQuery { version STRING }),
  (UserType: User { username STRING ^[0-9a-zA-Z]*$, nickname STRING(2137), OPTIONAL sex ENUM("M","F") , friends STRING ARRAY }),
  (AccountTypeType: CompanyType | PersonalType),
  (CompanyType: Company { title STRING, NIP STRING }),
  (PersonalType: Personal { firstName STRING, lastName STRING }),
  (:PostType)-[CommentType: comments]->(:CommentType)
  (:CommentType)-[LikesType: isLiked]->(:LikesType)
  (:UserQueryType)-[UserType: me]->(:UserType)
  (:UserQueryType)-[PostType: getPost]->(:PostType),
  (:UserType)-[paymentsType: payments]->(:AccountTypeType)
  FOR y WITHIN (:UserType)-[y:payments]->(:AccountTypeType) EXCLUSIVE x, z WITHIN (x:UserType)-[y]->(z:AccountTypeType) 
  (:UserQueryType)-[id: String]->(:PostType )
}`.replaceAll(' ', '');
  const result = convertGraph('Mock', Parser.parse(GraphQLMocks.full_schema).nodes).replaceAll(' ', '');
  test('full GraphQL schema', () => {
    assert.strictEqual(result, expect);
  });
});
