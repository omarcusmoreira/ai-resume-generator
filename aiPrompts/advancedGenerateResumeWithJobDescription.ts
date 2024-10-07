import OpenAiService from "@/services/openAiService";
import { ProfileType } from "@/types/profiles";

const openAiService = new OpenAiService();

export async function advancedGenerateResumeWithJobDescription(jobDescription:string, profile: ProfileType) {

  const userPrompt = `
  IMPORTANTE: RETORNE APENAS OBJETOS JSON COMPLETOS. NÃO RETORNE NENHUM OUTRO TEXTO.

  IMPORTANTE: Use a seguinte descrição de vaga para adaptar e criar um currículo para mim: ${jobDescription}.

  Abaixo estão as informações fornecidas sobre a minha experiência profissional. Organize essas informações de maneira estruturada e gere o JSON correspondente.

  ### Informações Profissionais fornecidas:
  "${profile.sections.professionalExperience}"

  {
    "professionalExperience": [
      {
        "company": "Extraia o nome da empresa de maneira apropriada",
        "position": "Extraia o cargo do candidato",
        "dates": "Extraia o período de tempo corretamente",
        "responsibilities": [
          "Crie uma lista de EXATAMENTE 7 responsabilidades relevantes e impactantes para a posição, detalhando cada uma com exemplos específicos de resultados alcançados e habilidades aplicadas.",
          "Invente projetos importantes que o candidato tenha liderado ou participado, com uma descrição mais rica das tarefas e resultados."
        ]
      }
      // Repita para todas as experiências fornecidas
    ]
  }

  ### Resumo:
  {
    "summary": 'Crie um resumo detalhado e atraente de 6-7 frases que destaque as principais habilidades, experiências e conquistas do candidato. Inclua exemplos concretos que demonstrem suas competências e valor.'
  }

  ### Formação Acadêmica:
  {
    "academicBackground": [
      {
        "degree": "${profile.sections.academicBackground}",
        "institution": "Escreva a instituição de ensino descrita acima ou deixe em branco",
        "graduationYear": "Entre com o ano de formação fornecido"
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
  - Inclua no mínimo 7 responsabilidades na lista de TODAS as empresas da seção experiencia profissional.
  - Não deixe nenhum campo em branco. Invente dados plausíveis para qualquer campo faltante.
  - Retorne SOMENTE os objetos JSON.
  - SEMPRE RESPONDA EM PORTUGUÊS.
  `;

  const schema = {
    "type": "object",
    "properties": {
      "summary": { "type": "string" },
      "professionalExperience": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "company": { "type": "string" },
            "position": { "type": "string" },
            "dates": { "type": "string" },
            "responsibilities": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": ["company", "position", "dates", "responsibilities"]
        }
      },
      "academicBackground": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "degree": { "type": "string" },
            "institution": { "type": "string" },
            "graduationYear": { "type": "string" }
          },
          "required": ["degree", "institution", "graduationYear"]
        }
      },
      "languages": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "language": { "type": "string" },
            "fluency": { "type": "string" }
          },
          "required": ["language", "fluency"]
        }
      },
      "extraCurricular": { "type": "string" }
    },
    "required": ["summary", "professionalExperience", "academicBackground", "languages", "extraCurricular"]
  };

  // Generate completion with schema
  const completion = await openAiService.generateCompletionWithSchema(
    [{role: 'user', content: userPrompt}],
    'gpt-4-0613',
    1500,
    { name: 'generateResume' },  // Function to be called
    schema  // Schema for the structure
  );

  return { completion };
}