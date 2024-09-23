import OpenAiService from "@/services/openAiService";
import { ProfileType } from "@/types/profiles";

const openAiService = new OpenAiService();

export async function generateResumeWithJobDescription(jobDescription: string, profile: ProfileType) {
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
            "Crie uma lista com pelo menos 7 frases relevantes e atividades e responsabilidades."
          ]
        },
        {
          "company": 
          "position": 
          "dates": 
          "responsibilities": [
            "Crie uma lista com pelo menos 7 frases relevantes e atividades e responsabilidades."
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