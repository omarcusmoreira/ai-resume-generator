import OpenAiService from "@/services/openAiService";
import { ProfileType } from "@/types/profiles";

const openAiService = new OpenAiService();

export async function generateLinkedinBio(profile: ProfileType) {
    const systemPrompt = `Você é um recrutador sênior encarregado de gerar uma biografia para o LinkedIn do usuário baseados no perfil fornecido. 
    Use as informações fornecidas para criar uma biografia atrativa, SEMPRE RESPONDENDO EM PORTUGUÊS.`;
  
    const userPrompt = `
    IMPORTANTE: NÃO RETORNE NENHUM OUTRO TEXTO ALEM DA CARTA DE APRESENTAÇÕES. SEMPRE RESPONDA EM PORTUGUÊS.
    Use as informações do meu perfil para gerar uma biografia criativa e cativante para meu LinkedIn. Use uma linguagem informal e criativa em no MAXIMO 2000 caracteres.
    E retorne com espaçamento e quebras de linha que fique bem legível no meu perfil do LinkedIn.
    Aqui estão algumas informações:
  
    Use ${profile.sections.summary} para gerar a introdução.

    Use ${profile.sections.professionalExperience} para fornecer a experiência profissional do usuário. 

    Use ${profile.sections.academicBackground} para a formação acadêmica. 
  
    Use ${profile.sections.idioms} para conhecer os idiomas 

      se o usuário não especificou idiomas, retorne português e fluência "Nativo".
  
    Use ${profile.sections.extraCurricular === "" ? "Não há atividades extracurriculares" : profile.sections.extraCurricular} para gerar as atividades extracurriculares: 
      
    IMPORTANTE: 
    - NÃO RETORNE NADA ALÉM DA CARTA.`;
  
    const completion = await openAiService.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  
    return { completion };
  }