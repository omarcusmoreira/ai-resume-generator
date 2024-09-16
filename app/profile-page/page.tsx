'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useFirestore } from '@/hooks/useFirestore';
import { ProfileType, ProfileSectionType } from '@/types';
import ProfileWizardComponent from '@/components/profile-wizard';

export default function Profiles() {
  const { appState, loading, deleteProfile, updateProfile } = useFirestore();
  const [activeProfile, setActiveProfile] = useState<number | null>(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleAddProfile = () => {
    setIsWizardOpen(true);
  };

  const handleContentChange = (profileIndex: number, sectionKey: keyof ProfileSectionType, content: string) => {
    if (activeProfile === null || !appState?.profiles) return;
    const updatedProfiles = appState.profiles[profileIndex];
    const section = updatedProfiles.sections;

    section[sectionKey].content = content;
    section[sectionKey].aiEnhanced = `AI enhanced: ${content}`;

    updateProfile(updatedProfiles);
  };

  const handleSaveProfile = async (profileIndex: number) => {
    if (activeProfile === null || !appState?.profiles) return;
    const updatedProfiles = appState.profiles[profileIndex];
    await updateProfile(updatedProfiles); // Ensure appState is passed correctly
  };

  const handleDeleteProfile = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProfile = () => {
    if (activeProfile === null || !appState?.profiles) return;
    const updatedProfiles = appState.userType.profiles.filter((_:ProfileType, index: number) => index !== activeProfile);
    deleteProfile(updatedProfiles);
    setActiveProfile(updatedProfiles.length > 0 ? Math.min(activeProfile, updatedProfiles.length - 1) : null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="container mx-auto p-8">
      {isWizardOpen ? (
        <ProfileWizardComponent 
          isOpen={isWizardOpen} 
          onClose={() => setIsWizardOpen(false)} 
        />
      ) : appState?.profiles && appState.profiles.length > 0 ? (
        <Tabs value={activeProfile?.toString() || ""} onValueChange={(value) => setActiveProfile(parseInt(value))}>
          <div className="flex items-center mb-4">
            <TabsList>
              {appState.profiles.map((profile: ProfileType, index: number) => (
                <TabsTrigger key={index} value={index.toString()}>{profile.profileName}</TabsTrigger>
              ))}
            </TabsList>
            <Button variant="outline" size="icon" className="ml-2" onClick={handleAddProfile}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          {appState.profiles.map((profile: ProfileType, profileIndex: number) => (
            <TabsContent key={profileIndex} value={profileIndex.toString()}>
              <Card>
                <CardHeader>
                  <CardTitle>{profile.profileName}</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(profile.sections).map(([sectionKey, section]) => (
                    <div key={sectionKey}>
                      <label htmlFor={`${profileIndex}-${sectionKey}`} className="block text-sm font-medium text-gray-700 mb-1">
                        {sectionKey}
                      </label>
                      <Textarea
                        id={`${profileIndex}-${sectionKey}`}
                        value={section.content}
                        onChange={(e) => handleContentChange(profileIndex, sectionKey as keyof ProfileSectionType, e.target.value)}
                        placeholder={`Enter ${sectionKey}`}
                      />
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={() => handleSaveProfile(profileIndex)} className="text-button text-white">
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteProfile} className="ml-2">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Profile
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div>No profiles available. Please add a profile.</div>
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteProfile}
        title="Delete Profile"
        description="Are you sure you want to delete this profile? This action cannot be undone."
      />
    </div>
  );
}
