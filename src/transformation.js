"use strict";
exports.__esModule = true;
exports.transformerCRUD = void 0;
var graphql_js_tree_1 = require("graphql-js-tree");
exports.transformerCRUD = {
    transformer: function (_a) {
        var field = _a.field, operations = _a.operations;
        if (!field.args) {
            throw new Error('Model can be used only for types');
        }
        if (!operations.query) {
            throw new Error('Query type required');
        }
        if (!operations.mutation) {
            throw new Error('Query type required');
        }
        return "\n        input Create".concat(field.name, "{\n            ").concat(graphql_js_tree_1.TreeToGraphQL.parse({ nodes: field.args }), "\n        }\n        input Update").concat(field.name, "{\n            ").concat(graphql_js_tree_1.TreeToGraphQL.parse({ nodes: field.args }), "\n        }\n        input Details").concat(field.name, "{\n            id: String!\n        }\n        type ").concat(field.name, "Query{\n            list: [").concat(field.name, "!]!\n            getByDetails(details: Details").concat(field.name, "): ").concat(field.name, "\n        }\n        type ").concat(field.name, "Mutation{\n            create( ").concat(field.name[0].toLowerCase() + field.name.slice(1), ": Create").concat(field.name, " ): String!\n            update( ").concat(field.name[0].toLowerCase() + field.name.slice(1), ": Update").concat(field.name, ", details: Details").concat(field.name, " ): String!\n            remove( details: Details").concat(field.name, " ): String!\n        }\n        extend type ").concat(operations.query.name, "{\n            ").concat(field.name[0].toLowerCase() + field.name.slice(1), ": ").concat(field.name, "Query\n        }\n        extend type ").concat(operations.mutation.name, "{\n            ").concat(field.name[0].toLowerCase() + field.name.slice(1), ": ").concat(field.name, "Mutation\n        }\n        ");
    },
    directiveName: ''
};
