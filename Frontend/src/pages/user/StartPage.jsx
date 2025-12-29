import { BookOpen, Map, Youtube, Zap } from "lucide-react"
import { Link } from "react-router-dom";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-gray-500 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">Skill Hub</span>
            </div>
            <Link to="/login" className="text-white font-semibold border-1 border-blue-600 bg-blue-600 rounded-2xl px-5 py-1">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 text-foreground sm:text-5xl lg:text-6xl text-balance">
                Learn Smarter,
                <span className="text-primary "> Faster, Better</span>
              </h1>
              <div className="max-w-2xl space-y-4 text-gray-600">
                <p>
                  Skillhub transforms the way students learn with personalized quizzes, expert-crafted learning roadmaps, and carefully curated YouTube tutorials—built to develop real-world skills, track progress, and deliver measurable results.
                </p>
                <p>
                  It brings structure to scattered learning by organizing the best resources into a clear, step-by-step path—so students always know what to learn, when to learn, and why it matters.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="text-white font-semibold hover:bg-white hover:text-blue-700 hover:border-1 hover:border-blue-700 border-1  border-blue-700  bg-blue-700 rounded-full px-9 py-3">
                  Go now
                </Link>

              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <img
                src="/student.jpeg"
                alt="Student learning illustration"
                className="w-full h-full rounded-2xl object-cover"
              />

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-700 text-foreground mb-4">Why Choose Our Platform?</h2>
            <p className="text-muted-foreground text-gray-900 text-lg max-w-2xl mx-auto">
              Everything you need to accelerate your learning journey in one place
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Daily Quiz */}
            <div className="p-6 text-center transition-shadow rounded-xl bg-card text-card-foreground border border-gray-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-blue-700 text-foreground mb-2">Daily Quiz</h3>
              <p className="text-sm text-gray-600 ">
                Challenge yourself with personalized daily quizzes tailored to your learning goals
              </p>
            </div>

            {/* Roadmap Guidance */}
            <div className="p-6 text-center  transition-shadow rounded-xl bg-card text-card-foreground border border-gray-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-blue-700 text-foreground mb-2">Roadmap Guidance</h3>
              <p className="text-sm text-gray-600 text-muted-foreground">
                Follow structured learning paths designed by experts to master any subject
              </p>
            </div>

            {/* Best Free Content */}
            <div className="p-6 text-center  transition-shadow rounded-xl bg-card text-card-foreground border border-gray-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Youtube className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-blue-700 text-foreground mb-2">Best Free Content</h3>
              <p className="text-sm text-gray-600 text-muted-foreground">
                Access curated YouTube tutorials and free materials from top educators
              </p>
            </div>

            {/* Smart Learning */}
            <div className="p-6 text-center  transition-shadow rounded-xl bg-card text-card-foreground border border-gray-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-blue-700 text-foreground mb-2">Smart Learning</h3>
              <p className="text-sm text-gray-600 text-muted-foreground">
                AI-powered recommendations adapt to your learning style and progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-500 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Skillhub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
