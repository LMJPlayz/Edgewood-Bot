const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const channelId = "1101845501734821988";
const notificationRoleId = "1094784246452863047";
const headerImageUrl = "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png";
const footerImageUrl = "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png";
const sessionsRoleEmoji = "1473153059566915666";

module.exports = {
  roles: ["1102282210536607856"],
  data: new SlashCommandBuilder()
    .setName("session-shutdown")
    .setDescription("Host a session shutdown."),

  async execute(interaction) {
    if (!channelId) {
      return interaction.reply({
        content: "Session shutdown channel is not configured.",
        ephemeral: true,
      });
    }

    const embed1 = new EmbedBuilder().setColor("#fa8740");
    if (headerImageUrl !== "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png") embed1.setImage(headerImageUrl);

    const embed2 = new EmbedBuilder()
      .setColor("#fa8740")
      .setTitle("Session Shutdown")
      .setDescription(
        `> The in-game server is currently on shutdown. Please refrain from attempting to join during this time. Be sure to obtain the ${notificationRoleId ? `<@&${notificationRoleId}>` : "notification"} role to be notified for the next session!`
      );
    if (footerImageUrl !== "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png") embed2.setImage(footerImageUrl);

    const bellButton = new ButtonBuilder()
      .setCustomId("sessionsRole:button")
      .setStyle(ButtonStyle.Secondary);

    if (sessionsRoleEmoji !== "1473153059566915666") {
      bellButton.setEmoji(sessionsRoleEmoji);
    } else {
      bellButton.setLabel("Session Alerts");
    }

    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: "Configured shutdown channel was not found or is not text-based.",
        ephemeral: true,
      });
    }

    await channel.send({
      embeds: [embed1, embed2],
      components: [new ActionRowBuilder().addComponents(bellButton)],
    });

    return interaction.reply({
      content: "**Successfully** hosted a session shutdown.",
      ephemeral: true,
    });
  },
};
