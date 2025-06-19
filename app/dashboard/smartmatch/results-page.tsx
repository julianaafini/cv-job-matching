"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  MapPin,
  Building,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Download,
  BookmarkPlus,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Search,
  ArrowUpDown,
  Info,
  Lock,
  Crown,
} from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define types for job data based on your model output
interface Job {
  id: number
  title_en: string
  company: string
  location: string
  is_remote: boolean
  weighted_score: number
  matchedSkills: string[] | null
  missingSkills: string[] | null
  description_en: string
  postedDate: string
  jobType: string
  jobLevel: string
  salarySim: string
  semanticFit: string | null
  confidenceLevel: string | null
  job_url: string
  // Add any other fields your model returns
}

// Define types for CV data
interface CvData {
  personalInfo: {
    name: string
  }
  experiences: {
    company: string
  }[]
}

// Premium job teaser
const premiumJobTeaser = {
  title_en: "AI Engineering Lead",
  company: "FutureTech AI",
  location: "Remote",
  is_remote: true,
  score_model1: 0.95,
  matchedSkills: ["React", "TypeScript", "AI", "Machine Learning"],
  missingSkills: ["PyTorch", "TensorFlow"],
  description_en: "Lead our AI engineering team to build cutting-edge solutions...",
  postedDate: "Just now",
  jobType: "Full-time",
  jobLevel: "Lead",
  salarySim: "$50K",
  semanticFit: "Your technical skills and leadership experience make you a perfect match for this role.",
  confidenceLevel: "High",
  job_url: "https://example.com/job/6",
}


// Skill categories for the radar chart
const skillCategories = [
  { name: "Frontend", score: 85 },
  { name: "Backend", score: 40 },
  { name: "Design", score: 60 },
  { name: "DevOps", score: 30 },
  { name: "Soft Skills", score: 75 },
]

