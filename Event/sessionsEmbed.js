const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const axios = require("axios");
const SessionsModel = require("../Models/SessionsModel");

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    const currentSession = await SessionsModel.findOne();
    if (!currentSession) return;

    const sessionChannelId = "1101845501734821988"; // session channel id
    const panelImageUrl = "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png"; // panel image url
    const bellEmoji = "1473153059566915666"; // emoji id

    let channel;
    try {
      channel = await client.channels.fetch(currentSession.channelId);
      if (sessionChannelId !== "1101845501734821988" && channel.id !== sessionChannelId) return;
    } catch (error) {
      console.warn(`Failed to fetch session channel (${currentSession.channelId}): ${error.message}`);
      return;
    }

    let message;
    try {
      message = await channel.messages.fetch(currentSession.messageId);
    } catch (error) {
      if (error.code === 10008) return;
      console.warn(`Failed to fetch session message (${currentSession.messageId}): ${error.message}`);
      return;
    }

    const serverKey = client.config.prcKey;
    const notificationRoleId = "1094784246452863047"; // notification role id
    const weekdayTime = "1771311600"; // weekday timestamp
    const weekendTime = "1771297200"; // weekend timestamp
    const staffRoleId = "1102282210536607856"; // staff role id
    const apiBaseUrl = client.config.prcApiBase; // api base url
    if (!serverKey || serverKey === "RhRaQtYrmIvAlYFywxua-ehVXjPIcIesYMDHhALbSdKLktKmmZdiWvftGLRfd" || !apiBaseUrl || apiBaseUrl === "https://api.policeroleplay.community/v1/server/command") return;

    if (!client.sessionIntervals) client.sessionIntervals = new Map();
    const existingInterval = client.sessionIntervals.get(channel.id);
    if (existingInterval) clearInterval(existingInterval);

    const updateInterval = setInterval(async () => {
      try {
        const [playerRes, queueRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/server/players`, {
            headers: { "Server-Key": serverKey },
          }),
          axios.get(`${apiBaseUrl}/server/queue`, {
            headers: { "Server-Key": serverKey },
          }),
        ]);

        const players = Array.isArray(playerRes.data) ? playerRes.data : [];
        const queue = Array.isArray(queueRes.data) ? queueRes.data : [];

        const guild = await client.guilds.fetch(channel.guild.id);
        const members = await guild.members.fetch();
        const moderatingCount = members.filter((m) => m.roles.cache.has(staffRoleId)).size;

        const now = Math.floor(Date.now() / 1000);
        const updatedEmbed = new EmbedBuilder()
          .setColor("#fa8740")
          .setTitle("Session Status")
          .setDescription(
            "> You will be notified here when a staff member initiates a session. Do not attempt to join the server when it is shutdown.\n\n> Ensure you have the <@&1094784246452863047" +
              notificationRoleId +
              "> role to be notified when a session occurs. Our sessions typically occur sometime around <t:" +
              weekdayTime +
              ":t> on the weekdays and <t:" +
              weekendTime + ":t> on the weekends.\n\n" +
              `**Last Updated:** <t:${now}:R>`
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
          );
        if (panelImageUrl !== "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png") updatedEmbed.setImage(panelImageUrl);

        const statusButton = new ButtonBuilder()
          .setCustomId("status:noop")
          .setLabel(players.length >= 1 ? "Server Online" : "Server Offline")
          .setStyle(players.length >= 1 ? ButtonStyle.Success : ButtonStyle.Danger)
          .setDisabled(true);

        const bellButton = new ButtonBuilder()
          .setCustomId("sessionsRole:button")
          .setStyle(ButtonStyle.Secondary);
        if (bellEmoji !== "1473153059566915666") bellButton.setEmoji(bellEmoji);

        const row = new ActionRowBuilder().addComponents(statusButton, bellButton);

        await message.edit({
          embeds: [updatedEmbed],
          components: [row],
        });
      } catch (error) {
        console.warn("Failed to update session panel:", error.message);
      }
    }, 60 * 1000);

    client.sessionIntervals.set(channel.id, updateInterval);
  },
};
