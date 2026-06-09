import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProductShell } from './components/ProductShell'
import { RequireAuth } from './components/RequireAuth'
import { AuthPage } from './pages/AuthPage'
import { ChatCvPage } from './pages/ChatCvPage'
import { LandingPage } from './pages/LandingPage'
import { MarketingShell } from './components/MarketingShell'
import { CvBuilderPage } from './pages/CvBuilderPage'
import { JobTargetsPage } from './pages/JobTargetsPage'
import { ResumesPage } from './pages/ResumesPage'
import { ResumeDetailPage } from './pages/ResumeDetailPage'
import { ResumeEditorPage } from './pages/ResumeEditorPage'
import { TemplatesPage } from './pages/TemplatesPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingShell />}>
        <Route index element={<LandingPage />} />
      </Route>

      <Route element={<ProductShell />}>
        <Route path="create" element={<ChatCvPage />} />
      </Route>

      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/" replace />} />
        <Route path="resumes" element={<ResumesPage />} />
        <Route path="builder/:resumeId" element={<CvBuilderPage />} />
        <Route path="resumes/:resumeId" element={<ResumeDetailPage />} />
        <Route path="resumes/:resumeId/edit" element={<ResumeEditorPage />} />
        <Route path="job-targets" element={<JobTargetsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="chat" element={<Navigate to="/create" replace />} />
        <Route path="create" element={<Navigate to="/create" replace />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="onboarding" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
