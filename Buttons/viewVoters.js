const REQUIRED_VOTES = 7;

module.exports = {
  customID: "viewvote:button",

  execute: async function (interaction, client, args) {
    const sessionId = args[0];
    if (!sessionId) {
      return interaction.reply({
        content: "Unable to resolve this vote session. Please run `/session-vote` again.",
        ephemeral: true,
      });
    }

    const sessionVotes = client.voteMap?.get(sessionId) || new Map();
    const voterIds = [];

    for (const [key, value] of sessionVotes.entries()) {
      if (typeof key === "string") {
        voterIds.push(key);
        continue;
      }

      if (value && typeof value === "object" && typeof value.userId === "string") {
        voterIds.push(value.userId);
      }

      if (typeof value === "string") {
        voterIds.push(value);
      }
    }

    const uniqueVoterIds = [...new Set(voterIds)];
    const content = uniqueVoterIds.length
      ? uniqueVoterIds.map((id) => `<@${id}>`).join("\n")
      : "No votes yet.";

    await interaction.reply({
      content: `**Voters List (\`${sessionVotes.size}/${REQUIRED_VOTES}\`)**:\n${content}`,
      ephemeral: true,
    });
  },
};
