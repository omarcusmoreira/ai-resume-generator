import OpenAiService from "@/services/openAiService";
import { ProfileType } from "@/types/profiles";
import { UserDataType } from "@/types/users";

const openAiService = new OpenAiService();

export async function generateCoverLetter(jobDescription: string, profile: ProfileType, user: UserDataType) {
    const systemPrompt = `Você é um recrutador sênior encarregado de gerar partes de uma carta de apresentações para o usuário baseados nas informações pessoais e no perfil fornecidos. 
    Use as informações fornecidas para criar uma carta de apresentações atrativa, SEMPRE RESPONDENDO EM PORTUGUÊS.`;
  
    const userPrompt = `
    IMPORTANTE: NÃO RETORNE NENHUM OUTRO TEXTO ALEM DA CARTA DE APRESENTAÇÕES. SEMPRE RESPONDA EM PORTUGUÊS.
    Use a seguinte descrição do emprego PRETENDIDO: "${jobDescription}" e use as informações do perfil para gerar a carta de apresentações. Aqui está a estrutura:
  
    Use ${profile.sections.summary} para gerar a introdução.

    Use ${profile.sections.professionalExperience} para fornecer a experiência profissional do usuário. 

    Use ${profile.sections.academicBackground} para a formação acadêmica. 
  
    Use ${profile.sections.idioms} para conhecer os idiomas 

      se o usuário não especificou idiomas, retorne português e fluência "Nativo".
  
    Use ${profile.sections.extraCurricular === "" ? "Não há atividades extracurriculares" : profile.sections.extraCurricular} para gerar as atividades extracurriculares: 
  
    Use ${user.personalInfo.name} para o nome do usuário.
    
    IMPORTANTE: 
    - NÃO RETORNE NADA ALÉM DA CARTA.`;
  
    const completion = await openAiService.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  
    return { completion };
  }