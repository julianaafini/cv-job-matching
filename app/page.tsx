import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import {
  ArrowRight,
  FileText,
  Briefcase,
  Mail,
  CheckCircle2,
  Sparkles,
  Upload,
  Search,
  Percent,
  Code,
  Clock,
  Infinity,
  ListChecks,
  BarChart3,
  FileDown,
  Bell,
  MessageSquareText,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900/50">
      <AppHeader />
      <main className="flex-1">
        <section className="relative min-h-[80vh] flex items-center justify-center">
          {/* Background Image with overlay */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: "linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url('/dashboard-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          ></div>
          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full">
            <h1 className="text-5xl font-bold tracking-tight text-white mb-4 text-center">
              Your AI career assistant
            </h1>
            <p className="text-xl text-white mb-8 text-center max-w-2xl">
              Find your perfect job match with SmartMatch — our AI-powered job recommendation tool.
            </p>
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/dashboard/smartmatch">
                Try SmartMatch <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">All-in-one Career Tools</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our AI-powered platform helps you optimize every step of your job search process.
                </p>
              </div>
            </div>

            {/* Featured Tool */}
            <div className="mx-auto max-w-5xl mt-12 mb-16">
              <div className="relative overflow-hidden rounded-lg border-2 border-primary/30 bg-primary/5 p-2">
                <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">
                  Available Now
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                    <Briefcase className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold">SmartMatch</h3>
                    <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                      Upload your CV and get matched with the perfect jobs based on your skills and preferences. Our AI
                      technology analyzes your resume and finds opportunities that align with your experience.
                    </p>
                    <Button asChild size="lg" className="mt-4">
                      <Link href="/dashboard/smartmatch">
                        Try SmartMatch <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-center mb-8">Coming Soon</h3>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12">
              <Card className="flex flex-col items-center text-center opacity-80">
                <CardHeader>
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                  </div>
                  <CardTitle>CVLift</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Optimize your CV with AI-powered suggestions tailored to specific job descriptions.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center opacity-80">
                <CardHeader>
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
                      <Mail className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </div>
                  </div>
                  <CardTitle>CoverGen</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Generate personalized cover letters that highlight your relevant skills and experience.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section - Moved above Success Stories */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Choose Your Plan</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Select the plan that best fits your job search needs
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-12">
              {/* Free Plan */}
              <Card className="flex flex-col border-2">
                <CardHeader className="pb-0">
                  <div className="mb-2 flex items-center justify-center">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1 text-sm"
                    >
                      Free Plan
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-center">Basic Match</CardTitle>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">Free</span>
                    <span className="text-muted-foreground ml-1">forever</span>
                  </div>
                  <CardDescription className="text-center pt-4">
                    For casual job seekers, students, and first-time users
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" /> Includes:
                      </h3>
                      <ul className="space-y-3 pl-7">
                        <li className="flex items-start">
                          <Upload className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            Upload and parse <span className="font-semibold text-primary">1 CV</span>
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Search className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            View top <span className="font-semibold text-primary">5 job matches</span>
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Percent className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            View <span className="font-semibold text-primary">basic match score</span> (%)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Code className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            See <span className="font-semibold text-primary">5 matched skills</span> per job
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Clock className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            Limited to <span className="font-semibold text-primary">5 job searches/month</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button asChild className="w-full" variant="outline">
                    <Link href="/dashboard/smartmatch">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Premium Plan */}
              <Card className="flex flex-col border-2 border-primary bg-primary/5 relative">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">Recommended</Badge>
                </div>
                <CardHeader className="pb-0">
                  <div className="mb-2 flex items-center justify-center">
                    <Badge variant="outline" className="bg-primary/10 text-primary px-3 py-1 text-sm">
                      Premium Plan
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-2xl text-center">SmartMatch Pro</CardTitle>
                    <span className="text-primary">
                      <Sparkles className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-4xl font-bold">€9.99</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                    <p className="text-sm text-muted-foreground mt-1">(or €24.99/quarter)</p>
                  </div>
                  <CardDescription className="text-center pt-4">
                    For active job seekers, career switchers, and professionals
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" /> Includes everything in Free, plus:
                      </h3>
                      <ul className="space-y-3 pl-7">
                        <li className="flex items-start">
                          <Infinity className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-semibold text-primary">Unlimited CV uploads</span> (track multiple
                            roles)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Zap className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-semibold text-primary">Unlimited job searches</span> & matches
                          </span>
                        </li>
                        <li className="flex items-start">
                          <ListChecks className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            See top <span className="font-semibold text-primary">15 matches</span> per CV
                          </span>
                        </li>
                        <li className="flex items-start">
                          <BarChart3 className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-semibold text-primary">Skill gap analysis</span> + suggestions
                          </span>
                        </li>
                        <li className="flex items-start">
                          <FileDown className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            Download <span className="font-semibold text-primary">full PDF reports</span>
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Bell className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            <span className="font-semibold text-primary">SmartMatch alerts</span> (weekly new match
                            notifications)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <MessageSquareText className="mr-2 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>
                            Priority <span className="font-semibold text-primary">LLM-powered "Why This Job"</span>{" "}
                            insights
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button asChild className="w-full">
                    <Link href="/dashboard/smartmatch">Try Premium</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Success Stories Section - Now below Pricing */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Success Stories</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  See how our platform has helped job seekers land their dream roles.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-12">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <p className="text-gray-500 italic">
                      "Using CareerAI, I optimized my CV and generated a tailored cover letter that helped me stand out.
                      I landed my dream job within 2 weeks!"
                    </p>
                    <div>
                      <p className="font-semibold">Sarah J.</p>
                      <p className="text-sm text-gray-500">Software Developer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <p className="text-gray-500 italic">
                      "The SmartMatch feature found me job opportunities I wouldn't have discovered otherwise. The AI
                      recommendations were spot on!"
                    </p>
                    <div>
                      <p className="font-semibold">Michael T.</p>
                      <p className="text-sm text-gray-500">Marketing Specialist</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 CareerAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Contact
            </Link>
            <Link
              href="https://linkedin.com"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
