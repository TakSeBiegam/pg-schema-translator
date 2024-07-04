import assert from 'node:assert';
import test, { describe } from 'node:test';
import { Parser } from 'graphql-js-tree';
// import { MockSchema } from '../tools/mocks.js';

// describe('GraphQL mocks[simple] tests', () => {
//   const expect = `CREATE GRAPH TYPE MockGraphType STRICT {
//   (QueryType: QueryType { currentVersion STRING }),
// }`.replaceAll(' ', '');
//   const result = convertGraph('Mock', Parser.parse(MockSchema.simple).nodes).replaceAll(' ', '');
//   test('simple GraphQL schema', () => {
//     assert.strictEqual(result, expect);
//   });
// });

// describe('GraphQL mocks[full] tests', () => {
//   const expect = `CREATE GRAPH TYPE MockGraphType STRICT {
//     (QueryType: QueryType { currentVersion STRING }),
//   }`.replaceAll(' ', '');
//   const result = convertGraph('Mock', Parser.parse(MockSchema.simple).nodes).replaceAll(' ', '');
//   test('simple GraphQL schema', () => {
//     assert.strictEqual(result, expect);
//   });
// });

describe('HelloWorld test', () => test('print hello world', () => assert.equal(1 + 1, 2)));
