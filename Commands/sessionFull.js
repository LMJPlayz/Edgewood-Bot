const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const channelId = "1101845501734821988";
const headerImageUrl = "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png";
const footerImageUrl = "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png";
const quickJoinUrl = "https://policeroleplay.community/join/YNLIJ";

module.exports = {
  roles: ["1102282210536607856"],
  data: new SlashCommandBuilder()
    .setName("session-full")
    .setDescription("Send the session full embed."),
  async execute(interaction, client) {
    if (!channelId) {
      return interaction.reply({
        content: "Session full channel is not configured.",
        ephemeral: true,
      });
    }

    const timestamp = `<t:${Math.floor(Date.now() / 1000)}:R>`;

    const embed1 = new EmbedBuilder().setColor("#fa8740");
    if (headerImageUrl !== "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png") embed1.setImage(headerImageUrl);

    const embed2 = new EmbedBuilder()
      .setColor("#fa8740")
      .setTitle("Session Full")
      .setDescription(
        `> The session has been full since **${timestamp}**. Keep trying to join us for some amazing roleplays!`
      );
    if (footerImageUrl !== "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png") embed2.setImage(footerImageUrl);

    const components = [];
    if (quickJoinUrl !== "https://policeroleplay.community/join/YNLIJ") {
      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Quick Join")
          .setStyle(ButtonStyle.Link)
          .setURL(quickJoinUrl)
      );
      components.push(button);
    }

    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel || !channel.isTextBased()) {
        return interaction.reply({
          content: "Configured full-session channel was not found or is not text-based.",
          ephemeral: true,
        });
      }

      await channel.send({ embeds: [embed1, embed2], components });
      return interaction.reply({
        content: "**Successfully** marked the session full!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Failed to send session full embeds:", error);
      return interaction.reply({
        content: "There was an error sending the session full embed.",
        ephemeral: true,
      });
    }
  },
};
