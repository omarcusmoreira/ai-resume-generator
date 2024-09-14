'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, History, FileText, Zap } from "lucide-react"

export function ResumeGenerator() {
  const [jobDescription, setJobDescription] = useState('')

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="flex flex-col h-full">
          <div className="p-4 flex justify-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
          <nav className="flex-1 p-4">
            <Button variant="ghost" className="w-full justify-start mb-2">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Opportunity
            </Button>
            <Button variant="ghost" className="w-full justify-start mb-2">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Manage Resumes
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">AI Resume Generator</h1>
          <p className="text-gray-600 mb-6">Paste your job description and let AI create a tailored resume for you.</p>
          <Textarea 
            placeholder="Paste job description here..." 
            className="mb-4 h-64"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Generate Resume
            </Button>
            <Button variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              <Zap className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}