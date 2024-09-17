'use client'

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Sparkles, TrashIcon } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 md:p-6 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Job Application Profiles</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">Add New Profile</Button>
            <Button variant="ghost" size="icon">
              <Plus className="w-5 h-5" />
              <span className="sr-only">Add New Profile</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="profiles" className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="product-manager">Product Manager</TabsTrigger>
              <TabsTrigger value="profile-3" disabled>Profile 3</TabsTrigger>
              <TabsTrigger value="profile-4" disabled>Profile 4</TabsTrigger>
              <TabsTrigger value="profile-5" disabled>Profile 5</TabsTrigger>
            </TabsList>
            <TabsContent value="profiles">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <ProfileCard />
                </div>
                <div className="space-y-6">
                  <EnhancedTextCard />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="product-manager">
              {/* Similar structure for Product Manager tab */}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function ProfileCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Input defaultValue="Software Engineer" className="text-xl font-bold" />
          <Button variant="ghost" size="icon">
            <TrashIcon className="w-5 h-5" />
            <span className="sr-only">Delete Profile</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderProfileField("Keywords", "keywords", "software engineer, full-stack, javascript, react, node.js")}
        {renderProfileField("Qualification Summary", "qualification-summary", "Experienced software engineer with a strong background in full-stack web development...", true)}
        {renderProfileField("Professional Experience", "professional-experience", "- Developed and maintained multiple web applications...", true)}
        {renderProfileField("Academic Background", "academic-background", "Bachelor's degree in Computer Science...", true)}
        {renderProfileField("Idioms", "idioms", "Fluent in English and Spanish...", true)}
        {renderProfileField("Extracurricular", "extracurricular", "Actively involved in local community service projects...", true)}
      </CardContent>
    </Card>
  )
}

function EnhancedTextCard() {
  return (
    <Card>
      <CardHeader>
        <div className="text-xl font-bold">Enhanced Text</div>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="enhanced-column">Enhanced Column</Label>
          <p className="mt-1">
            Developed and implemented a custom data visualization tool to enhance reporting capabilities.
            Created a machine learning model to improve customer churn prediction.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function renderProfileField(label: string, id: string, defaultValue: string, isTextarea: boolean = false) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>{label}</Label>
          <Button variant="ghost" size="icon" onClick={() => {}}>
            <Sparkles className="h-5 w-5" />
            <span className="sr-only">Enhance</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isTextarea ? (
          <Textarea
            id={id}
            rows={3}
            className="mt-1"
            defaultValue={defaultValue}
          />
        ) : (
          <Input
            id={id}
            className="mt-1"
            defaultValue={defaultValue}
          />
        )}
      </CardContent>
    </Card>
  )
}
