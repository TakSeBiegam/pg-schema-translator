import { TreeToGraphQL } from "graphql-js-tree";
import { TransformerDef } from "./parser";

export const transformerCRUD: TransformerDef = {
    transformer: ({ field, operations }) => {
        if (!field.args) {
            throw new Error('Model can be used only for types');
        }
        if (!operations.query) {
            throw new Error('Query type required');
        }
        if (!operations.mutation) {
            throw new Error('Query type required');
        }
        return `
        CREATE GRAPH TYPE ${field.name} STRICT {
            ${TreeToGraphQL.parse({ nodes: field.args })}
        }
        `;
    },
    directiveName: 'apply',
};