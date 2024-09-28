import OpenAiService from "@/services/openAiService";
import { ProfileType } from "@/types/profiles";
import { UserDataType } from "@/types/users";

const openAiService = new OpenAiService();

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