import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./graphql/typedefs";
import { resolvers } from "./graphql/resolvers";

const startApolloServer = async () => {
    const server = new ApolloServer({ typeDefs, resolvers });

    const { url } = await startStandaloneServer(server, {
     /*   context: async () => {
      *   const { cache } = server;
            return {
                dataSources: {
                    source: new Source();
                }
            };
        }
*/
    });

    console.log(
`
Server running at:
${url}
`
    );
};

startApolloServer();
