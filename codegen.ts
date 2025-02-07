import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./src/graphql/schema.graphql",
    generates: {
        "./src/types/types.ts": {
            plugins: ["typescript", "typescript-resolvers"]
        }
    }
};

export default config;
