const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  
  const channelId = "1101845501734821988"; // channel id
  const headerImageUrl = "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png";
  const footerImageUrl = "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png";
  const quickJoinUrl = "https://policeroleplay.community/join/YNLIJ"; // full url including https://
  
  module.exports = {
    roles: ["1102282210536607856"], // role ids that can use this
    data: new SlashCommandBuilder()
      .setName("session-boost")
      .setDescription("Sends a boost ping."),
  
    async execute(interaction, client) {
      const embed1 = new EmbedBuilder().setColor("#fa8740");
      if (headerImageUrl !== "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png") embed1.setImage(headerImageUrl);
  
      const embed2 = new EmbedBuilder()
        .setColor("#fa8740")
        .setTitle("Session Boost")
        .setDescription(
          "> The in-game server count is currently **low**. Join up to skip the queue and participate in some amazing roleplays!"
        );
      if (footerImageUrl !== "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png") embed2.setImage(footerImageUrl);
  
      const components = [];
      if (quickJoinUrl !== "https://policeroleplay.community/join/YNLI") {
        const startLinkButton = new ButtonBuilder()
          .setLabel("Quick Join")
          .setURL(quickJoinUrl)
          .setStyle(ButtonStyle.Link);
        components.push(new ActionRowBuilder().addComponents(startLinkButton));
      }
  
      const roleId = "TEMPLATE"; // role id (leave empty to use @here)
      const channel = await client.channels.fetch(channelId);
      await channel.send({
        content: roleId ? `<@&${roleId}>` : "@here",
        embeds: [embed1, embed2],
        components,
      });
  
      await interaction.reply({
        content:
          "**Successfully** sent session boost!",
        ephemeral: true,
      });
    },
  };
  
