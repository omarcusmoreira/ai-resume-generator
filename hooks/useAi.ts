import OpenAiService from "@/services/openAiService";
import { ProfileType, PersonalInfoType } from "@/types";

const openAiService = new OpenAiService();

export async function generateTraditionalResume(jobDescription: string, profile: ProfileType, personalInfo: PersonalInfoType) {
  const systemPrompt = `You are a senior recruiter tasked with generating a tailored resume in strict markdown format for the following job opportunity: "${jobDescription}".
  Your job is to create a resume that follows the exact structure and uses the provided information, focusing only on relevance to the job description.`;

  const userPrompt = `
Personal Information:
- Name: ${personalInfo.name}
- Phone: ${personalInfo.phone}
- Email: ${personalInfo.email}
- LinkedIn: ${personalInfo.linkedinURL}

Keywords: ${profile.sections.keywords.content}

Please generate a resume using the following sections, formatted exactly as specified:

## 1. Summary
Write a coherent paragraph using the following keywords: ${profile.sections.keywords.content}. 
Then summarize this section in a list of 6 to 8 bullet points:
${profile.sections.summary.content}.

## 2. Professional Experience
For each company and position, list responsibilities relevant to the job description.

${profile.sections.professionalExperience.content}

- **Company Name: [Company Name]**
  - Position: [Job Title]
  - Dates: [Start Date] – [End Date]
  - Responsibilities:
    - Bullet point responsibility 1
    - Bullet point responsibility 2
    - ...
  
Repeat this format for all companies.

## 3. Academic Background
${profile.sections.academicBackground.content}

- **Degree**: [Degree Name]
  - Institution: [Institution Name]
  - Graduation Date: [Date]

## 4. Languages
${profile.sections.idioms.content}

- **Language**: [Language Name] – [Proficiency Level]

## 5. Extra-curricular Activities
${profile.sections.extraCurricular.content}

- Bullet point activity 1
- Bullet point activity 2
- ...

**IMPORTANT**: Only return the resume in markdown format. Do not add any commentary or additional information. Follow this format strictly. Use the same language as the job description.`;

  const completion = await openAiService.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
}


export async function generateATSResume(jobDescription: string, profile: ProfileType, personalInfo: PersonalInfoType) {
  const systemPrompt = `You are a senior recruiter tasked 
  with generating a tailored resume in markdown format for the 
  following job opportunity: "${jobDescription}". 
  Use the provided information to create a compelling ATS resume.`;

  const userPrompt = `
  Read the following job description: "${jobDescription}"
  and use the following profile information to generate the resume based on the following template:

  ## Resumo de Qualificações  
  Use 
  ${profile.sections.keywords.content} to improve the summary and summarize it into 6 to 7 sentences: ${profile.sections.summary.content}

  ## Experiência Profissional
  Use ${profile.sections.keywords.content} to improve the professional experience 
  of ${profile.sections.professionalExperience.content}
  generating exactly 9 to 13 bullet points of relevant activities and responsibilities for EACH COMPANY. MAKE UP THE RESPONSIBILITIES IF NECESSARY.

  ## Formação Acadêmica
  ${profile.sections.academicBackground.content}

  ## Idiomas
  ${profile.sections.idioms.content}

  ## Atividades Extracurriculares
  ${profile.sections.extraCurricular.content}

  IMPORTANT NOTES: 
  - Format the resume in markdown, focusing on relevance to the job description. Keep it concise and impactful.
  - DO NOT RETURN ANYTHING ELSE THAN THE MARKDOWN RESUME and always use the same language of the job description.`;

  const completion = await openAiService.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
}

export async function generateCoverLetter(jobDescription: string, profile: ProfileType, personalInfo: PersonalInfoType) {
  const systemPrompt = `You are a senior recruiter tasked with generating a tailored cover letter in format for the following job opportunity: "${jobDescription}".
 Use the provided information to create a compelling cover letter.`;

  const userPrompt = `
Personal Information:
- Name: ${personalInfo.name}
- LinkedIn: ${personalInfo.linkedinURL}

Keywords: ${profile.sections.keywords.content}

Please generate a cover letter using the following sections:
1. Introduction: ${profile.sections.summary.content}
2. Body: ${profile.sections.professionalExperience.content}
3. Closing: Write a short closing paragraph.

Format the cover letter in markdown, focusing on relevance to the job description. Keep it concise and impactful.

DO NOT RETURN ANYTHING ELSE THAN THE COVER LETTER and always use the same language of the job description.`;

  const completion = await openAiService.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
}

export async function enhanceSummary(summary: string) {
  const systemPrompt = `You are a senior recruiter tasked with enhancing a summary in markdown format.
 Use the provided information to create a compelling cover letter.`;

  const userPrompt = `Summarize the following text into 6 to 8 bullet points: ${summary}. 
  IMPORTANT: DO NOT RETURN ANYTHING ELSE THAN THE SUMMARY.
  IMPORTANT: USE THE SAME LANGUAGE OF THE SUMMARY.
  IMPORTANT: FORMAT THE SUMMARY IN MARKDOWN.`;

const completion = await openAiService.generateChatCompletion([
  { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
}

