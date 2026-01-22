import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Goal {
  title: string;
  description: string;
  category: string;
}

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this vision board image and extract 3-10 goals that you can identify.

For each goal, provide:
- title: A short, clear title for the goal (3-8 words)
- description: A brief description of what this goal entails (1-2 sentences)
- category: Categorize the goal into one of these categories: Career, Health, Relationships, Finance, Personal, Travel, Education, or Lifestyle

Look for:
- Text on the vision board
- Images that represent goals or aspirations
- Themes and patterns
- Any visual elements that suggest specific goals or dreams

Return ONLY a valid JSON object in this exact format, with no additional text or markdown:
{
  "goals": [
    {
      "title": "Goal title here",
      "description": "Goal description here",
      "category": "Category name here"
    }
  ]
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsedGoals;
    try {
      // Remove any potential markdown code blocks
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsedGoals = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!parsedGoals.goals || !Array.isArray(parsedGoals.goals)) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Validate each goal has required fields
    const validGoals = parsedGoals.goals.filter(
      (goal: Goal) =>
        goal.title &&
        goal.description &&
        goal.category &&
        typeof goal.title === 'string' &&
        typeof goal.description === 'string' &&
        typeof goal.category === 'string'
    );

    if (validGoals.length === 0) {
      return NextResponse.json(
        { error: 'No valid goals extracted from the vision board' },
        { status: 400 }
      );
    }

    return NextResponse.json({ goals: validGoals });
  } catch (error) {
    console.error('Error analyzing vision board:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred while analyzing the vision board',
      },
      { status: 500 }
    );
  }
}
