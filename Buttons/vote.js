const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");

const cooldowns = new Map();

const REQUIRED_VOTES = 7;
const COOLDOWN_MS = 5000;

const VOTE_EMOJI = "1473153059566915666";
const VIEW_VOTERS_EMOJI = "1470977678038405236";
const QUICK_JOIN_URL = "https://policeroleplay.community/join/YNLIJ";
const QUICK_JOIN_EMOJI = "1470977678038405236";
const ROLE_ID = "1077348613119811706";
const HEADER_IMAGE_URL = "https://image2url.com/r2/default/images/1771382669654-22f7774d-f65f-45f8-90b5-820bfd168fbf.png";
const FOOTER_IMAGE_URL = "https://image2url.com/r2/default/images/1771382741713-1d449ef2-5033-4450-bfd8-8c21e862276a.png";
const SERVER_NAME = "Edgewood Borough Roleplay |Strict|VC Optional";
const SERVER_OWNER = "Booskiboo1227";
const JOIN_CODE = "YNLIJ";

function isTemplate(value) {
  return !value || value === "TEMPLATE";
}

function applyButtonIdentity(button, { label, emoji }) {
  if (!isTemplate(emoji)) {
    button.setEmoji(emoji);
    return;
  }

  button.setLabel(label);
}

function buildVoteButtonsRow(sessionId, count) {
  const voteBtn = new ButtonBuilder()
    .setCustomId(`vote:button_${sessionId}`)
    .setStyle(ButtonStyle.Secondary);
  applyButtonIdentity(voteBtn, { label: "Vote", emoji: VOTE_EMOJI });

  const viewBtn = new ButtonBuilder()
    .setCustomId(`viewvote:button_${sessionId}`)
    .setStyle(ButtonStyle.Secondary)
    .setLabel(`View Voters (${count})`);
  if (!isTemplate(VIEW_VOTERS_EMOJI)) viewBtn.setEmoji(VIEW_VOTERS_EMOJI);

  return new ActionRowBuilder().addComponents(voteBtn, viewBtn);
}

function buildSessionStartupEmbeds() {
  const headerEmbed = new EmbedBuilder().setColor("#37373E");
  if (!isTemplate(HEADER_IMAGE_URL)) headerEmbed.setImage(HEADER_IMAGE_URL);

  const infoEmbed = new EmbedBuilder()
    .setColor("#fa8740")
    .setTitle("Session Startup")
    .setDescription(
      "> A server start-up has been initiated! Please ensure you have read and understood our regulations prior to joining.\n\n" +
        "**Game Information**\n" +
        `> **Server Name**: ${isTemplate(SERVER_NAME) ? "TBD" : SERVER_NAME}\n` +
        `> **Server Owner**: ${isTemplate(SERVER_OWNER) ? "TBD" : SERVER_OWNER}\n` +
        `> **Join Code**: ${isTemplate(JOIN_CODE) ? "TBD" : JOIN_CODE}\n`
    );
  if (!isTemplate(FOOTER_IMAGE_URL)) infoEmbed.setImage(FOOTER_IMAGE_URL);

  return { headerEmbed, infoEmbed };
}

module.exports = {
  customID: "vote:button",
  execute: async function (interaction, client, args) {
    const sessionId = args[0];
    if (!sessionId) {
      return interaction.reply({
        content: "Invalid vote button payload. Try running `/session-vote` again.",
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const now = Date.now();
    const expiresAt = cooldowns.get(userId);
    if (expiresAt && now < expiresAt) {
      const relative = `<t:${Math.floor(expiresAt / 1000)}:R>`;
      return interaction.reply({
        content: `You are on **cooldown**, please try again ${relative}.`,
        ephemeral: true,
      });
    }
    cooldowns.set(userId, now + COOLDOWN_MS);

    if (!client.voteMap) client.voteMap = new Map();
    if (!client.startingSessions) client.startingSessions = new Set();

    if (!client.voteMap.has(sessionId)) {
      client.voteMap.set(sessionId, new Map());
      client.activePollId = sessionId;
    }

    const sessionVotes = client.voteMap.get(sessionId);
    const hasVoted = sessionVotes.has(userId);

    if (hasVoted) {
      sessionVotes.delete(userId);
    } else {
      sessionVotes.set(userId, now);
    }

    await interaction.update({
      components: [buildVoteButtonsRow(sessionId, sessionVotes.size)],
    });

    await interaction.followUp({
      content: hasVoted
        ? "**Successfully** removed your vote!"
        : "**Successfully** counted your vote!",
      ephemeral: true,
    });

    if (sessionVotes.size < REQUIRED_VOTES) {
      return;
    }

    if (client.startingSessions.has(sessionId)) {
      return;
    }
    client.startingSessions.add(sessionId);

    try {
      const voterIds = [...sessionVotes.keys()];
      const votersList = voterIds.length
        ? voterIds.map((id) => `<@${id}>`).join(", ")
        : "No voters";
      const { headerEmbed, infoEmbed } = buildSessionStartupEmbeds();

      const components = [];
      if (!isTemplate(QUICK_JOIN_URL)) {
        const startLinkBtn = new ButtonBuilder()
          .setLabel("Quick Join")
          .setURL(QUICK_JOIN_URL)
          .setStyle(ButtonStyle.Link);
        if (!isTemplate(QUICK_JOIN_EMOJI)) startLinkBtn.setEmoji(QUICK_JOIN_EMOJI);
        components.push(new ActionRowBuilder().addComponents(startLinkBtn));
      }

      await interaction.channel.send({
        content: !isTemplate(ROLE_ID) ? `<@&${ROLE_ID}>\n-# ${votersList}` : `-# ${votersList}`,
        embeds: [headerEmbed, infoEmbed],
        components,
      });

      await interaction.message.delete().catch(() => {});

      for (const uid of voterIds) {
        const member =
          interaction.guild?.members.cache.get(uid) ||
          (await interaction.guild?.members.fetch(uid).catch(() => null));

        const userToDM = member
          ? member.user
          : await interaction.client.users.fetch(uid).catch(() => null);
        if (!userToDM) continue;

        try {
          const dmEmbed = new EmbedBuilder()
            .setColor("#fa8740")
            .setDescription(
              `Hey <@${uid}>, thank you for voting. The session has now started, please join the game to avoid moderation.`
            );

          const dmComponents = [];
          if (!isTemplate(QUICK_JOIN_URL)) {
            const dmLinkBtn = new ButtonBuilder()
              .setLabel("Quick Join")
              .setURL(QUICK_JOIN_URL)
              .setStyle(ButtonStyle.Link);
            if (!isTemplate(QUICK_JOIN_EMOJI)) dmLinkBtn.setEmoji(QUICK_JOIN_EMOJI);
            dmComponents.push(new ActionRowBuilder().addComponents(dmLinkBtn));
          }

          await userToDM.send({
            embeds: [dmEmbed],
            components: dmComponents,
          });
        } catch (error) {
          console.error(`Could not DM ${uid}:`, error);
        }
      }
    } finally {
      client.voteMap.delete(sessionId);
      if (client.activePollId === sessionId) delete client.activePollId;
      client.startingSessions.delete(sessionId);
    }
  },
};
