import { readFileSync } from 'fs';
import path from 'path';

export const typeDefs = readFileSync(
    path.resolve(__dirname, "../../src/graphql/schema.graphql"), {
        encoding: "utf-8"
    }
);
