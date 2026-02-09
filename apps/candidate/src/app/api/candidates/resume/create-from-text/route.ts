import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/candidates/resume/create-from-text
 * Takes raw text content and uses AI to organize it into a structured resume
 */
export async function POST(request: NextRequest) {
  try {
    const { textContent, userId } = await request.json();

    if (!textContent || textContent.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please provide more information about yourself (at least 20 characters)' },
        { status: 400 }
      );
    }

    // Get API key
    const anthropicApiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicApiKey) {
      console.error('No Claude API key configured');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Fetch user profile data if available
    let profileData: any = null;
    if (userId) {
      const { data: candidate } = await supabaseAdmin
        .from('candidates')
        .select('first_name, last_name, email, phone, avatar_url, position, location, bio')
        .eq('id', userId)
        .single();
      
      if (candidate) {
        profileData = candidate;
      }
    }

    console.log('🤖 Creating resume from text input...');

    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    // Create prompt for Claude
    const prompt = `You are an expert resume writer. A job candidate has provided the following information about themselves. Your task is to organize this into a structured, professional resume format.

USER'S INPUT:
${textContent}

${profileData ? `
EXISTING PROFILE DATA:
- Name: ${profileData.first_name || ''} ${profileData.last_name || ''}
- Email: ${profileData.email || ''}
- Phone: ${profileData.phone || ''}
- Location: ${profileData.location || ''}
- Current Title: ${profileData.position || ''}
` : ''}

Please extract and organize the information into a JSON structure with the following format:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number or empty string",
  "location": "City, Country or empty string",
  "bestJobTitle": "Most relevant/recent job title",
  "summary": "2-3 sentence professional summary based on their experience",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start Date - End Date",
      "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "School Name",
      "year": "Graduation Year"
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Soft Skill 1", "Soft Skill 2"]
  }
}

IMPORTANT RULES:
1. If information is missing, make reasonable inferences or leave fields as empty strings/arrays
2. Create professional-sounding achievements from the described work
3. Infer skills from the described work experience
4. Write a compelling professional summary
5. Use the profile data to fill in name/email/phone if not mentioned in the text
6. Format dates consistently (e.g., "Jan 2020 - Dec 2022" or "2020 - Present")
7. Return ONLY valid JSON, no markdown code blocks

Return the JSON object only.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Extract the text content
    const textBlock = response.content.find(block => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    let resumeData;
    try {
      // Clean up the response (remove any markdown if present)
      let jsonStr = textBlock.text.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      }
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      
      resumeData = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', textBlock.text);
      throw new Error('Failed to parse AI response');
    }

    // Merge with profile data for any missing fields
    if (profileData) {
      if (!resumeData.name && (profileData.first_name || profileData.last_name)) {
        resumeData.name = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
      }
      if (!resumeData.email && profileData.email) {
        resumeData.email = profileData.email;
      }
      if (!resumeData.phone && profileData.phone) {
        resumeData.phone = profileData.phone;
      }
      if (!resumeData.location && profileData.location) {
        resumeData.location = profileData.location;
      }
      if (!resumeData.bestJobTitle && profileData.position) {
        resumeData.bestJobTitle = profileData.position;
      }
      if (profileData.avatar_url) {
        resumeData.profilePhoto = profileData.avatar_url;
      }
    }

    // Ensure all required fields exist
    resumeData = {
      name: resumeData.name || 'Your Name',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      location: resumeData.location || '',
      bestJobTitle: resumeData.bestJobTitle || 'Professional',
      summary: resumeData.summary || '',
      experience: Array.isArray(resumeData.experience) ? resumeData.experience : [],
      education: Array.isArray(resumeData.education) ? resumeData.education : [],
      skills: {
        technical: Array.isArray(resumeData.skills?.technical) ? resumeData.skills.technical : [],
        soft: Array.isArray(resumeData.skills?.soft) ? resumeData.skills.soft : [],
      },
      profilePhoto: resumeData.profilePhoto || null,
    };

    // Create simple analysis
    const analysis = {
      overallScore: 70, // Starting score
      keyStrengths: [
        resumeData.experience.length > 0 ? 'Has work experience' : null,
        resumeData.skills.technical.length > 0 ? 'Technical skills identified' : null,
        resumeData.education.length > 0 ? 'Education background' : null,
      ].filter(Boolean),
      improvements: [
        !resumeData.phone ? 'Add phone number' : null,
        !resumeData.location ? 'Add location' : null,
        resumeData.experience.length === 0 ? 'Add work experience' : null,
        resumeData.skills.technical.length < 3 ? 'Add more skills' : null,
      ].filter(Boolean),
      recommendations: [
        'Review and edit your professional summary',
        'Add specific achievements with numbers where possible',
        'Customize for each job application',
      ],
    };

    // Save to database if user is logged in
    if (userId) {
      try {
        // Save to candidate_resumes
        await supabaseAdmin
          .from('candidate_resumes')
          .upsert({
            candidate_id: userId,
            resume_data: resumeData,
            generated_data: resumeData,
            is_primary: true,
            is_public: false,
            slug: `${userId}-${Date.now()}`,
            title: 'My Resume',
          }, {
            onConflict: 'candidate_id',
            ignoreDuplicates: false,
          });

        console.log('✅ Resume saved to database');
      } catch (dbError) {
        console.warn('Could not save to database:', dbError);
        // Continue anyway - data will be in localStorage
      }
    }

    console.log('✅ Resume created from text successfully');

    return NextResponse.json({
      success: true,
      resumeData,
      analysis,
    });

  } catch (error) {
    console.error('Error creating resume from text:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create resume' },
      { status: 500 }
    );
  }
}
