const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

require("dotenv").config();

const token = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID || process.env.APPLICATION_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  throw new Error("Missing BOT_TOKEN (or DISCORD_TOKEN) in environment.");
}

if (!clientId) {
  throw new Error("Missing CLIENT_ID (or APPLICATION_ID) in environment.");
}

const commandsPath = path.join(__dirname, "Commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

const commands = [];
for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command?.data?.toJSON) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(token);

async function deploy() {
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log(`Deployed ${commands.length} command(s) to guild ${guildId}.`);
    return;
  }

  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log(`Deployed ${commands.length} global command(s).`);
}

deploy().catch((error) => {
  console.error("Command deployment failed:", error);
  process.exit(1);
});
