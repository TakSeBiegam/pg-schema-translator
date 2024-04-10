"use strict";
exports.__esModule = true;
var input = "\ntype Post{\n  name: String!\n  content: String!\n  createdAt: String!\n}\n\ntype Query{\n  version:String\n}\ntype Mutation{\n  version:String\n}\n";
var transform_graphql_1 = require("transform-graphql");
var transformation_1 = require("./transformation");
var transformedSchema = (0, transform_graphql_1.TransformGraphQLSchema)({
    schema: input,
    transformers: [transformation_1.transformerCRUD]
});
console.log("hi");
console.log(transformedSchema);
