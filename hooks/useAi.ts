import OpenAiService from "@/services/openAiService";
import { ProfileType } from "@/types/profiles";

const openAiService = new OpenAiService();

export async function generateATSResume(jobDescription: string, profile: ProfileType) {
  const systemPrompt = `You are a senior recruiter tasked 
  with generating a tailored resume in markdown format for the 
  following job opportunity: "${jobDescription}". 
  Use the provided information to create a compelling ATS resume.`;

  const userPrompt = `
  IMPORTANT: DO NOT RETURN ANYTHING ELSE THAN THE RESUME FIELDS IN MARKDOWN FORMAT. NOT EVEN PERSONAL INFORMATION.
  Read the following job description: "${jobDescription}"
  and use the following profile information to generate the resume based on the following template:

  ## Resumo de Qualificações  
  Use 
  ${profile.sections.keywords} to improve the summary and summarize it into 6 to 7 sentences: ${profile.sections.summary}

  ## Experiência Profissional
  Use ${profile.sections.keywords} to improve the professional experience 
  of ${profile.sections.professionalExperience}
  generating exactly 9 to 13 bullet points of relevant activities and responsibilities for EACH COMPANY. MAKE UP THE RESPONSIBILITIES IF NECESSARY.

  ## Formação Acadêmica
  ${profile.sections.academicBackground}

  ## Idiomas
  ${profile.sections.idioms}

  ## Atividades Extracurriculares
  ${profile.sections.extraCurricular}

  IMPORTANT NOTES: 
  - Format the resume in markdown, focusing on relevance to the job description. Keep it concise and impactful.
  - DO NOT RETURN ANYTHING ELSE THAN THE MARKDOWN RESUME and always use the same language of the job description.`;

  const completion = await openAiService.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
}

export async function generateATSResumeJSON(jobDescription: string, profile: ProfileType) {
  const systemPrompt = `Você é um recrutador sênior encarregado de gerar partes de um currículo em formato JSON para a seguinte oportunidade de emprego: "${jobDescription}". 
  Use as informações fornecidas para criar um currículo atraente, SEMPRE RESPONDENDO EM PORTUGUÊS.`;

  const userPrompt = `
  IMPORTANTE: RETORNE APENAS OBJETOS JSON. NÃO RETORNE NENHUM OUTRO TEXTO. SEMPRE RESPONDA EM PORTUGUÊS.
  Use a seguinte descrição do emprego: "${jobDescription}" e use as informações do perfil para gerar cada seção do currículo separadamente em formato JSON. Aqui está a estrutura:

  ### Use ${profile.sections.summary} para gerar o resumo: 
  {
    "summary": "Um resumo de 6-7 sentenças personalizado para o emprego usando palavras-chave relevantes."
  }

  ### Use ${profile.sections.professionalExperience} para organizar por data egerar a experiência profissional: 
  {
    "professionalExperience": [
      {
        "company": 
        "position": 
        "dates": 
        "responsibilities": [
          "Crie uma lista com pelo menos 5 frases relevantes e atividades e responsabilidades."
        ]
      },
      {
        "company": 
        "position": 
        "dates": 
        "responsibilities": [
          "Crie uma lista com pelo menos 5 frases relevantes e atividades e responsabilidades."
        ]
      }
    ]
  }

  ### Use ${profile.sections.academicBackground} para gerar a formação acadêmica: 
  {
    "academicBackground": [
      {
        "degree": "Título",
        "institution": "Instituição",
        "graduationYear": "Ano de Graduação"
      }
    ]
  }

  ### Use ${profile.sections.idioms} para gerar os idiomas: 
  {
    "languages": [
      {
        "language": "Idioma",
        "fluency": "Nível de fluência"
      }
    ]
  }
    se o usuário não especificou idiomas, retorne português e fluência "Nativo".

  ### Use ${profile.sections.extraCurricular === "" ? "Não há atividades extracurriculares" : profile.sections.extraCurricular} para gerar as atividades extracurriculares: 
  {
    "extraCurricular": 
  }

  IMPORTANTE: 
  - NÃO RETORNE NADA ALÉM DOS OBJETOS JSON.
  - Preencha cada campo com base na descrição do emprego e nos dados do perfil fornecidos.`;

  const completion = await openAiService.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
}



export async function generateTraditionalResume(jobDescription: string, profile: ProfileType) {
  const systemPrompt = `You are a senior recruiter tasked with generating a tailored resume in strict markdown format for the following job opportunity: "${jobDescription}".
  Your job is to create a resume that follows the exact structure and uses the provided information, focusing only on relevance to the job description.`;

  const userPrompt = `

Keywords: ${profile.sections.keywords}

Please generate a resume using the following sections, formatted exactly as specified:

## 1. Summary
Write a coherent paragraph using the following keywords: ${profile.sections.keywords}. 
Then summarize this section in a list of 6 to 8 bullet points:
${profile.sections.summary}.

## 2. Professional Experience
For each company and position, list responsibilities relevant to the job description.

${profile.sections.professionalExperience}

- **Company Name: [Company Name]**
  - Position: [Job Title]
  - Dates: [Start Date] – [End Date]
  - Responsibilities:
    - Bullet point responsibility 1
    - Bullet point responsibility 2
    - ...
  
Repeat this format for all companies.

## 3. Academic Background
${profile.sections.academicBackground}

- **Degree**: [Degree Name]
  - Institution: [Institution Name]
  - Graduation Date: [Date]

## 4. Languages
${profile.sections.idioms}

- **Language**: [Language Name] – [Proficiency Level]

## 5. Extra-curricular Activities
${profile.sections.extraCurricular}

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

export async function generateCoverLetter(jobDescription: string, profile: ProfileType) {
  const systemPrompt = `You are a senior recruiter tasked with generating a tailored cover letter in format for the following job opportunity: "${jobDescription}".
 Use the provided information to create a compelling cover letter.`;

  const userPrompt = `
Keywords: ${profile.sections.keywords}

Please generate a cover letter using the following sections:
1. Introduction: ${profile.sections.summary}
2. Body: ${profile.sections.professionalExperience}
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

export async function generateKeywords(profileName: string) {
  const systemPrompt = `Voce é um recrutador sênior encarregado de gerar uma lista de palavras-chave para uma carreira específica.`;

  const userPrompt = `Gere uma lista de 10 palavras-chave relevantes para a seguinte carreira: ${profileName}. 
  IMPORTANTE: NÃO RETORNE NADA ALÉM DAS PALAVRAS-CHAVE.
  IMPORTANTE: SO RESPONDA EM PORTUGUÊS.`;

  const completion = await openAiService.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
} 
//eslint-disable-next-line
export async function improveCompletion(jobDescription: string, profile: ProfileType, previousCompletion: any) {
  const systemPrompt = `Você é um recrutador encarregado de corrigir um currículo gerado para a vaga "${jobDescription}".`;

  const userPrompt = `
  O currículo gerado anteriormente contém erros ou está incompleto.
  Por favor, corrija o seguinte JSON gerado: ${JSON.stringify(previousCompletion)}
  Certifique-se de que o formato esteja correto e siga a estrutura:
  {
    "summary": "Um resumo de 6-7 sentenças.",
    "professionalExperience": [...],
    "academicBackground": "${profile.sections.academicBackground}",
    "languages": "${profile.sections.idioms}",
    "extraCurricular": "${profile.sections.extraCurricular}"
  }`;

  const completion = await openAiService.generateChatCompletion([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  return { completion };
};
