import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { ProfileType } from '@/types/profiles'
import { useProfileStore } from '@/stores/profileStore'

interface ProfileNameInputProps {
  profile: ProfileType
}

export const ProfileNameInput: React.FC<ProfileNameInputProps> = ({ profile }) => {
  const [localProfileName, setLocalProfileName] = useState(profile.profileName)
  const { updateProfile } = useProfileStore()

  useEffect(() => {
    setLocalProfileName(profile.profileName)
  }, [profile.profileName])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalProfileName(e.target.value)
  }

  const handleBlur = async () => {
    if (localProfileName !== profile.profileName) {
      await updateProfile({ ...profile, profileName: localProfileName })
    }
  }

  return (
    <Input
      value={localProfileName}
      onChange={handleNameChange}
      onBlur={handleBlur}
      className="text-2xl font-bold bg-transparent border-none hover:bg-gray-100 focus:bg-white"
      aria-label="Profile name"
    />
  )
}