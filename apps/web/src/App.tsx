import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { RequireAuth } from './components/RequireAuth'
import { AuthPage } from './pages/AuthPage'
import { CvBuilderPage } from './pages/CvBuilderPage'
import { InterviewWizardPage } from './pages/InterviewWizardPage'
import { JobTargetsPage } from './pages/JobTargetsPage'
import { LandingPage } from './pages/LandingPage'
import { ResumesPage } from './pages/ResumesPage'
import { ResumeDetailPage } from './pages/ResumeDetailPage'
import { ResumeEditorPage } from './pages/ResumeEditorPage'
import { TemplatesPage } from './pages/TemplatesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="create" replace />} />
        <Route path="create" element={<InterviewWizardPage />} />
        <Route path="builder/:resumeId" element={<CvBuilderPage />} />
        <Route path="resumes" element={<ResumesPage />} />
        <Route path="resumes/:resumeId" element={<ResumeDetailPage />} />
        <Route path="resumes/:resumeId/edit" element={<ResumeEditorPage />} />
        <Route path="job-targets" element={<JobTargetsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="dashboard" element={<Navigate to="/app/create" replace />} />
        <Route path="onboarding" element={<Navigate to="/app/create" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
