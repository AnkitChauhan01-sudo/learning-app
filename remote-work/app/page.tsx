import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, CheckCircle2, MessageSquare, FileText, LayoutDashboard, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">RemoteWork</span>
        </div>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Collaborate Seamlessly
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              Work Remotely, Stay Connected
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            All-in-one platform for task management, real-time chat, and document collaboration.
            Built for modern remote teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </SignedIn>
            <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-lg font-semibold">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Work Together
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Powerful features designed for remote collaboration
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Task Board */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Task Board
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Organize your work with drag-and-drop kanban boards. Track progress, assign tasks, and stay on top of deadlines.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Drag & drop tasks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Priority levels
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Due dates & reminders
              </li>
            </ul>
          </div>

          {/* Real-time Chat */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Real-time Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Communicate instantly with your team. Share ideas, get feedback, and stay connected throughout the day.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Instant messaging
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Workspace channels
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Message history
              </li>
            </ul>
          </div>

          {/* Document Collaboration */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Doc Collaboration
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create and edit documents together in real-time. See changes as they happen and collaborate seamlessly.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Real-time editing
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Version history
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Access control
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 bg-white dark:bg-gray-800 rounded-3xl my-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose RemoteWork?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Built with performance in mind. Experience instant updates and smooth collaboration.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Team Focused
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Designed for teams of all sizes. From startups to enterprises, we&apos;ve got you covered.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Secure & Private
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your data is encrypted and secure. We take privacy seriously.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <LayoutDashboard className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  All-in-One
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No need to switch between multiple tools. Everything you need in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Remote Work?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of teams already using RemoteWork to collaborate better.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold">
                Get Started for Free
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors text-lg font-semibold"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <LayoutDashboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">RemoteWork</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © 2024 RemoteWork. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