export default function ResultsPage() {
  const router = useRouter()
  const [activeJobId, setActiveJobId] = useState<number | null>(null)
  const [matchScoreFilter, setMatchScoreFilter] = useState<[number, number]>([0, 100])
  const [cvData, setCvData] = useState<CvData>({
    personalInfo: {
      name: "Carla Novares",
    },
    experiences: [],
  })
  // Initialize jobs as empty, will load from localStorage
  const [jobs, setJobs] = useState<Job[]>([])
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [sortOption, setSortOption] = useState<string>("match")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    // Load jobs from localStorage (output of model.py)
    if (typeof window !== "undefined") {
      const jobsStr = localStorage.getItem("smartmatch_jobs")
      if (jobsStr) {
        try {
          const jobsArr = JSON.parse(jobsStr)
          setJobs(jobsArr)
        } catch (error) {
          console.error("Error parsing jobs from localStorage:", error)
        }
      }

      // Load CV data
      const storedCvData = localStorage.getItem("careerAI_cvData")
      if (storedCvData) {
        try {
          const parsedData = JSON.parse(storedCvData)
          setCvData(parsedData)
        } catch (error) {
          console.error("Error parsing CV data from localStorage:", error)
        }
      }

      // Load filter state
      const filterState = localStorage.getItem("careerAI_filterState")
      if (filterState) {
        try {
          const parsedState = JSON.parse(filterState)
          if (parsedState.matchScoreFilter) {
            setMatchScoreFilter(parsedState.matchScoreFilter)
          }
        } catch (error) {
          console.error("Error parsing filter state from localStorage:", error)
        }
      }
    }
  }, [])

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
    if (score >= 75) return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
    if (score >= 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400"
    return "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
  }

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case "High":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            High Confidence
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
            Medium Confidence
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            Low Confidence
          </Badge>
        )
      default:
        return null
    }
  }

  // Update the function that handles sorting
  const handleSortChange = (value: string) => {
    setSortOption(value)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const parseSalary = (salarySim: string): number => {
    if (!salarySim || typeof salarySim !== "string") return 0;
    // Try to find all numbers (e.g., $50K-$70K or $120,000)
    const matches = salarySim.match(/\d+(?:,\d+)?/g);
    if (!matches) return 0;
    // Convert to numbers, remove commas, and pick the highest (for high-to-low) or lowest (for low-to-high)
    const numbers = matches.map((s) => Number(s.replace(/,/g, "")));
    if (numbers.length === 0) return 0;
    return Math.max(...numbers); // Use Math.min(...numbers) for low-to-high
  };

  // 1. Robust salary range function
  const getSalaryRange = (salarySim: string): string => {
    if (!salarySim || typeof salarySim !== "string") return "unknown";
    // Match numbers with optional K/M suffix (e.g., $120K, $120,000, $1M)
    const matches = salarySim.match(/\d+(?:,\d+)?(?:[kKmM])?/g);
    if (!matches) return "unknown";
    // Convert to numbers, handling K/M suffixes
    const numbers = matches.map((s) => {
      let num = Number(s.replace(/[^0-9]/g, ""));
      if (/k$/i.test(s)) num *= 1000;
      if (/m$/i.test(s)) num *= 1000000;
      return num;
    });
    if (numbers.length === 0) return "unknown";
    const maxSalary = Math.max(...numbers);

    if (maxSalary >= 150000) return "150k+";
    if (maxSalary > 120000) return "120-150k";
    if (maxSalary > 90000) return "90-120k";
    if (maxSalary > 0) return "below90k";
    return "unknown";
  };

  function parsePostedDate(dateStr: string): number {
    if (!dateStr) return 0;
    if (dateStr.toLowerCase().includes("just now")) return Date.now();
    const match = dateStr.match(/(\d+)\s+(minute|hour|day|week|month|year)s?\s+ago/i);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const now = Date.now();
      switch (unit) {
        case "minute": return now - value * 60 * 1000;
        case "hour": return now - value * 60 * 60 * 1000;
        case "day": return now - value * 24 * 60 * 60 * 1000;
        case "week": return now - value * 7 * 24 * 60 * 60 * 1000;
        case "month": return now - value * 30 * 24 * 60 * 60 * 1000;
        case "year": return now - value * 365 * 24 * 60 * 60 * 1000;
        default: return 0;
      }
    }
    // Try to parse as ISO date
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? 0 : parsed;
  }

  const sortJobs = (jobs: Job[]) => {
    const jobsCopy = [...jobs];

    switch (sortOption) {
      case "salary-high":
        return jobsCopy.sort((a, b) => parseSalary(b.salarySim) - parseSalary(a.salarySim));
      case "salary-low":
        return jobsCopy.sort((a, b) => parseSalary(a.salarySim) - parseSalary(b.salarySim));
      case "recent":
        return jobsCopy.sort((a, b) => parsePostedDate(b.postedDate) - parsePostedDate(a.postedDate));
      // ...other cases...
      default:
        return jobsCopy;
    }
  };

  // Update the filteredJobs to include search filtering
  const filteredJobs = useMemo(() => {
    return sortJobs(
      jobs.filter((job) => {
        // First filter by match score
        const matchScoreFilterCheck = job.weighted_score * 100 >= matchScoreFilter[0] && job.weighted_score * 100 <= matchScoreFilter[1]

        // Then filter by search query if one exists
        const matchedSkillsArray = Array.isArray(job.matchedSkills) ? job.matchedSkills : [];
        const searchFilter = searchQuery
          ? job.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            matchedSkillsArray.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
          : true

        return matchScoreFilterCheck && searchFilter
      }),
    )
  }, [jobs, matchScoreFilter, searchQuery, sortOption])

  // 2. Initialize buckets
  const salaryBuckets: Record<"150k+" | "120-150k" | "90-120k" | "below90k" | "unknown", number> = {
    "150k+": 0,
    "120-150k": 0,
    "90-120k": 0,
    below90k: 0,
    unknown: 0,
  };

  // 3. Count jobs in each bucket (do this AFTER filtering)
  filteredJobs.forEach((job) => {
    const range = getSalaryRange(job.salarySim);
    if (salaryBuckets.hasOwnProperty(range)) {
      salaryBuckets[range as keyof typeof salaryBuckets]++;
    } else {
      salaryBuckets["unknown"]++;
    }
  });

  const total = filteredJobs.length || 1;

  // After loading jobs (e.g., after setJobs)
  const skillCounts: Record<string, number> = {};
  jobs.forEach(job => {
    (job.matchedSkills || []).forEach((skill: string) => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  // Get top 5 skills
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  // Add a function to handle saving jobs
  const handleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId)
      } else {
        return [...prev, jobId]
      }
    })
  }

  function parseSemanticFit(semanticFit: string) {
    const sections = semanticFit.split(/\*\*(.*?)\*\*/).filter(Boolean);
    const result: { title: string; bullets: string[] }[] = [];

    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i].trim();
      const content = sections[i + 1] ? sections[i + 1].trim() : "";
      const bullets = content
        .split(/^- |^\* /m) // Split by lines starting with '- ' or '* '
        .map(line => line.trim())
        .filter(line => line !== "");

      result.push({ title, bullets });
    }

    return result;
  }

  return (
    <div className="space-y-8">
      {/* Results Page */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* CV Summary Sidebar */}
        {/* Job Match Statistics Sidebar */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="sticky top-6 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/images/alex-johnson.png" alt="Carla Novares" />
                    <AvatarFallback>
                      {cvData.personalInfo.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{cvData.personalInfo.name}</CardTitle>
                    <CardDescription>Match Statistics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Match Summary */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Match Summary</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/40 rounded-md p-3 text-center">
                      <div className="text-2xl font-bold">{filteredJobs.length}</div>
                      <div className="text-xs text-muted-foreground">Total Matches</div>
                    </div>
                    <div className="bg-muted/40 rounded-md p-3 text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(
                          filteredJobs.reduce((sum, job) => sum + job.weighted_score * 100, 0) / (filteredJobs.length || 1),
                        )}
                        %
                      </div>
                      <div className="text-xs text-muted-foreground">Avg. Match</div>
                    </div>
                  </div>
                </div>

                {/* Match Distribution */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Match Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>90-100%</span>
                      <span className="font-medium">{filteredJobs.filter((job) => job.weighted_score * 100 >= 90).length}</span>
                    </div>
                    <Progress
                      value={
                        (filteredJobs.filter((job) => job.weighted_score * 100 >= 90).length / (filteredJobs.length || 1)) * 100
                      }
                      className="h-2 bg-muted"
                    />

                    <div className="flex justify-between text-xs">
                      <span>75-89%</span>
                      <span className="font-medium">
                        {filteredJobs.filter((job) => job.weighted_score * 100 >= 75 && job.weighted_score * 100 < 90).length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (filteredJobs.filter((job) => job.weighted_score * 100 >= 75 && job.weighted_score * 100 < 90).length /
                          (filteredJobs.length || 1)) *
                        100
                      }
                      className="h-2 bg-muted"
                    />

                    <div className="flex justify-between text-xs">
                      <span>60-74%</span>
                      <span className="font-medium">
                        {filteredJobs.filter((job) => job.weighted_score * 100 >= 60 && job.weighted_score * 100 < 75).length}
                      </span>
                    </div>
                    <Progress
                      value={
                        (filteredJobs.filter((job) => job.weighted_score * 100 >= 60 && job.weighted_score * 100 < 75).length /
                          (filteredJobs.length || 1)) *
                        100
                      }
                      className="h-2 bg-muted"
                    />

                    <div className="flex justify-between text-xs">
                      <span>Below 60%</span>
                      <span className="font-medium">{filteredJobs.filter((job) => job.weighted_score * 100 < 60).length}</span>
                    </div>
                    <Progress
                      value={
                        (filteredJobs.filter((job) => job.weighted_score * 100 < 60).length / (filteredJobs.length || 1)) * 100
                      }
                      className="h-2 bg-muted"
                    />
                  </div>
                </div>

                {/* Top Job Types */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Job Types</h3>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(
                      filteredJobs.reduce((acc, job) => {
                        const type = job.jobType;
                        acc.set(type, (acc.get(type) || 0) + 1);
                        return acc;
                      }, new Map<string, number>())
                    ).map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type} ({count})
                      </Badge>
                    ))}
                    {/* Optionally, show remote count as a separate badge */}
                    <Badge variant="secondary" className="text-xs">
                      Remote ({filteredJobs.filter((job) => job.is_remote).length})
                    </Badge>
                  </div>
                </div>

                {/* Top Skills in Demand */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Top Skills in Demand</h3>
                  <div className="flex flex-wrap gap-1">
                    {topSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary Insights Panel */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Salary Insights</CardTitle>
                <CardDescription>Salary ranges for your matches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Range</span>
                    <span className="font-medium">$110K - $140K</span>
                  </div>

                  <div className="h-32 w-full flex items-center justify-center bg-muted/20 rounded-md">
                    {/* Placeholder for salary distribution chart */}
                    <div className="text-center text-sm text-muted-foreground">
                      <div className="mb-2">Salary Distribution</div>
                      <div className="space-y-2 w-full px-2">
                        <div className="flex justify-between text-xs">
                          <span>$150K+</span>
                          <div className="w-24 bg-muted rounded-sm h-2">
                            <div className="bg-primary h-2 rounded-sm" style={{ width: `${(salaryBuckets["150k+"] / total) * 100}%` }}></div>
                          </div>
                          <span>{salaryBuckets["150k+"]}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>$120-150K</span>
                          <div className="w-24 bg-muted rounded-sm h-2">
                            <div className="bg-primary h-2 rounded-sm" style={{ width: `${(salaryBuckets["120-150k"] / total) * 100}%` }}></div>
                          </div>
                          <span>{salaryBuckets["120-150k"]}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>$90-120K</span>
                          <div className="w-24 bg-muted rounded-sm h-2">
                            <div className="bg-primary h-2 rounded-sm" style={{ width: `${(salaryBuckets["90-120k"] / total) * 100}%` }}></div>
                          </div>
                          <span>{salaryBuckets["90-120k"]}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Below $90K</span>
                          <div className="w-24 bg-muted rounded-sm h-2">
                            <div className="bg-primary h-2 rounded-sm" style={{ width: `${(salaryBuckets["below90k"] / total) * 100}%` }}></div>
                          </div>
                          <span>{salaryBuckets["below90k"]}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Unknown</span>
                          <div className="w-24 bg-muted rounded-sm h-2">
                            <div className="bg-primary h-2 rounded-sm" style={{ width: `${(salaryBuckets["unknown"] / total) * 100}%` }}></div>
                          </div>
                          <span>{salaryBuckets["unknown"]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Filters & Sorting */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Job Matches</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs or companies"
                  className="pl-9"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>

              <Select onValueChange={handleSortChange} defaultValue="match">
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                    <span>Sort By</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Highest Match</SelectItem>
                  <SelectItem value="recent">Recently Posted</SelectItem>
                  <SelectItem value="salary-high">Salary (High to Low)</SelectItem>
                  <SelectItem value="salary-low">Salary (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">Showing {filteredJobs.length} matches based on your CV</div>
          </div>

          {/* Job Match Results */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card
                className={`overflow-hidden transition-all ${activeJobId === job.id ? "ring-2 ring-primary" : ""}`}
                key={job.job_url}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{job.title_en}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {job.company}
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                        {job.is_remote && (
                          <Badge variant="outline" className="ml-2">
                            Remote
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-center">
                        <div
                          className={`font-bold text-2xl px-4 py-2 rounded-full ${getMatchScoreColor(job.weighted_score * 100)}`}
                        >
                          {Math.round(job.weighted_score * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Match Score</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{job.jobType}</Badge>
                    <Badge variant="secondary">{job.jobLevel}</Badge>
                    <Badge variant="outline">{job.salarySim}</Badge>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="match-breakdown">
                      <AccordionTrigger>
                        <span className="text-sm font-medium">Match Breakdown</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div>
                            <div className="text-sm font-medium mb-2 flex items-center">
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Matched Skills
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(job.matchedSkills || []).map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2 flex items-center">
                              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" /> Missing Keywords
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(job.missingSkills || []).map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-2 flex items-center">
                              <Brain className="mr-2 h-4 w-4 text-blue-600" /> Semantic Fit
                            </div>
                            {job.semanticFit && parseSemanticFit(job.semanticFit).map((section, index) => (
                              <div key={index} style={{ marginBottom: 12 }}>
                                {section.title && <div className="font-semibold mb-1">{section.title}</div>}
                                {section.bullets.length > 0 && (
                                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                    {section.bullets.map((bullet, idx) => (
                                      <li key={idx}>{bullet}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    Posted {job.postedDate}
                  </div>

                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={savedJobs.includes(job.job_url) ? "default" : "outline"}
                            size="icon"
                            className={savedJobs.includes(job.job_url) ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveJob(job.job_url)
                            }}
                          >
                            <BookmarkPlus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{savedJobs.includes(job.job_url) ? "Saved" : "Save Job"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button asChild>
                      <a
                        href={job.job_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Job <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}

            {/* Premium Job Teaser Card - Blurred with Subscription CTA */}
            <Card className="overflow-hidden relative mt-8 mb-10 shadow-md">
              {/* Blurred content */}
              <div className="filter blur-[3px] pointer-events-none">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{premiumJobTeaser.title_en}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building className="h-4 w-4 mr-1" />
                        {premiumJobTeaser.company}
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        {premiumJobTeaser.location}
                        {premiumJobTeaser.is_remote && (
                          <Badge variant="outline" className="ml-2">
                            Remote
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-center">
                        <div
                          className={`font-bold text-2xl px-4 py-2 rounded-full ${getMatchScoreColor(premiumJobTeaser.score_model1 * 100)}`}
                        >
                          {Math.round(premiumJobTeaser.score_model1 * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Match Score</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{premiumJobTeaser.jobType}</Badge>
                    <Badge variant="secondary">{premiumJobTeaser.jobLevel}</Badge>
                    <Badge variant="outline">{premiumJobTeaser.salarySim}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{premiumJobTeaser.description_en}</p>
                  {/* Add extra space at the bottom to make the card taller */}
                  <div className="h-20"></div>
                </CardContent>
              </div>

              {/* Overlay with subscription CTA */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                  <Crown className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Unlock Premium Job Matches</h3>
                <p className="text-muted-foreground mb-5 max-w-md">
                  Subscribe to SmartMatch Pro to access unlimited job opportunities that match your profile.
                </p>
                <Button size="lg" className="px-6 h-12">
                  <Lock className="mr-2 h-4 w-4" /> Upgrade to SmartMatch Pro
                </Button>
              </div>
            </Card>
          </div>

          {/* User Actions Panel */}
          <div className="fixed bottom-0 right-0 p-4 md:p-6 z-10 lg:hidden">
            <div className="bg-background border rounded-full shadow-lg p-2 flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                      <Mail className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Email Me Similar Jobs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                      <Download className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download Match Report</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
