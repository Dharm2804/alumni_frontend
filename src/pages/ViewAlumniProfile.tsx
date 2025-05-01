"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaGraduationCap, FaBriefcase, FaEnvelope, FaLinkedin, FaChevronDown, FaChevronUp, FaShareAlt } from "react-icons/fa";
import { motion } from "framer-motion";

interface EmploymentHistory {
  companyName: string;
  role: string;
  companyLocation: string;
  durationFrom: string;
  durationTo: string | null;
  description?: string;
}

interface AlumniProfile {
  _id: string;
  name: string;
  profileImage: string;
  engineeringType: string;
  passoutYear: string;
  email: string;
  linkedin: string;
  employmentHistory: EmploymentHistory[];
}

export default function ViewAlumniProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEducationOpen, setIsEducationOpen] = useState(true);
  const [expandedJobIndex, setExpandedJobIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/view_alumni_profile/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError("Failed to load profile");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const toggleEducation = () => {
    setIsEducationOpen((prev) => !prev);
  };

  const toggleJobExpansion = (index: number) => {
    setExpandedJobIndex((prev) => (prev === index ? null : index));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${profile?.name}'s Alumni Profile`,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      alert("Share functionality is not supported in this browser.");
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <motion.button
            onClick={handleBack}
            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </motion.button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">
            The alumni profile you're looking for doesn't exist or has been removed.
          </p>
          <motion.button
            onClick={handleBack}
            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Return to Directory
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <motion.button
            onClick={handleBack}
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 px-3 py-2 rounded-lg transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </motion.button>
          <motion.button
            onClick={handleShare}
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 px-3 py-2 rounded-lg transition"
            whileHover={{ scale: 1.05 }}
          >
            <FaShareAlt className="mr-2 h-4 w-4" />
            Share Profile
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 md:py-10 max-w-4xl px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-700 dark:to-blue-600" />
            <div className="relative px-6">
              <div className="absolute -top-16 h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-300 text-2xl font-semibold">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                )}
              </div>
            </div>
            <div className="pt-20 pb-6 px-6">
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{profile.name}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
                      {profile.engineeringType}
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                      Class of {profile.passoutYear}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <motion.a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaEnvelope className="mr-2 h-4 w-4" />
                    Contact via Email
                  </motion.a>
                  {profile.linkedin && (
                    <motion.a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 border border-indigo-600 dark:border-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FaLinkedin className="mr-2 h-4 w-4" />
                      LinkedIn Profile
                    </motion.a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <button
                onClick={toggleEducation}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <FaGraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Education</h2>
                </div>
                {isEducationOpen ? (
                  <FaChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <FaChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              {isEducationOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4 overflow-hidden"
                >
                  <div className="pl-12">
                    <h3 className="font-medium text-gray-900 dark:text-gray-200">{profile.engineeringType}</h3>
                    <p className="text-gray-600 dark:text-gray-400">Graduated in {profile.passoutYear}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Employment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <FaBriefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Professional Experience</h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {profile.employmentHistory.length === 0 ? (
                  <p className="text-center text-gray-600 dark:text-gray-400 py-4">No employment history available</p>
                ) : (
                  profile.employmentHistory.map((job, index) => (
                    <motion.div
                      key={index}
                      className="rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => toggleJobExpansion(index)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">{job.role}</h3>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{job.companyName}</p>
                            <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 gap-x-2">
                              <span>{job.companyLocation}</span>
                              <span className="hidden sm:inline">•</span>
                              <span>
                                {formatDate(job.durationFrom)} -{" "}
                                {job.durationTo ? formatDate(job.durationTo) : "Present"}
                              </span>
                            </div>
                          </div>
                          {expandedJobIndex === index ? (
                            <FaChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2" />
                          ) : (
                            <FaChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </button>
                      {expandedJobIndex === index && job.description && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          <p className="text-sm text-gray-600 dark:text-gray-400">{job.description}</p>
                          <motion.a
                            href={`mailto:${profile.email}?subject=Regarding your position at ${job.companyName}`}
                            className="inline-flex items-center bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                            whileHover={{ scale: 1.05 }}
                          >
                            Contact about this role
                          </motion.a>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    </div>
  );
}