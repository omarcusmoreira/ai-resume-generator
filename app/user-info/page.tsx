'use client'
import { ChangeEvent, useEffect, useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader, Save, Upload } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserDataStore } from '@/stores/userDataStore';
import { PersonalInfoType, UserDataType } from '@/types/users';
import { useToast } from '@/hooks/use-toast';
import EnhancedQuotaDisplay from '@/components/EnhancedQuotaDisplay';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Image from 'next/image';

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function UserInfo() {
  const { toast } = useToast();
  const { userData, fetchUserData, updateUserData } = useUserDataStore();
  const [localUserData, setLocalUserData] = useState<UserDataType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [showCropModal, setShowCropModal] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const aspect = 1;

  useEffect(() => {
    if (!userData) {
      fetchUserData();
    } else {
      setLocalUserData(userData);
    }
  }, [userData, fetchUserData]);

  useEffect(() => {
    if (userData && localUserData) {
      setHasChanges(JSON.stringify(userData) !== JSON.stringify(localUserData));
    }
  }, [userData, localUserData]);

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
      setShowCropModal(true);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [aspect]);

  const handleSaveCrop = useCallback(() => {
    if (completedCrop?.width && completedCrop?.height && imgSrc && imgRef.current && localUserData) {
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const canvas = document.createElement('canvas');
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setLocalUserData({
              ...localUserData,
              personalInfo: {
                ...localUserData.personalInfo,
                profilePicture: reader.result as string,
              },
            });
            setShowCropModal(false);
            setHasChanges(true);
          };
          reader.readAsDataURL(blob);
        }
      });
    }
  }, [completedCrop, imgSrc, localUserData]);

  const handleSavePersonalInfo = async () => {
    if (localUserData) {
      setIsSaving(true);
      try {
        await updateUserData(localUserData);
        toast({
          title: "Suas informações foram atualizadas com sucesso.",
        });
        setHasChanges(false);
      } catch (error) {
        toast({
          title: "Error updating user information",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleChange = (key: keyof PersonalInfoType, value: string) => {
    if (localUserData) {
      setLocalUserData({
        ...localUserData,
        personalInfo: {
          ...localUserData.personalInfo,
          [key]: value,
        },
      });
    }
  };

  if (!localUserData) {
    return <div>Loading User Data...</div>;
  }

  return (
    <div className="flex-1 p-2 md:p-8 overflow-auto flex items-center justify-center flex-col">
      <Card className="w-full max-w-3xl p-2 md:p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-heading">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center justify-center mb-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={localUserData?.personalInfo?.profilePicture || ''} alt="Profile picture" />
                  <AvatarFallback>
                    {localUserData?.personalInfo?.profilePicture ? '' : 'Sem Foto'}
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
                  onChange={onSelectFile}
                />
              </div>
            </div>
            <Field
              label="Nome"
              id="name"
              value={localUserData?.personalInfo?.name || ''}
              placeholder="Digite seu nome"
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Field
              label="Email"
              id="email"
              value={localUserData?.personalInfo?.email || ''}
              placeholder="Digite seu email"
              onChange={(e) => handleChange('email', e.target.value)}
              disabled
            />
            <Field
              label="Telefone"
              id="phoneNumber"
              value={localUserData?.personalInfo?.phone || ''}
              placeholder="Digite seu número de telefone"
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Field
              label="Data de Nascimento"
              id="birthDate"
              value={localUserData?.personalInfo?.birthDate || ''}
              placeholder="Digite sua data de nascimento"
              type="date"
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
            <Field
              label="LinkedIn"
              id="linkedin"
              value={localUserData?.personalInfo?.linkedinURL || ''}
              placeholder="Digite a URL do seu perfil"
              type="text"
              onChange={(e) => handleChange('linkedinURL', e.target.value)}
            />
            <Field
              label="Cidade/Estado"
              id="city"
              value={localUserData?.personalInfo?.city || ''}
              placeholder="Digite sua Cidade/Estado"
              type="text"
              onChange={(e) => handleChange('city', e.target.value)}    
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSavePersonalInfo} 
            className={`text-button text-white ${hasChanges ? 'bg-green-500 hover:bg-green-600' : ''}`} 
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader className={'block animate-spin mr-2 h-4 w-4'} />
                Salvar
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      <EnhancedQuotaDisplay />
      
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg overflow-hidden max-w-full max-h-full flex flex-col">
            <div className="p-4 flex-grow overflow-auto">
              {Boolean(imgSrc) && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  <Image
                    ref={imgRef}
                    src={imgSrc}
                    alt="Crop me"
                    onLoad={onImageLoad}
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              )}
            </div>
            <div className="p-4 flex justify-end bg-gray-100">
              <Button onClick={() => setShowCropModal(false)} className="mr-2">Cancel</Button>
              <Button onClick={handleSaveCrop}>Save</Button>
            </div>
          </div>
        </div>
      )}
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