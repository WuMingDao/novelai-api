import { Client } from "discordx";
import { IntentsBitField, Events, Interaction } from "discord.js";
import "./commands/nai.js";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.MessageContent,
  ],
  silent: false,

  simpleCommand: {
    prefix: "!",
  },
});

client.on(Events.ClientReady, async () => {
  console.log(">> Bot started");

  // to create/update/delete discord application commands
  await client.initApplicationCommands();
});

client.on(Events.InteractionCreate, (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.login(BOT_TOKEN);
