// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateCompletion(completion: any): boolean {
    // Validate summary
    const parsedCompletion = JSON.parse(completion);   

    if (!parsedCompletion.summary || typeof parsedCompletion.summary !== 'string') {
      console.log("Resumo inválido");
      return false;
    }
  
    // Validate professionalExperience
    if (!Array.isArray(parsedCompletion.professionalExperience) || parsedCompletion.professionalExperience.length === 0) {
      console.log("Invalid professionalExperience");
      return false;
    }
  
    for (const experience of parsedCompletion.professionalExperience) {
      if (!experience.company || typeof experience.company !== 'string') {
        console.log("Invalid company in professionalExperience");
        return false;
      }
      if (!experience.position || typeof experience.position !== 'string') {
        console.log("Invalid position in professionalExperience");
        return false;
      }
      if (!experience.dates || typeof experience.dates !== 'string') {
        console.log("Invalid dates in professionalExperience");
        return false;
      }
      if (!Array.isArray(experience.responsibilities) || experience.responsibilities.length < 5) {
        console.log("Invalid responsibilities in professionalExperience");
        return false;
      }
    }
  
    // Validate academicBackground
    if (!parsedCompletion.academicBackground || typeof parsedCompletion.academicBackground !== 'object') {
      console.log("Invalid academicBackground");
      return false;
    }
  
    for (const academic of parsedCompletion.academicBackground) {
      if (!academic.degree) {
        console.log("Invalid degree in academicBackground");
        return false;
      }
      if (!academic.institution || typeof academic.institution !== 'string') {
        console.log("Invalid institution in academicBackground");
      return false;
      }
      if (!academic.graduationYear || typeof academic.graduationYear !== 'string') {
        console.log("Invalid graduationYear in academicBackground");
        return false;
      }
    }
  
    // Validate languages
    if (!Array.isArray(parsedCompletion.languages) || parsedCompletion.languages.length === 0) {
      console.log("Invalid languages");
      return false;
    }
  
    for (const language of parsedCompletion.languages) {
      if (!language.language || typeof language.language !== 'string') {
        console.log("Invalid language in languages");
        return false;
      }
      if (!language.fluency || typeof language.fluency !== 'string') {
        console.log("Invalid fluency in languages");
        return false;
      }
    }
  
    // All validations passed
    return true;
  }
  