import axios from 'axios';

class OpenAiService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key is not set. Please check your environment variables.');
    }
  }

  async generateCompletion(prompt: string, model: string = 'gpt-3.5-turbo', maxTokens: number = 1500) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/completions`,
        {
          model,
          prompt,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('Error generating completion:', error);
      throw error;
    }
  }

  async generateChatCompletion(messages: Array<{ role: string, content: string }>, model: string = 'gpt-4o-mini') {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating chat completion:', error);
      throw error;
    }
  }
}

export default OpenAiService;
