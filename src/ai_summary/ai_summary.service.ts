import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PrismaService } from '../../prisma/prisma.service';

const PARTY_LOOM_PERSONALITY = `You are PartyBot 🎉, the most enthusiastic party planner AI ever created! 
You LOVE parties and helping friends have amazing celebrations together.

Your personality traits:
- Super optimistic and encouraging (use emojis liberally! 🎊🥳🎈)
- You celebrate every contribution, no matter how small
- You give fun nicknames based on contribution levels (e.g., "Party Champion", "Generous Guest", "Rising Star")
- You use party puns and celebratory language
- You keep summaries concise but exciting
- You always end with encouragement or a fun party tip

When summarizing parties, highlight:
- The excitement of the event
- Progress toward the goal (always frame positively!)
- Shoutouts to top contributors
- Fun encouragement for everyone

Keep responses under 200 words but packed with energy!`;

@Injectable()
export class AiSummaryService {
  private model: ChatGoogleGenerativeAI;

  constructor(private prisma: PrismaService) {
    this.model = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: 'AIzaSyAHXMUqbE2nRawRSR3qn_oZ7jRG6PIz44w',
    });
  }

  async summarizeText(text: string): Promise<string> {
    const response = await this.model.invoke([
      new SystemMessage(PARTY_LOOM_PERSONALITY),
      new HumanMessage(`Please give a fun, upbeat summary of this: ${text}`),
    ]);
    return response.content as string;
  }

  async summarizeParty(partyId: string): Promise<object> {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
      include: {
        participants: {
          include: { user: true },
        },
        contributions: {
          include: { user: true },
        },
        items: {
          include: { assignedTo: true },
        },
      },
    });

    if (!party) {
      throw new Error('Party not found');
    }

    // Calculate stats
    const totalContributed = party.contributions.reduce((sum, c) => sum + c.amount, 0);
    const remaining = party.totalAmount - totalContributed;
    const progressPercent = Math.round((totalContributed / party.totalAmount) * 100);

    // Find top contributor
    const contributionsByUser = party.contributions.reduce((acc, c) => {
      acc[c.userId] = (acc[c.userId] || 0) + c.amount;
      return acc;
    }, {} as Record<string, number>);

    const topContributorId = Object.entries(contributionsByUser)
      .sort(([, a], [, b]) => b - a)[0]?.[0];
    const topContributor = party.participants.find(p => p.userId === topContributorId)?.user;

    // Build context for AI
    const partyContext = `
Party Name: ${party.name}
Description: ${party.description || 'An awesome party!'}
Date: ${party.date.toLocaleDateString()}
Budget Goal: $${party.totalAmount}
Amount Raised: $${totalContributed} (${progressPercent}% of goal)
Amount Remaining: $${remaining}
Number of Participants: ${party.participants.length}
Number of Contributions: ${party.contributions.length}
Top Contributor: ${topContributor ? `${topContributor.name} ($${contributionsByUser[topContributorId]})` : 'No contributions yet'}
Items Assigned: ${party.items.length} items
Split Type: ${party.divideEqually ? 'Equal split among all' : 'Custom contributions'}
    `.trim();

    const response = await this.model.invoke([
      new SystemMessage(PARTY_LOOM_PERSONALITY),
      new HumanMessage(`Generate an exciting party summary for this event:\n\n${partyContext}`),
    ]);

    return {
      partyId: party.id,
      partyName: party.name,
      stats: {
        totalBudget: party.totalAmount,
        totalContributed,
        remaining,
        progressPercent,
        participantCount: party.participants.length,
        contributionCount: party.contributions.length,
      },
      aiSummary: response.content as string,
    };
  }

  async getPartyMotivation(partyId: string): Promise<string> {
    const party = await this.prisma.party.findUnique({
      where: { id: partyId },
      include: { contributions: true },
    });

    if (!party) {
      throw new Error('Party not found');
    }

    const totalContributed = party.contributions.reduce((sum, c) => sum + c.amount, 0);
    const progressPercent = Math.round((totalContributed / party.totalAmount) * 100);

    const response = await this.model.invoke([
      new SystemMessage(PARTY_LOOM_PERSONALITY),
      new HumanMessage(`Give a short motivational message (2-3 sentences) for a party that's ${progressPercent}% funded. Party name: "${party.name}". Be super encouraging!`),
    ]);

    return response.content as string;
  }
}