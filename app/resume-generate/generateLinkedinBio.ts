// import { generateLinkedinBio } from "@/aiPrompts/generateLinkedinBio";
// import { QuotasType } from "@/types/planHistory";
// import { ProfileType } from "@/types/profiles";

// type handleGenerateLinkedinBioProps = {
//     quotas: QuotasType,
//     profiles: ProfileType,
//     decreaseQuota ,
//     selectedProfile,
//     setIsGenerating,
//     setIsUpgradeDialogOpen,
//     setCoverLetterCompletion,
//     setIsCoverLetterDialogOpen,
// }:handleGenerateLinkedinBioProps
// }

// export const handleGenerateLinkedinBio = async ({
//     quotas,
//     profiles,
//     decreaseQuota,
//     selectedProfile,
//     setIsGenerating,
//     setIsUpgradeDialogOpen,
//     setCoverLetterCompletion,
//     setIsCoverLetterDialogOpen,
// }:handleGenerateLinkedinBioProps
// ) => {
//     if (quotas.interactions <= 0) {
//       setIsUpgradeDialogOpen(true)
//       return;
//     }
//     if (!selectedProfile) {
//       console.error('Please select a profile');
//       return;
//     }
//     setIsGenerating(true)
//     const profile = profiles?.find(p => p.id === selectedProfile);
//     if (!profile) {
//       throw new Error('Selected profile not found');
//     }
//     setIsGenerating(true)
//     const { completion } = await generateLinkedinBio(profile)
//     console.log(completion);
//     setIsGenerating(false)
//     setCoverLetterCompletion(completion)
//     setIsCoverLetterDialogOpen(true)

//     decreaseQuota('interactions')
//   } 