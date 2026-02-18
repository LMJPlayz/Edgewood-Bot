const fs = require("fs");
const path = require("path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
} = require("discord.js");

require("dotenv").config();

const token = process.env.BOT_TOKEN || process.env.DISCORD_TOKEN;
const prefix = process.env.PREFIX || "!";

if (!token) {
  throw new Error("Missing BOT_TOKEN (or DISCORD_TOKEN) in environment.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
});

client.config = {
  prcKey: process.env.PRC_KEY || "TEMPLATE_PRC_KEY",
  prcApiBase: process.env.PRC_API_BASE_URL || "",
};

client.commands = new Collection();
client.buttons = new Collection();
client.messageCommands = new Collection();
client.voteMap = new Map();
client.startingSessions = new Set();

function getJsFiles(dirName) {
  const dir = path.join(__dirname, dirName);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".js"))
    .map((file) => path.join(dir, file));
}

function hasRequiredRole(member, roles) {
  const roleIds = Array.isArray(roles) ? roles.filter(Boolean) : [];
  if (roleIds.length === 0) return true;
  return roleIds.some((roleId) => member.roles.cache.has(roleId));
}

for (const filePath of getJsFiles("Commands")) {
  const command = require(filePath);
  if (!command?.data?.name || typeof command.execute !== "function") continue;
  client.commands.set(command.data.name, command);
}

for (const filePath of getJsFiles("Buttons")) {
  const button = require(filePath);
  if (!button?.customID || typeof button.execute !== "function") continue;
  client.buttons.set(button.customID, button);
}

for (const filePath of getJsFiles("Messages")) {
  const messageCommand = require(filePath);
  if (!messageCommand?.name || typeof messageCommand.execute !== "function") continue;
  client.messageCommands.set(messageCommand.name.toLowerCase(), messageCommand);
}

for (const filePath of getJsFiles("Event")) {
  const event = require(filePath);
  if (!event?.name || typeof event.execute !== "function") continue;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (!hasRequiredRole(interaction.member, command.roles)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(`[command] ${interaction.commandName} failed:`, error);
      const payload = {
        content: "There was an error while executing this command.",
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
    return;
  }

  if (interaction.isButton()) {
    const [baseId, ...args] = interaction.customId.split("_");
    const button = client.buttons.get(baseId) || client.buttons.get(interaction.customId);
    if (!button) return;

    try {
      await button.execute(interaction, client, args);
    } catch (error) {
      console.error(`[button] ${interaction.customId} failed:`, error);
      const payload = {
        content: "There was an error processing that button.",
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const withoutPrefix = message.content.slice(prefix.length).trim();
  if (!withoutPrefix) return;

  const parts = withoutPrefix.split(/\s+/);
  const name = (parts.shift() || "").toLowerCase();
  const args = parts;
  const command = client.messageCommands.get(name);
  if (!command) return;

  if (!hasRequiredRole(message.member, command.roles)) {
    return message.reply("You do not have permission to use this command.");
  }

  try {
    await command.execute(message, client, args);
  } catch (error) {
    console.error(`[message] ${name} failed:`, error);
    await message.reply("There was an error while running that command.").catch(() => {});
  }
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

async function start() {
  await client.login(token);
}

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});
