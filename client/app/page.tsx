import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import LandingPage from '@/app/components/LandingPage'
import HomeDashboard from '@/app/components/HomeDashboard'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return <LandingPage />
  }

  return <HomeDashboard userName={session.user.name || 'User'} />
}
