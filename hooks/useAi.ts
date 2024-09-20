import OpenAiService from "@/services/openAiService";
import { ProfileType, PersonalInfoType } from "@/types";

const openAiService = new OpenAiService();

export async function completeAi(jobDescription: string, profile: ProfileType, personalInfo: PersonalInfoType) {
  const systemPrompt = `You are a senior recruiter tasked with generating a tailored resume in markdown format for the following job opportunity: "${jobDescription}". Use the provided information to create a compelling resume.`;

  const userPrompt = `
Personal Information:
- Name: ${personalInfo.name}
- Phone: ${personalInfo.phone}
- Email: ${personalInfo.email}
- LinkedIn: ${personalInfo.linkedinURL}

Keywords: ${profile.sections.keywords.content}

Please generate a resume using the following sections:
1. Summary: ${profile.sections.summary.content}
2. Professional Experience: ${profile.sections.professionalExperience.content}
3. Academic Background: ${profile.sections.academicBackground.content}
4. Languages: ${profile.sections.idioms.content}
5. Extra-curricular Activities: ${profile.sections.extraCurricular.content}

Format the resume in markdown, focusing on relevance to the job description. Keep it concise and impactful.`;

  const completion = await openAiService.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
}