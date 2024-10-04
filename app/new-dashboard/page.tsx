'use client'
import React from 'react'
import { ChevronRight, X } from 'lucide-react'
import { OpportunityStatusEnum } from '@/types/opportunities'
import { useOpportunityStore } from '@/stores/opportunityStore'
import { Card } from '@/components/ui/card'

const statusColors: { [key in OpportunityStatusEnum]: string } = {
  [OpportunityStatusEnum.APPLIED]: '#4299E1',
  [OpportunityStatusEnum.HR_CONTACT]: '#48BB78',
  [OpportunityStatusEnum.INTERVIEW]: '#ECC94B',
  [OpportunityStatusEnum.OFFER]: '#38B2AC',
  [OpportunityStatusEnum.REJECTED]: '#F56565',
  [OpportunityStatusEnum.DECLINED]: '#ED8936',
  [OpportunityStatusEnum.CANCELED]: '#A0AEC0',
}

const jobFormatColors = {
  remote: '#9F7AEA',
  onsite: '#ED64A6',
  hybrid: '#4FD1C5',
}

export default function Dashboard() {

    const { opportunities } = useOpportunityStore();
  const statusData = Object.values(OpportunityStatusEnum).map(status => ({
    name: status,
    value: opportunities.filter(opp => opp.status === status).length,
  }))

  const jobFormatData = ['remote', 'onsite', 'hybrid'].map(format => ({
    name: format,
    value: opportunities.filter(opp => opp.jobFormat === format).length,
  }))

  const averageSalary = opportunities.reduce((sum, opp) => sum + (opp.salary || 0), 0) / opportunities.length

  const nextInterview = opportunities
    .flatMap(opp => opp.interviewStages || [])
    .filter(stage => stage.status === 'In Progress')
    .sort((a, b) => a.expectedDate.seconds - b.expectedDate.seconds)[0]

  const interviewStatusCounts = opportunities.reduce((acc, opp) => {
    if (opp.interviewStages) {
      opp.interviewStages.forEach(stage => {
        acc[stage.status] = (acc[stage.status] || 0) + 1
      })
    }
    return acc
  }, {} as Record<string, number>)

  const totalInterviews = Object.values(interviewStatusCounts).reduce((sum, count) => sum + count, 0)

  const resumeSuccess = opportunities.reduce((acc, opp) => {
    if (opp.resumeId) {
      acc[opp.resumeId] = (acc[opp.resumeId] || 0) + (opp.status === OpportunityStatusEnum.OFFER ? 1 : 0)
    }
    return acc
  }, {} as Record<string, number>)

  const mostSuccessfulResume = Object.entries(resumeSuccess).reduce((a, b) => a[1] > b[1] ? a : b)[0]

  const profileSalaryAverages = opportunities.reduce((acc, opp) => {
    if (opp.profileId && opp.salary) {
      if (!acc[opp.profileId]) {
        acc[opp.profileId] = { total: 0, count: 0 }
      }
      acc[opp.profileId].total += opp.salary
      acc[opp.profileId].count++
    }
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  const highestSalaryProfile = Object.entries(profileSalaryAverages).reduce((a, b) => 
    (a[1].total / a[1].count) > (b[1].total / b[1].count) ? a : b
  )[0]

  const nextInterviewCompany = opportunities.find(opp => 
    opp.interviewStages?.some(stage => stage.id === nextInterview?.id)
  )?.companyName

  const totalOpportunities = opportunities.length
  const activeOpportunities = opportunities.filter(opp => 
    opp.status !== OpportunityStatusEnum.REJECTED && 
    opp.status !== OpportunityStatusEnum.DECLINED && 
    opp.status !== OpportunityStatusEnum.CANCELED
  ).length

  const opportunityWithMostInterviews = opportunities.reduce((best, current) => {
    const bestInterviews = best.interviewStages?.length || 0
    const currentInterviews = current.interviewStages?.length || 0
    return currentInterviews > bestInterviews ? current : best
  })

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto flex items-center justify-center mb-12 sm:mb-0">
      <Card className="w-full max-w-3xl md:p-6 p-1 space-y-4">
      {nextInterview && (
        <div className="bg-green-500 rounded-lg shadow p-4 relative">
          <X className="absolute top-2 right-2 text-white w-5 h-5" />
          <h2 className="text-xl font-semibold text-white mb-2">Seu próximo passo</h2>
          <div className="bg-white rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próxima entrevista</p>
              <p className="font-semibold">
                {new Date(nextInterview.expectedDate.seconds * 1000).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">Recruiter ID: {nextInterview.recruiterId}</p>
              <p className="text-xs text-gray-500">Company: {nextInterviewCompany}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Active Opportunities</h2>
          <p className="text-3xl font-bold text-blue-600">{activeOpportunities}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Total Opportunities</h2>
          <p className="text-3xl font-bold text-purple-600">{totalOpportunities}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Resume Success</h2>
          <p className="text-sm">Most successful resume: <span className="font-semibold">{mostSuccessfulResume}</span></p>
          <p className="text-sm">Number of offers: <span className="font-semibold">{resumeSuccess[mostSuccessfulResume]}</span></p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Highest Salary Profile</h2>
          <p className="text-sm">Profile ID: <span className="font-semibold">{highestSalaryProfile}</span></p>
          <p className="text-sm">Average Salary: <span className="font-semibold">${(profileSalaryAverages[highestSalaryProfile].total / profileSalaryAverages[highestSalaryProfile].count).toFixed(2)}</span></p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Interview Progress</h2>
        <div className="space-y-2">
          {Object.entries(interviewStatusCounts).map(([status, count]) => (
            <div key={status}>
              <div className="flex justify-between text-sm mb-1">
                <span>{status}</span>
                <span>{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(count / totalInterviews) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h3 className="text-md font-semibold">Highest Chance of Success</h3>
          <p className="text-sm">Company: <span className="font-semibold">{opportunityWithMostInterviews.companyName}</span></p>
          <p className="text-sm">Interviews: <span className="font-semibold">{opportunityWithMostInterviews.interviewStages?.length || 0}</span></p>
          <p className="text-xs text-gray-500">This opportunity has progressed through the most interview stages, indicating a higher chance of success.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Opportunity Status</h2>
        <div className="space-y-2">
          {statusData.map((status) => (
            <div key={status.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{status.name}</span>
                <span>{status.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{ 
                    width: `${(status.value / totalOpportunities) * 100}%`,
                    backgroundColor: statusColors[status.name as OpportunityStatusEnum]
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Job Format Distribution</h2>
        <div className="space-y-2">
          {jobFormatData.map((format) => (
            <div key={format.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{format.name}</span>
                <span>{format.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full"
                  style={{ 
                    width: `${(format.value / totalOpportunities) * 100}%`,
                    backgroundColor: jobFormatColors[format.name as keyof typeof jobFormatColors]
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Salary Insights</h2>
        <p className="text-3xl font-bold text-green-600">${averageSalary.toFixed(2)}</p>
        <p className="text-sm text-gray-600">Average Salary</p>
      </div>
      </Card>
    </div>
  )
}