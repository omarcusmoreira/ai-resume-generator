
import OpenAiService from "@/services/openAiService";
import { ProfileType } from "@/types/profiles";
import { PersonalInfoType } from "@/types/users";

const openAiService = new OpenAiService();

export async function generateResumeHTML(profile: ProfileType, personalInfo: PersonalInfoType) {

const systemPrompt = `Você é um gerador de currículos responsável por criar currículos completos e coerentes com base em informações parciais fornecidas. 
Se faltarem informações ou estiverem mal escritas, você deve inventar dados realistas para preencher o currículo. 
Nunca deixe campos vazios ou com dados de espaço reservado. Sempre forneça informações detalhadas e relevantes em português.`;

const userPrompt = `
IMPORTANTE: RETORNE APENAS O CURRICULO EM HTML. NÃO RETORNE NENHUM OUTRO TEXTO.


Abaixo estão as minhas informações. Organize essas informações de maneira estruturada e gere um curriculo em HTML.

Informações pessoais:
Nome(h2):${personalInfo.name},
Telefone(p):${personalInfo.phone},
Email:${personalInfo.email},
LinkedIn: ${personalInfo.linkedinURL || 'Não retorne esse campo'} 

### Resumo: 'Crie um resumo detalhado e atraente de 6-7 frases que destaque as principais habilidades, experiências e conquistas do candidato. Inclua exemplos concretos que demonstrem suas competências e valor com base 
neste parágrafo: ${profile.sections.summary}'

Use as seguintes palavras-chave para popular as informações do currículo: ${profile.sections.keywords}

Voce poderia melhorar bem essa sessção do meu curriculo, se possível crie mais responsabilidades para popular o que falta: 
${profile.sections.professionalExperience}.
### Experiência Profissional: 

### Educação Acadêmica: ${profile.sections.academicBackground}

### Idiomas: "${profile.sections.idioms || 'Português nativo'}",

### Atividades Extracurriculares:"${profile.sections.extraCurricular || 'Invente atividades extracurriculares relevantes e envolventes, como trabalho voluntário ou participação em clubes'}"

### NÃO PRECISA DAS TAGS HTML E BODY, retorne apenas a formatação para <h1>, <h2>, <h3>, <p>, <ul>, <li>, <b>, <i>
IMPORTANTÍSSIMO: NENHUMA EXPERIÊNCIA PROFISSIONAL PODE TER MENOS DE 7 RESPONSABILIDADES DESCRITAS e NÃO RETORNE PLACEHOLDERS, SE NÃO HOUVER INFORMAÇÃO O SUFICIENTE INVENTE!

`;

const completion = await openAiService.generateChatCompletion([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
]);

return { completion };

}

// import OpenAiService from "@/services/openAiService";
// import { ProfileType } from "@/types/profiles";
// import { PersonalInfoType } from "@/types/users";

// const openAiService = new OpenAiService();

// export async function generateResumeHTML(profile: ProfileType, personalInfo: PersonalInfoType) {

//   const systemPrompt = `Você é um gerador de currículos responsável por criar currículos completos e coerentes com base em informações parciais fornecidas. 
//   Se faltarem informações ou estiverem mal escritas, você deve inventar dados realistas para preencher o currículo. 
//   Nunca deixe campos vazios ou com dados de espaço reservado. Sempre forneça informações detalhadas e relevantes em português.`;

//   const userPrompt = `
//   IMPORTANTE: RETORNE APENAS O CURRÍCULO FORMATADO EM HTML. NÃO RETORNE NENHUM OUTRO TEXTO.

//   Abaixo estão as informações fornecidas sobre o candidato. Complete as informações faltantes ou invente detalhes plausíveis conforme necessário para criar um currículo completo.

//   ### Informações pessoais:
//   Nome:${personalInfo.name},
//   Telefone:${personalInfo.phone},
//   Email:${personalInfo.email},
//   LinkedIn: ${personalInfo.linkedinURL || 'Não retorne esse campo'} 

//   ### Resumo:
//   ${profile.sections.summary} 'Invente um resumo profissional atraente que destaque as principais habilidades e conquistas.'}

//   ### Experiência Profissional:  'INVENTE ou COMPLETE com experiências profissionais relevantes ao cargo, listando empresas, cargos e uma lista de NO MÍNIMO 7 a 8 responsabilidades.'
//   ${profile.sections.professionalExperience}

//   ### Formação Acadêmica:
//   ${profile.sections.academicBackground || 'Formações acadêmicas relevantes, incluindo curso, instituição e ano de conclusão.'}

//   ### Idiomas:
//   ${profile.sections.idioms || 'Português (Nativo)'} 

//   ### Atividades Extracurriculares:
//   ${profile.sections.extraCurricular || 'Invente atividades extracurriculares relevantes, como voluntariado ou hobbies interessantes.'}

//   - Não deixe campos em branco.
//   - Retorne SOMENTE o CURRÍCULO FORMATADO EM HTML.
//   - Quero um currículo COMPLETO e bem detalhado.
//   `;

//   const completion = await openAiService.generateChatCompletion([
//     { role: 'system', content: systemPrompt },
//     { role: 'user', content: userPrompt }
//   ]);

//   return { completion };

// }
