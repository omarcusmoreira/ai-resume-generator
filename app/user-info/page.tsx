'use client';
import { ChangeEvent, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Upload } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserDataStore } from '@/stores/userDataStore';
import { PersonalInfoType } from '@/types/users';

export default function UserInfo() {
  const { userData, fetchUserData, setUserData, updateUserData } = useUserDataStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userData) {
      fetchUserData();
    }
  }, [userData, fetchUserData]);

  const handlePictureUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (userData) {
          setUserData({
            ...userData,
            personalInfo: {
              ...userData.personalInfo,
              profilePicture: reader.result as string,
            },
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePersonalInfo = async () => {
    setIsSaving(true);
    console.log("Saving personal info:", userData);
    if (userData) {
      await updateUserData(userData); // Use updateUserData from store
    }
    setIsSaving(false);
  };

  const handleChange = (key: keyof PersonalInfoType, value: string) => {
    if (userData) {
      setUserData({
        ...userData,
        personalInfo: {
          ...userData.personalInfo,
          [key]: value,
        },
      });
    }
  };

  if (!userData) {
    return <div>Loading User Data...</div>;
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center">
      <Card className="w-full max-w-3xl p-4 md:p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-heading">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center justify-center mb-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={userData?.personalInfo?.profilePicture || ''} alt="Profile picture" />
                  <AvatarFallback>
                    {userData?.personalInfo?.profilePicture ? '' : 'Upload'}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="picture-upload" className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer">
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
            <Field
              key="name"
              label="Name"
              id="name"
              value={userData?.personalInfo?.name || ''}
              placeholder="Enter your name"
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Field
              key="email"
              label="Email"
              id="email"
              value={userData?.personalInfo?.email || ''}
              placeholder="Enter your email"
              onChange={(e) => handleChange('email', e.target.value)}
              disabled
            />
            <Field
              key="phone"
              label="Phone Number"
              id="phoneNumber"
              value={userData?.personalInfo?.phone || ''}
              placeholder="Enter your phone number"
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Field
              key="birthDate"
              label="Birth Date"
              id="birthDate"
              value={userData?.personalInfo?.birthDate || ''}
              placeholder="Enter your birth date"
              type="date"
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
            <Field
              key="linkedinURL"
              label="LinkedIn"
              id="linkedin"
              value={userData?.personalInfo?.linkedinURL || ''}
              placeholder="Enter your LinkedIn URL"
              type="text"
              onChange={(e) => handleChange('linkedinURL', e.target.value)}
            />
            <Field
              key="city"
              label="City"
              id="city"
              value={userData?.personalInfo?.city || ''}
              placeholder="Enter your city"
              type="text"
              onChange={(e) => handleChange('city', e.target.value)}    
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSavePersonalInfo} className="text-button text-white" disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  placeholder,
  type = "text",
  onChange,
  disabled,
}: {
  label: string;
  id: string;
  value: string;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
      />
    </div>
  );
}
