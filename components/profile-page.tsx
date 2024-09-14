'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Save, Upload } from "lucide-react"

type UserInfo = {
  name: string
  picture: string
}

type ProfileSection = {
  title: string
  content: string
  aiEnhanced: string
}

type Profile = {
  name: string
  sections: ProfileSection[]
}

type AppState = {
  userInfo: UserInfo
  profiles: Profile[]
}

const initialUserInfo: UserInfo = {
  name: "John Doe", // This would typically come from the user's account
  picture: ""
}

const initialProfile: Profile = {
  name: "Backend Developer",
  sections: [
    { title: "Qualification Summary", content: "", aiEnhanced: "" },
    { title: "Academic Background", content: "", aiEnhanced: "" },
    { title: "Professional Experience", content: "", aiEnhanced: "" },
    { title: "Idioms", content: "", aiEnhanced: "" },
    { title: "Extras", content: "", aiEnhanced: "" },
  ]
}

export function ProfilePageComponent() {
  const [userInfo, setUserInfo] = useState<UserInfo>(initialUserInfo)
  const [profiles, setProfiles] = useState<Profile[]>([initialProfile])
  const [activeProfile, setActiveProfile] = useState(0)

  useEffect(() => {
    const savedState = localStorage.getItem('resumeAppState')
    if (savedState) {
      const parsedState: AppState = JSON.parse(savedState)
      setUserInfo(parsedState.userInfo)
      setProfiles(parsedState.profiles)
    }
  }, [])

  useEffect(() => {
    const appState: AppState = { userInfo, profiles }
    localStorage.setItem('resumeAppState', JSON.stringify(appState))
  }, [userInfo, profiles])

  const handleAddProfile = () => {
    const newProfile: Profile = {
      name: `Profile ${profiles.length + 1}`,
      sections: initialProfile.sections.map(section => ({ ...section, content: "", aiEnhanced: "" }))
    }
    setProfiles([...profiles, newProfile])
    setActiveProfile(profiles.length)
  }

  const handleContentChange = (sectionIndex: number, content: string) => {
    const updatedProfiles = [...profiles]
    updatedProfiles[activeProfile].sections[sectionIndex].content = content
    // Simulate AI enhancement (replace with actual AI call in production)
    updatedProfiles[activeProfile].sections[sectionIndex].aiEnhanced = `AI enhanced: ${content}`
    setProfiles(updatedProfiles)
  }

  const handleSaveProfile = () => {
    // Implement save logic here (e.g., API call to save the profile)
    console.log("Saving profile:", profiles[activeProfile])
  }

  const handlePictureUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUserInfo(prev => ({ ...prev, picture: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {userInfo.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userInfo.picture} alt="Profile picture" />
                <AvatarFallback>{userInfo.name.charAt(0)}</AvatarFallback>
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
            <div>
              <h2 className="text-xl font-semibold">Your Profiles</h2>
              <p className="text-muted-foreground">Manage your resume profiles below</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs value={activeProfile.toString()} onValueChange={(value) => setActiveProfile(parseInt(value))}>
        <div className="flex items-center mb-4">
          <TabsList>
            {profiles.map((profile, index) => (
              <TabsTrigger key={index} value={index.toString()}>{profile.name}</TabsTrigger>
            ))}
          </TabsList>
          <Button variant="outline" size="icon" className="ml-2" onClick={handleAddProfile}>
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        {profiles.map((profile, profileIndex) => (
          <TabsContent key={profileIndex} value={profileIndex.toString()}>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Input 
                    value={profile.name} 
                    onChange={(e) => {
                      const updatedProfiles = [...profiles]
                      updatedProfiles[profileIndex].name = e.target.value
                      setProfiles(updatedProfiles)
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
              <CardFooter>
                <Button onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile as Resume
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}