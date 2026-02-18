const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const axios = require("axios");
const SessionsModel = require("../Models/SessionsModel");

const channelId = "1101845501734821988"; // your channel id
const panelImageUrl = "https://image2url.com/r2/default/images/1771297289928-54c06d0a-abda-412e-9cc4-94d9c5c8e14a.png"; // panel image url
const bellEmoji = "1473153059566915666"; // emoji id

module.exports = {
  name: "sessions",
  description: "Sends the session panel",
  roles: ["1102282210536607856"],

  async execute(message, client) {

    const serverKey = client.config.prcKey;
    const apiBaseUrl = client.config.prcApiBase;

    if (!serverKey || serverKey === "TEMPLATE" || !apiBaseUrl || apiBaseUrl === "TEMPLATE") {
      return message.reply("Missing PRC_KEY or PRC_API_BASE_URL in .env");
    }

    // Fetch players + queue
    const [playersRes, queueRes] = await Promise.allSettled([
      axios.get(`${apiBaseUrl}/server/players`, {
        headers: { "Server-Key": serverKey },
      }),
      axios.get(`${apiBaseUrl}/server/queue`, {
        headers: { "Server-Key": serverKey },
      }),
    ]);

    const players = playersRes.status === "fulfilled" ? playersRes.value.data : [];
    const queue = queueRes.status === "fulfilled" ? queueRes.value.data : [];

    // Moderating count
    const staffRoleId = "1102282210536607856";

    await message.guild.members.fetch().catch(() => {});

    const moderatingCount =
      message.guild.members.cache.filter(m =>
        m.roles.cache.has(staffRoleId)
      ).size;

    // Role + times
    const notificationRoleId = "1094784246452863047";
    const weekdayTime = 1761147600;
    const weekendTime = 1760985600;

    const now = Math.floor(Date.now() / 1000);

    // Main embed
    const panelEmbed = new EmbedBuilder()
      .setColor("#fa8740")
      .setTitle("Session Status")
      .setDescription(
`> > <:Arrow:1470977678038405236> This channel is for all official session announcements, including **session start times, live updates, server codes, and session end notices.** **Edgewood Borough Roleplay** is committed to providing a realistic, structured, and professional ER:LC experience.

Do not ping staff for sessions — all updates will be posted here when available. You will be notified here when a staff member initiates a session. Do not attempt to join the server when it is shutdown.

> Ensure you have the <@&${notificationRoleId}> role to be notified when a session occurs. Our sessions typically occur sometime around <t:${weekdayTime}:t> on the weekdays and <t:${weekendTime}:t> on the weekends.

**Last Updated:** <t:${now}:R>`
      )
      .addFields(
        {
          name: "Players",
          value: `\`\`\`\n${players.length}\n\`\`\``,
          inline: true,
        },
        {
          name: "Moderating",
          value: `\`\`\`\n${moderatingCount}\n\`\`\``,
          inline: true,
        },
        {
          name: "Queue",
          value: `\`\`\`\n${queue.length}\n\`\`\``,
          inline: true,
        }
      )
      .setImage(panelImageUrl);

    // Buttons
    const statusBtn = new ButtonBuilder()
      .setCustomId("status:noop")
      .setLabel(players.length >= 1 ? "Server Online" : "Server Offline")
      .setStyle(players.length >= 1 ? ButtonStyle.Success : ButtonStyle.Danger)
      .setDisabled(true);

    const bellBtn = new ButtonBuilder()
      .setCustomId("sessionsRole:button")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(bellEmoji);

    const row = new ActionRowBuilder()
      .addComponents(statusBtn, bellBtn);

    // Send panel
    const channel = await message.guild.channels.fetch(channelId);

    const reply = await channel.send({
      embeds: [panelEmbed],
      components: [row],
    });

    // Save message
    await SessionsModel.deleteMany();

    await SessionsModel.set({
      channelId: reply.channel.id,
      messageId: reply.id,
    });

    message.delete().catch(() => {});

    // Auto update every 60 seconds
    const interval = setInterval(async () => {

      try {

        const [playersResU, queueResU] = await Promise.allSettled([
          axios.get(`${apiBaseUrl}/server/players`, {
            headers: { "Server-Key": serverKey },
          }),
          axios.get(`${apiBaseUrl}/server/queue`, {
            headers: { "Server-Key": serverKey },
          }),
        ]);

        const playersU =
          playersResU.status === "fulfilled"
            ? playersResU.value.data
            : [];

        const queueU =
          queueResU.status === "fulfilled"
            ? queueResU.value.data
            : [];

        await message.guild.members.fetch().catch(() => {});

        const moderatingCountU =
          message.guild.members.cache.filter(m =>
            m.roles.cache.has(staffRoleId)
          ).size;

        const updatedEmbed = new EmbedBuilder()
          .setColor("#fa8740")
          .setTitle("Session Status")
          .setDescription(
`> You will be notified here when a staff member initiates a session.

> Ensure you have the <@&${notificationRoleId}> role to be notified when a session occurs. Our sessions typically occur around <t:${weekdayTime}:t> weekdays and <t:${weekendTime}:t> weekends.

**Last Updated:** <t:${Math.floor(Date.now() / 1000)}:R>`
          )
          .addFields(
            {
              name: "Players",
              value: `\`\`\`\n${playersU.length}\n\`\`\``,
              inline: true,
            },
            {
              name: "Moderating",
              value: `\`\`\`\n${moderatingCountU}\n\`\`\``,
              inline: true,
            },
            {
              name: "Queue",
              value: `\`\`\`\n${queueU.length}\n\`\`\``,
              inline: true,
            }
          )
          .setImage(panelImageUrl);

        const statusBtnU = new ButtonBuilder()
          .setCustomId("status:noop")
          .setLabel(playersU.length >= 1 ? "Server Online" : "Server Offline")
          .setStyle(playersU.length >= 1 ? ButtonStyle.Success : ButtonStyle.Danger)
          .setDisabled(true);

        const bellBtnU = new ButtonBuilder()
          .setCustomId("sessionsRole:button")
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(bellEmoji);

        const rowU = new ActionRowBuilder()
          .addComponents(statusBtnU, bellBtnU);

        await reply.edit({
          embeds: [updatedEmbed],
          components: [rowU],
        });

      } catch (error) {

        if (error.code === 10008) {
          clearInterval(interval);
          return;
        }

        console.warn("Update error:", error);

      }

    }, 60000);

  },
};
