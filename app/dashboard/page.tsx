import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, FileText, Mail, Sparkles } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="relative space-y-8">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-black/60"
        style={{
          backgroundImage: "url('/background-main.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7)",
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 text-white">
            Welcome to your AI career assistant. Get started with SmartMatch, our flagship tool.
          </p>
        </div>

        {/* Featured Tool - SmartMatch */}
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">SmartMatch</CardTitle>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Featured
                  </span>
                </div>
                <CardDescription className="text-base mt-1">
                  Find the perfect job matches based on your CV and preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="mb-4 text-muted-foreground">
              Upload your CV and set your preferences to get matched with jobs that are perfect for your skills and
              experience. Our AI analyzes your resume to find the best opportunities.
            </p>
            <Button asChild size="lg" className="mt-2">
              <Link href="/dashboard/smartmatch">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mt-8 mb-4 text-white">Coming Soon</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="opacity-90">
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-2">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>CVLift</CardTitle>
              <CardDescription>Optimize your CV with AI-powered suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full mt-2">
                To be Released
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-90">
            <CardHeader className="pb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-2">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>CoverGen</CardTitle>
              <CardDescription>Generate personalized cover letters for your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full mt-2">
                To be Released
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
