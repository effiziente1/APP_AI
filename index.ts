import concurrently from "concurrently";

concurrently([
    {
        name: "server",
        command: "bun run dev",
        cwd: "./packages/server",
        prefixColor: "blue",
    },
    {
        name: "client",
        command: "npm start",
        cwd: "./packages/client/appAI",
        prefixColor: "green",
    }
]);
