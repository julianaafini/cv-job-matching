"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Clock, MapPin, Building, ArrowRight, FileText, Sparkles, X } from "lucide-react"

// Mock CV data to use when a file is uploaded
const mockCvData = {
  personalInfo: {
    name: "Carla Novares",
    email: "carla@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "https://carlanovares.dev",
  },
  experiences: [
    {
      title: "Frontend Developer",
      company: "TechCorp Inc.",
      startDate: "2020-01-01",
      endDate: "2023-01-01",
      description: "Developed responsive web applications using React and TypeScript.",
    },
    {
      title: "Junior Developer",
      company: "WebSolutions",
      startDate: "2018-01-01",
      endDate: "2020-01-01",
      description: "Built and maintained client websites using HTML, CSS, and JavaScript.",
    },
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      school: "University of Technology",
      startDate: "2014-01-01",
      endDate: "2018-01-01",
    },
  ],
  skills: ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Git", "Responsive Design"],
}

// Import the results page component directly
import ResultsPage from "./results-page"

export default function SmartMatch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const showResults = searchParams.get("showResults") === "true"

  const [cvFile, setCvFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [matchScore, setMatchScore] = useState([0, 100])
  const [jobType, setJobType] = useState<string>("all")
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false)
  const [experienceLevel, setExperienceLevel] = useState<string>("all")
  const [salary, setSalary] = useState<[number, number]>([0, 300000])
  const [locations, setLocations] = useState<string[]>([])
  const [newLocation, setNewLocation] = useState<string>("")
  const [industries, setIndustries] = useState<string[]>([])
  const allIndustries = ["Technology", "Finance", "Healthcare", "Education", "Retail", "Manufacturing", "Marketing"]
  const [uploading, setUploading] = useState(false) // State to track upload status
  const [hasMounted, setHasMounted] = useState(false);
  const [companySize, setCompanySize] = useState<string>("all");
  const [countryError, setCountryError] = useState<string | null>(null);
  const [industryError, setIndustryError] = useState<string | null>(null);
  const [isModelRunning, setIsModelRunning] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  // Define the Job interface
  interface Job {
    title: string;
    company: string;
    location: string;
    salary: string;
    description: string;
  }
  
    const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const jobsStr = localStorage.getItem("smartmatch_jobs");
    if (jobsStr) {
      try {
        const jobsArr = JSON.parse(jobsStr);
        setJobs(jobsArr);
      } catch (e) {
        console.error("Failed to parse jobs from localStorage", e);
      }
    }
  }, []);

  const handleCVFileSelect = async (selectedFile: File) => {
    setCvFile(selectedFile);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded successfully:", data.pdf_path);

        // Save the uploaded file path to localStorage
        localStorage.setItem("uploadedCVPath", data.pdf_path);

        alert("File uploaded successfully!");
      } else {
        const errorText = await response.text();
        console.error("Failed to upload file:", errorText);
        alert(`Failed to upload file. Server responded with: ${errorText}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      if (error instanceof Error) {
        alert(`An error occurred while uploading the file: ${error.message}`);
      } else {
        alert("An unknown error occurred while uploading the file.");
      }
    } finally {
      setUploading(false);
    }
  }

  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation])
      setNewLocation("")
    }
  }

  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter((loc) => loc !== location))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one country is selected
    if (locations.length === 0) {
      setCountryError("Please select at least one country.");
      return;
    } else {
      setCountryError(null);
    }

    // Validate at least one industry is selected
    if (industries.length === 0) {
      setIndustryError("Please select at least one industry.");
      return;
    } else {
      setIndustryError(null);
    }

    // Collect all filter values
    const filterState = {
      matchScoreFilter: matchScore,
      jobType,
      remoteOnly,
      experienceLevel,
      salary,
      locations,
      industries,
      companySize, // <-- add this line
    };

    // Save to localStorage if you want
    localStorage.setItem("careerAI_filterState", JSON.stringify(filterState));

    setIsModelRunning(true); // Show the "model is running" message

    try {
      const response = await fetch("http://127.0.0.1:5000/run-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters: filterState }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("smartmatch_jobs", JSON.stringify(data.jobs));
        setIsModelRunning(false); // Hide the message
        router.push("/dashboard/smartmatch?showResults=true");
      } else {
        setIsModelRunning(false);
        const errorText = await response.text();
        alert(`Failed to run model. Server responded with: ${errorText}`);
      }
    } catch (error) {
      setIsModelRunning(false);
      alert("An error occurred while running the model.");
    }
  }

  if (!hasMounted) {
    return null; // or <div>Loading...</div>
  }

  // If showResults is true, render the results page
  if (showResults) {
    return <ResultsPage />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SmartMatch</h1>
        <p className="text-muted-foreground mt-2">Find the perfect job matches based on your CV and preferences.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" disabled={activeTab === "preferences" && !cvFile}>
            Upload CV
          </TabsTrigger>
          <TabsTrigger value="preferences" disabled={!cvFile}>
            Set Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your CV</CardTitle>
              <CardDescription>Upload your CV to find jobs that match your skills and experience.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                label="Upload your CV"
                description="PDF or DOCX format (Max 5MB)"
                onFileSelect={handleCVFileSelect}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div></div>
              <Button onClick={() => setActiveTab("preferences")} disabled={!cvFile || uploading}>
                {uploading ? "Uploading..." : "Next: Set Preferences"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How SmartMatch Works</CardTitle>
              <CardDescription>
                Our AI analyzes your CV to find the best job matches for your skills and experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">CV Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI extracts your skills, experience, and qualifications from your CV.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Job Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    We match your profile with thousands of job listings to find the best fits.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium">Personalized Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized job recommendations with match scores and insights.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                  <CardDescription>Set your job preferences to refine your matches.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Match Score</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-48">
                        <Slider
                          defaultValue={matchScore}
                          max={100}
                          min={0}
                          step={5}
                          value={matchScore}
                          onValueChange={(value) => setMatchScore(value as [number, number])}
                          className="py-4"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {matchScore[0]}% - {matchScore[1]}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Only show jobs with a match score in this range.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <RadioGroup
                      defaultValue="all"
                      value={jobType}
                      onValueChange={setJobType}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fulltime" id="fulltime" />
                        <Label htmlFor="fulltime" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" /> Full-time
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="parttime" id="parttime" />
                        <Label htmlFor="parttime" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" /> Part-time
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="internship" id="internship" />
                        <Label htmlFor="internship" className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" /> Internship
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All job types</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="remote-only" checked={remoteOnly} onCheckedChange={setRemoteOnly} />
                    <Label htmlFor="remote-only" className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" /> Remote only
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <div className="w-64">
                      <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="mid">Mid-Senior Level</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="all">All Levels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Salary Range</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-48">
                        <Slider
                          defaultValue={salary}
                          max={300000}
                          min={0}
                          step={5000}
                          value={salary}
                          onValueChange={(value) => setSalary(value as [number, number])}
                          className="py-4"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        ${salary[0].toLocaleString()} - ${salary[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Filters</CardTitle>
                  <CardDescription>Further refine your job search with these filters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                  <Label>Countries</Label>
                  <div className="flex gap-4">
                    {["Portugal", "Germany", "Italy"].map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                      id={country}
                      checked={locations.includes(country)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                        setLocations([...locations, country]);
                        } else {
                        setLocations(locations.filter((c) => c !== country));
                        }
                      }}
                      />
                      <Label htmlFor={country}>{country}</Label>
                    </div>
                    ))}
                  </div>
                  {countryError && (
                    <p className="text-xs text-red-500">{countryError}</p>
                  )}
                  </div>

                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mb-1 px-2 py-1 text-xs h-7"
                      onClick={() => setIndustries(allIndustries)}
                    >
                      Select All
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      {allIndustries.map((industry) => (
                        <div key={industry} className="flex items-center space-x-2">
                          <Checkbox
                            id={industry.toLowerCase()}
                            checked={industries.includes(industry)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setIndustries([...industries, industry]);
                              } else {
                                setIndustries(industries.filter((i) => i !== industry));
                              }
                            }}
                          />
                          <Label htmlFor={industry.toLowerCase()}>{industry}</Label>
                        </div>
                      ))}
                    </div>
                    {industryError && (
                      <p className="text-xs text-red-500">{industryError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <RadioGroup
                      defaultValue="all"
                      value={companySize}
                      onValueChange={setCompanySize}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="startup" id="startup" />
                        <Label htmlFor="startup" className="flex items-center">
                          <Building className="mr-2 h-4 w-4" /> Startup (1-50)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="midsize" id="midsize" />
                        <Label htmlFor="midsize" className="flex items-center">
                          <Building className="mr-2 h-4 w-4" /> Mid-size (51-500)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="large" />
                        <Label htmlFor="large" className="flex items-center">
                          <Building className="mr-2 h-4 w-4" /> Large (500+)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all-sizes" />
                        <Label htmlFor="all-sizes">All company sizes</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit">Find Matching Jobs</Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </TabsContent>
      </Tabs>
      {isModelRunning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <span className="text-lg font-semibold mb-2">The model is running...</span>
            <span className="text-muted-foreground">Please wait while we process your preferences.</span>
            <div className="mt-4 animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )}
    </div>
  )
}
