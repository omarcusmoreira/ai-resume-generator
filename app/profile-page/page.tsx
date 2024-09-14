'use client'
import { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Save, Upload, Trash2 } from "lucide-react";
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useAppState } from '@/hooks/useAppState';
import { ProfileWizardComponent } from '@/components/profile-wizard';
import { ResumeState } from '@/types';

export default function ProfilePage() {
  const [appState, setAppState, saveState, isLoading] = useAppState();
  const [activeProfile, setActiveProfile] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleAddProfile = () => {
    setIsWizardOpen(true);
  };

  const handleSaveNewProfile = (newProfile: ResumeState) => {
    const profile = {
      name: newProfile.profileName,
      sections: [
        { title: "Qualification Summary", content: newProfile.qualificationSummary, aiEnhanced: "" },
        { title: "Professional Experience", content: newProfile.professionalExperience, aiEnhanced: "" },
        { title: "Academic Background", content: newProfile.academicBackground, aiEnhanced: "" },
        { title: "Idioms", content: newProfile.idioms.map(i => `${i.name}: ${i.level}`).join(', '), aiEnhanced: "" },
        { title: "Extracurricular", content: newProfile.extracurricular, aiEnhanced: "" },
      ]
    };
    setAppState({
      ...appState,
      profiles: [...appState.profiles, profile]
    });
    setIsWizardOpen(false);
  };

  const handleContentChange = (sectionIndex: number, content: string) => {
    if (activeProfile === null) return;
    const updatedProfiles = [...appState.profiles];
    updatedProfiles[activeProfile].sections[sectionIndex].content = content;
    updatedProfiles[activeProfile].sections[sectionIndex].aiEnhanced = `AI enhanced: ${content}`;
    setAppState({
      ...appState,
      profiles: updatedProfiles
    });
  };

  const handleSaveProfile = () => {
    saveState();
    console.log("Saving profile:", activeProfile !== null ? appState.profiles[activeProfile] : "No active profile");
  };

  const handleSavePersonalInfo = () => {
    saveState();
    console.log("Saving personal info:", appState.personalInfo);
  };

  const handlePictureUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAppState({
          ...appState,
          personalInfo: {
            ...appState.personalInfo,
            picture: reader.result as string
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProfile = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProfile = () => {
    if (activeProfile === null) return;
    const updatedProfiles = appState.profiles.filter((_, index) => index !== activeProfile);
    setAppState({
      ...appState,
      profiles: updatedProfiles
    });
    setActiveProfile(updatedProfiles.length > 0 ? Math.min(activeProfile, updatedProfiles.length - 1) : null);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-heading">Profile Manager</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl text-heading">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center justify-center mb-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={appState.personalInfo.picture} alt="Profile picture" />
                  <AvatarFallback>
                    {appState.personalInfo.picture ? '' : 'Upload'}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="picture-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer">
                  <Upload className="h-4 w-4" />
                </label>
                <input
                  id="picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePictureUpload}
                />
              </div>
            </div>
            {Object.entries(appState.personalInfo).map(([key, value]) => {
              if (key === 'picture') return null;
              return (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                    {key === 'birthDate' ? 'Birth Date' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <Input
                    id={key}
                    value={value}
                    onChange={(e) => setAppState({
                      ...appState,
                      personalInfo: {
                        ...appState.personalInfo,
                        [key]: e.target.value
                      }
                    })}
                    placeholder={`Enter your ${key === 'birthDate' ? 'birth date' : key}`}
                    type={key === 'birthDate' ? 'date' : 'text'}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSavePersonalInfo} className="text-button text-white">
            <Save className="mr-2 h-4 w-4" />
            Save Personal Info
          </Button>
        </CardFooter>
      </Card>
      {isWizardOpen ? (
        <ProfileWizardComponent 
          isOpen={isWizardOpen} 
          onClose={() => setIsWizardOpen(false)} 
          onSave={handleSaveNewProfile} 
        />
      ) : appState.profiles.length > 0 ? (
        <Tabs value={activeProfile?.toString() || ""} onValueChange={(value) => setActiveProfile(parseInt(value))}>
          <div className="flex items-center mb-4">
            <TabsList>
              {appState.profiles.map((profile, index) => (
                <TabsTrigger key={index} value={index.toString()}>{profile.name}</TabsTrigger>
              ))}
            </TabsList>
            <Button variant="outline" size="icon" className="ml-2" onClick={handleAddProfile}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          {appState.profiles.map((profile, profileIndex) => (
            <TabsContent key={profileIndex} value={profileIndex.toString()}>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Input 
                      value={profile.name} 
                      onChange={(e) => {
                        const updatedProfiles = [...appState.profiles];
                        updatedProfiles[profileIndex].name = e.target.value;
                        setAppState({
                          ...appState,
                          profiles: updatedProfiles
                        });
                      }}
                      className="text-xl font-bold"
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Textarea
                            placeholder={`Enter your ${section.title.toLowerCase()}...`}
                            value={section.content}
                            onChange={(e) => handleContentChange(sectionIndex, e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                        <div>
                          <div className="p-2 bg-muted rounded-md min-h-[100px]">
                            {section.aiEnhanced || "AI enhanced content will appear here."}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handleSaveProfile} className="text-button text-white">
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteProfile} className="text-button">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Profile
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-lg mb-4">No profiles created yet.</p>
            <Button onClick={handleAddProfile} className="text-button">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Profile
            </Button>
          </CardContent>
        </Card>
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