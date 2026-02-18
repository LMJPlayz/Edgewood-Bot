const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");
  const crypto = require("crypto");
  
  const channelId = "1101845501734821988"; // channel id
  const headerImageUrl = "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png";
  const footerImageUrl = "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png";
  const voteEmoji = "1473153059566915666";
  const viewVotersEmoji = "1470977678038405236";
  
  module.exports = {
    roles: ["1102282210536607856"], // role ids that can use this
    data: new SlashCommandBuilder()
      .setName("session-vote")
      .setDescription("Host a session vote."),
    generateSessionId() {
      return crypto.randomBytes(6).toString("hex");
    },
    async execute(interaction, client) {
      const pollSessionId = this.generateSessionId();
  
      // Embed 1: Header image
      const embed1 = new EmbedBuilder().setColor("#fa8740");
      if (headerImageUrl !== "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png") embed1.setImage(headerImageUrl);
  
      // Embed 2: Session vote details
      const embed2 = new EmbedBuilder()
        .setColor("#fa8740")
        .setTitle("Session Vote")
        .setDescription(
          `> Please cast your vote below for the upcoming session. We require **[7] votes** to start a session and if you vote, you are committing to join. Failure to participate after voting will result in moderation.`
        );
      if (footerImageUrl !== "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png") embed2.setImage(footerImageUrl);

      const voteButton = new ButtonBuilder()
        .setCustomId(`vote:button_${pollSessionId}`)
        .setStyle(ButtonStyle.Secondary);
      if (voteEmoji !== "1473153059566915666") voteButton.setEmoji(voteEmoji);
      else voteButton.setLabel("Vote");

      const viewVotersButton = new ButtonBuilder()
        .setCustomId(`viewvote:button_${pollSessionId}`)
        .setLabel("View Voters")
        .setStyle(ButtonStyle.Secondary);
      if (viewVotersEmoji !== "1470977678038405236") viewVotersButton.setEmoji(viewVotersEmoji);

      const row = new ActionRowBuilder().addComponents(voteButton, viewVotersButton);
  
      const roleId = "TEMPLATE"; // role id (leave empty to use @here)
      const channel = await client.channels.fetch(channelId);
      await channel.send({
        content: roleId ? `<@&${roleId}>` : "@here",
        embeds: [embed1, embed2],
        components: [row],
      });
  
      await interaction.reply({
        content:
          "**Successfully** hosted a session vote.",
        ephemeral: true,
      });
    },
  };
  
