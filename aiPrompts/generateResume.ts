import OpenAiService from "@/services/openAiService";
import { ProfileType } from "@/types/profiles";

const openAiService = new OpenAiService();

export async function generateResume(profile: ProfileType) {

const systemPrompt = `Você é um gerador de currículos responsável por criar currículos completos e coerentes com base em informações parciais fornecidas. 
Se faltarem informações ou estiverem mal escritas, você deve inventar dados realistas para preencher o currículo. 
Nunca deixe campos vazios ou com dados de espaço reservado. Sempre forneça informações detalhadas e relevantes em português.`;

const userPrompt = `
IMPORTANTE: RETORNE APENAS OBJETOS JSON COMPLETOS. NÃO RETORNE NENHUM OUTRO TEXTO.

Use as seguintes palavras chaves para popular as informações faltantes do currículo:${profile.sections.keywords}
informações fornecidas para preencher as seções abaixo. Caso as informações sejam limitadas ou mal elaboradas, invente dados relevantes e consistentes com o perfil de um candidato qualificado para a vaga.


${profile.sections.summary}
Summary: 
### Resumo:
{
  "summary": 'Crie um resumo detalhado e atraente de 6-7 frases que destaque as principais habilidades, experiências e conquistas do candidato. Inclua exemplos concretos que demonstrem suas competências e valor."
}

### Experiência Profissional (complete com TODAS as experiências profissionais descritas acima):
{
  "professionalExperience": [
    {
      "company": "${profile.sections.professionalExperience || 'Nome da segunda empresa fictícia respeitável'}"Itere sobre a lista de empresas fornecidas acima para montar esta sessão do currículo",
      "position": "Crie um cargo apropriado para o perfil",
      "dates": "Defina um período de tempo realista",
      "responsibilities": [
        "Crie uma lista de 7-8 responsabilidades relevantes e impactantes para a posição, detalhando cada uma com exemplos específicos de resultados alcançados e habilidades aplicadas.",
        "Invente projetos importantes que o candidato tenha liderado ou participado, com uma descrição mais rica das tarefas e resultados."
      ]
    },
    {
      "company": "${profile.sections.professionalExperience || 'Nome da segunda empresa fictícia respeitável'}",
      "position": "Crie um cargo apropriado para o perfil",
      "dates": "Defina um período de tempo realista",
      "responsibilities": [
        "Crie uma lista de 7-8 responsabilidades relevantes e impactantes para a posição, detalhando cada uma com exemplos específicos de resultados alcançados e habilidades aplicadas.",
        "Invente projetos importantes que o candidato tenha liderado ou participado, com uma descrição mais rica das tarefas e resultados."
      ]
    },
  ] 
}

### Formação Acadêmica:
{
  "academicBackground": [
    {
      "degree": "${profile.sections.academicBackground || 'Invente um título acadêmico relevante'}",
      "institution": "Invente uma instituição de ensino de prestígio",
      "graduationYear": "Escolha um ano de graduação realista"
    }
  ]
}

### Idiomas:
{
  "languages": [
    {
      "language": "${profile.sections.idioms || 'Português'}",
      "fluency": "${profile.sections.idioms ? 'Invente um nível de fluência' : 'Nativo'}"
    }
  ]
}

### Atividades Extracurriculares:
{
  "extraCurricular": "${profile.sections.extraCurricular || 'Invente atividades extracurriculares relevantes e envolventes, como trabalho voluntário ou participação em clubes'}"
}

IMPORTANTE:
- Não deixe nenhum campo em branco. Invente dados plausíveis para qualquer campo faltante.
- Retorne SOMENTE os objetos JSON.
`;

const completion = await openAiService.generateChatCompletion([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
]);

return { completion };

}

// V1 - OLD PR

// export async function generateResume(profile: ProfileType) {
//     const systemPrompt = `Você é um recrutador sênior encarregado de gerar partes de um currículo em formato JSON. 
//     Use as informações fornecidas para criar um currículo atraente, SEMPRE RESPONDENDO EM PORTUGUÊS.`;
  
//     const userPrompt = `
//     IMPORTANTE: RETORNE APENAS OBJETOS JSON. NÃO RETORNE NENHUM OUTRO TEXTO. SEMPRE RESPONDA EM PORTUGUÊS.
//     Use as informações do perfil para gerar cada seção do currículo separadamente em formato JSON. Aqui está a estrutura:
  
//     ### Use ${profile.sections.summary} para gerar o resumo: 
//     {
//       "summary": "Um resumo de 6-7 sentenças personalizado para o emprego usando palavras-chave relevantes."
//     }
  
//     ### Use ${profile.sections.professionalExperience} para organizar por data e gerar a experiência profissional: 
//     {
//       "professionalExperience": [
//         {
//           "company": 
//           "position": 
//           "dates": 
//           "responsibilities": [
//             "Crie uma lista com pelo menos 7 frases relevantes e atividades e responsabilidades."
//           ]
//         },
//         {
//           "company": 
//           "position": 
//           "dates": 
//           "responsibilities": [
//             "Crie uma lista com pelo menos 7 frases relevantes e atividades e responsabilidades."
//           ]
//         }
//       ]
//     }
//     ### Use ${profile.sections.academicBackground} para gerar a formação acadêmica: 
//     {
//       "academicBackground": [
//         {
//           "degree": "Título",
//           "institution": "Instituição",
//           "graduationYear": "Ano de Graduação"
//         }
//       ]
//     }
  
//     ### Use ${profile.sections.idioms} para gerar os idiomas: 
//     {
//       "languages": [
//         {
//           "language": "Idioma",
//           "fluency": "Nível de fluência"
//         }
//       ]
//     }
//       se o usuário não especificou idiomas, retorne português e fluência "Nativo".
  
//     ### Use ${profile.sections.extraCurricular === "" ? "Não há atividades extracurriculares" : profile.sections.extraCurricular} para gerar as atividades extracurriculares: 
//     {
//       "extraCurricular": 
//     }
  
//     IMPORTANTE: 
//     - NÃO RETORNE NADA ALÉM DOS OBJETOS JSON.
//     - Preencha cada campo com base na descrição do emprego e nos dados do perfil fornecidos.`;
  
//     const completion = await openAiService.generateChatCompletion([
//       { role: 'system', content: systemPrompt },
//       { role: 'user', content: userPrompt }
//     ]);
  
//     return { completion };
//   }