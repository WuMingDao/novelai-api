import { Client } from "discordx";
import { IntentsBitField, Events, Interaction } from "discord.js";
import { ProxyAgent } from "undici";
import "./commands/nai.js";

// 配置代理（如果设置了 HTTPS_PROXY 环境变量）
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) {
  const agent = new ProxyAgent(proxyUrl);
  // @ts-expect-error 设置全局 dispatcher
  global[Symbol.for("undici.globalDispatcher.1")] = agent;
  console.log(`>> Using proxy: ${proxyUrl}`);
}

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
