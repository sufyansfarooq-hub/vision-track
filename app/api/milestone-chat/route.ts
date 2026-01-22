import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { goalTitle, goalDescription, existingMilestones, userMessage, conversationHistory } = await request.json();

    // Build system prompt
    const systemPrompt = `You are an expert goal-setting coach and productivity advisor. Your role is to help users break down their goals into actionable, achievable milestones.

CURRENT GOAL:
Title: ${goalTitle}
Description: ${goalDescription}

EXISTING MILESTONES:
${existingMilestones.length > 0 ? existingMilestones.map((m: string, i: number) => `${i + 1}. ${m}`).join('\n') : 'None yet'}

YOUR RESPONSIBILITIES:
1. Suggest 3-5 specific, actionable milestones that will help achieve this goal
2. Make milestones SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
3. Order milestones from first step to final step
4. Provide 3 quick reply options to guide the conversation
5. Be encouraging and motivating

RESPONSE FORMAT:
You must respond with a JSON object containing:
{
  "message": "Your conversational message to the user (2-3 sentences)",
  "suggestedMilestones": ["Milestone 1", "Milestone 2", "Milestone 3"] (optional, only when suggesting specific milestones),
  "quickReplies": ["Option 1", "Option 2", "Option 3"] (always provide 3 options)
}

QUICK REPLY EXAMPLES:
- "Suggest milestones"
- "Help me prioritize"
- "What's the first step?"
- "Break it down further"
- "How long will this take?"
- "I'm done for now"

MILESTONE EXAMPLES:
For "Run a Marathon":
- "Complete Couch to 5K program"
- "Run a 10K race"
- "Complete a half marathon"
- "Build up to 20-mile long runs"
- "Run a full 26.2-mile marathon"

For "Learn Spanish":
- "Complete Duolingo basics course"
- "Hold a 5-minute conversation with a native speaker"
- "Watch a Spanish movie without subtitles"
- "Read a Spanish novel"
- "Pass DELE B2 exam"

Keep responses concise, actionable, and motivating!`;

    // Build conversation context
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext = conversationHistory
        .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
    }

    // Determine user message
    const userPrompt = userMessage
      ? `${conversationContext ? conversationContext + '\n\n' : ''}User: ${userMessage}\n\nProvide your response as JSON.`
      : `This is the first message. Greet the user and offer to help them create milestones for their goal. Provide your response as JSON.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Parse response
    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsedResponse = JSON.parse(jsonText);

    return NextResponse.json({
      message: parsedResponse.message,
      suggestedMilestones: parsedResponse.suggestedMilestones || [],
      quickReplies: parsedResponse.quickReplies || ['Suggest milestones', "I'm done"],
    });
  } catch (error) {
    console.error('Milestone chat error:', error);
    return NextResponse.json(
      {
        message: "I'm having trouble processing that. Could you rephrase your question?",
        quickReplies: ['Suggest milestones', "What's the first step?", 'Help me prioritize'],
        suggestedMilestones: [],
      },
      { status: 200 } // Return 200 to keep chat working
    );
  }
}
