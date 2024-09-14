// import OpenAI from "openai";
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     dangerouslyAllowBrowser: true
// });

// async function generateCompletion(profile: any, jobDescription: string) {
//     const completion = await openai.chat.completions.create({
//         model: "davinci-002",
//         messages: [
//             { role: "system", content: "You are a helpful assistant." },
//             {
//                 role: "user",
//                 content: `Generate a resume based on the following profile and job description:\n\nJob Description:\n${jobDescription}`,
//             },
//         ],
//     });

//     return completion.choices[0].message.content;
// }

// export { generateCompletion };
// // import axios from 'axios';



// // export const generateResume = async (profile: any, jobDescription: string): Promise<string> => {
// //   const prompt = `Generate a resume based on the following profile and job description:\n\nProfile:\n${JSON.stringify(profile, null, 2)}\n\nJob Description:\n${jobDescription}`;

// //   const response = await axios.post(
// //     'https://api.openai.com/v1/completions',
// //     {
// //       model: 'text-davinci-003',
// //       prompt,
// //       max_tokens: 1500,
// //       n: 1,
// //       stop: null,
// //       temperature: 0.7,
// //     },
// //     {
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'Authorization': `Bearer "
// //       },
// //     }
// //   );

// //   return response.data.choices[0].text;
// // };
