import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }
    console.log('Fetching image from:', imageUrl);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    console.log('Calling Claude API...');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64Image } },
{ type: 'text', text: 'You are analyzing a vision board collage. Your task is to identify 3-10 distinct visual elements and extract actionable goals from them.\n\nSTEP 1 - VISUAL ELEMENT DETECTION:\nCarefully scan the entire image and identify distinct visual elements:\n- Look for clear EDGES and BOUNDARIES of photos/images\n- Identify rectangular or clearly-bounded images\n- Distinguish between actual photos and text overlays\n- Each element should be a distinct image with visible borders\n- Ignore pure text unless it\'s part of an image design\n\nSTEP 2 - REGION COORDINATE MAPPING:\nFor EACH visual element you identify:\n- Determine the EXACT rectangular boundary that contains it\n- x: percentage from left edge (0-100)\n- y: percentage from top edge (0-100)\n- width: percentage of image width the element occupies\n- height: percentage of image height the element occupies\n\nSTEP 3 - GOAL EXTRACTION:\nFor each visual element, infer what goal it represents:\n- What life area does this image relate to? (career, health, wealth, relationships, travel, personal growth, etc.)\n- Create a clear, actionable goal title (5-12 words)\n- Write a brief description of what achieving this goal looks like (1-2 sentences)\n\nEXTRACTION RULES:\n1. Extract 7-10 goals minimum (more if you see more distinct elements)\n2. Prioritize larger, more prominent images first\n3. Include smaller distinct elements if clearly visible\n4. Regions CAN overlap slightly if images overlap\n5. Be PRECISE with coordinates - fit boundaries tightly around each image\n6. Verify each region contains a distinct visual element, not just text\n\nEXAMPLE OUTPUT FORMAT:\n[{"title":"Achieve financial independence","description":"Build multiple income streams and reach financial freedom","region":{"x":65,"y":45,"width":30,"height":25}},{"title":"Master new technology skills","description":"Learn advanced programming and stay current with tech trends","region":{"x":10,"y":70,"width":25,"height":28}}]\n\nReturn ONLY the JSON array with 7-10 goals. No markdown, no explanation, just the JSON array.' }
        ]
      }]
    });
    console.log('API response received');
    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response');
    }
    let goalsData = textContent.text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const goals = JSON.parse(goalsData);
    console.log('Extracted goals:', goals);
    return NextResponse.json({ goals, success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }
}
