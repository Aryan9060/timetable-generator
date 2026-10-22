import React from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import Container from '../components/Container'

const Home = () => {
  const { isAuthenticated, userData } = useSelector((state) => state.auth)

  const getDashboardLink = () => {
    if (!userData?.role) return '/login'
    const role = userData.role.toLowerCase()
    if (role === 'admin') return '/admin'
    if (role === 'faculty') return '/faculty'
    if (role === 'student') return '/student'
    return '/login'
  }

  return (
    <Container className="min-h-full bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6">
            Time<span className="text-primary">Table</span> Manager
          </h1>
          <p className="text-lg sm:text-xl text-text/70 mb-8 max-w-2xl mx-auto">
            A comprehensive solution for managing academic timetables, 
            faculty schedules, and student classes efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200 shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-surface text-text font-medium rounded-lg border border-border hover:bg-surface-hover transition-colors duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-text text-center mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ScheduleIcon />}
              title="Smart Scheduling"
              description="Automated timetable generation with conflict detection and optimization."
            />
            <FeatureCard
              icon={<UsersIcon />}
              title="User Management"
              description="Manage students, faculty, and administrators with role-based access."
            />
            <FeatureCard
              icon={<RoomIcon />}
              title="Resource Allocation"
              description="Efficiently allocate classrooms, labs, and other resources."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-text/60 text-sm">
          <p>© 2026 TimeTable Manager. All rights reserved.</p>
        </div>
      </footer>
    </Container>
  )
}

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 bg-surface rounded-xl border border-border hover:shadow-lg transition-shadow duration-200">
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
    <p className="text-text/70 text-sm">{description}</p>
  </div>
)

//* Icons
const ScheduleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const RoomIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
)

export default Home
