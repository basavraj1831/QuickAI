import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FilePen,
  FileText,
  FolderIcon,
  GraduationCap,
  PlusIcon,
  Share2Icon,
  Sparkles,
  User,
  XIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import PersonalInfoForm from "../components/PersonalInfoForm";
import ProfessionalSummaryForm from "../components/ProfessionalSummaryForm";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";
import ResumePreview from "../components/ResumePreview";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const BuildResume = () => {
  const navigate = useNavigate();
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [title, setTitle] = useState("");
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resumeId } = useParams();

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false,
  });

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];
  const activeSection = sections[activeSectionIndex];

  const createResume = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/resume/create-resume",
        { title: title },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        setShowCreateResume(false);
        setTitle("");
        navigate(`/ai/build-resume/${data.resume[0].id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingResume = async () => {
    if(!resumeId) return;
    try {
      setIsLoading(true);
      const { data } = await axios.get(`/api/resume/get-resume/${resumeId}`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setResumeData(data.resume);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const changeResumeVisibility = async () => {
    try {
      let visible = !resumeData.public;
      const { data } = await axios.put(
        `/api/resume/update-resume-visible`,
        {visible, resumeId},
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );
      if (data.success) {
        setResumeData({ ...resumeData, public: !resumeData.public });
        if(resumeData.public) {
          toast.success("Resume is now private");
        } else {
          toast.success("Resume is now public");
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateResume = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const updatedResumeData = structuredClone(resumeData);
      if (typeof resumeData.personal_info.image === "object") {
        delete updatedResumeData.personal_info.image;
      }
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(updatedResumeData));
      removeBackground && formData.append("removeBackground", "yes");
      typeof resumeData.personal_info.image === "object" &&
        formData.append("image", resumeData.personal_info.image);

      const { data } = await axios.put(`/api/resume/update-resume`, formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        toast.success(data.message);
        setResumeData(data.resume);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const frontendUrl = window.location.href.split("/ai/build-resume/")[0];
    const resumeUrl = frontendUrl + "/view/" + resumeId;
    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume" });
    } else {
      alert("Share not supported on this browser.");
    }
  };

  const downloadResume = () => {
    window.print();
  };

  useEffect(() => {
    loadExistingResume();
  }, []);

  return (
    <div className="h-full overflow-y-scroll">
      <div className="max-w-7xl mx-auto p-6">
        {resumeId ? (
          isLoading ? (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent "></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="relative lg:col-span-5 rounded-lg overflow-hidden">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1">
                  <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />
                  <hr
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000"
                    style={{
                      width: `${
                        (activeSectionIndex * 100) / (sections.length - 1)
                      }%`,
                    }}
                  />

                  <div className="flex justify-between items-center mb-6 border-b border-gray-300 py-1">
                    <div className="flex items-center gap-2">
                      <TemplateSelector
                        selectedTemplate={resumeData.template}
                        onChange={(template) =>
                          setResumeData((prev) => ({ ...prev, template }))
                        }
                      />
                      <ColorPicker
                        selectedColor={resumeData.accent_color}
                        onChange={(color) =>
                          setResumeData((prev) => ({
                            ...prev,
                            accent_color: color,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {activeSectionIndex !== 0 && (
                        <button
                          onClick={() =>
                            setActiveSectionIndex((prevIndex) =>
                              Math.max(prevIndex - 1, 0)
                            )
                          }
                          className="flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                          disabled={activeSectionIndex === 0}
                        >
                          <ChevronLeft className="size-4" /> Previous
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setActiveSectionIndex((prevIndex) =>
                            Math.min(prevIndex + 1, sections.length - 1)
                          )
                        }
                        className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all cursor-pointer ${
                          activeSectionIndex === sections.length - 1 &&
                          "opacity-50"
                        }`}
                        disabled={activeSectionIndex === sections.length - 1}
                      >
                        Next <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {activeSection.id === "personal" && (
                      <PersonalInfoForm
                        data={resumeData.personal_info}
                        onChange={(data) =>
                          setResumeData((prev) => ({
                            ...prev,
                            personal_info: data,
                          }))
                        }
                        removeBackground={removeBackground}
                        setRemoveBackground={setRemoveBackground}
                      />
                    )}
                    {activeSection.id === "summary" && (
                      <ProfessionalSummaryForm
                        data={resumeData.professional_summary}
                        onChange={(data) =>
                          setResumeData((prev) => ({
                            ...prev,
                            professional_summary: data,
                          }))
                        }
                        setResumeData={setResumeData}
                      />
                    )}
                    {activeSection.id === "experience" && (
                      <ExperienceForm
                        data={resumeData.experience}
                        onChange={(data) =>
                          setResumeData((prev) => ({
                            ...prev,
                            experience: data,
                          }))
                        }
                      />
                    )}
                    {activeSection.id === "education" && (
                      <EducationForm
                        data={resumeData.education}
                        onChange={(data) =>
                          setResumeData((prev) => ({
                            ...prev,
                            education: data,
                          }))
                        }
                      />
                    )}
                    {activeSection.id === "projects" && (
                      <ProjectForm
                        data={resumeData.project}
                        onChange={(data) =>
                          setResumeData((prev) => ({ ...prev, project: data }))
                        }
                      />
                    )}
                    {activeSection.id === "skills" && (
                      <SkillsForm
                        data={resumeData.skills}
                        onChange={(data) =>
                          setResumeData((prev) => ({ ...prev, skills: data }))
                        }
                      />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                     toast.promise(updateResume(e), { 
                      loading: "Saving...",
                     }) 
                    }
                    }
                    className="bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 mt-8">
                <div className="relative w-full">
                  <div className="absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2">
                    {resumeData.public && (
                      <button
                        onClick={handleShare}
                        className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors cursor-pointer"
                      >
                        <Share2Icon className="size-4" /> Share
                      </button>
                    )}
                    <button
                      onClick={changeResumeVisibility}
                      className="flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors cursor-pointer"
                    >
                      {resumeData.public ? (
                        <EyeIcon className="size-4" />
                      ) : (
                        <EyeOffIcon className="size-4" />
                      )}
                      {resumeData.public ? "Public" : "Private"}
                    </button>
                    <button
                      onClick={downloadResume}
                      className="flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors cursor-pointer"
                    >
                      <DownloadIcon className="size-4" /> Download
                    </button>
                  </div>
                </div>
                <ResumePreview
                  data={resumeData}
                  template={resumeData.template}
                  accentColor={resumeData.accent_color}
                />
              </div>
            </div>
          )
        ) : showCreateResume ? (
          <form
            onSubmit={createResume}
            onClick={() => setShowCreateResume(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-10 flex items-center justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6"
            >
              <h2 className="text-xl font-bold mb-4">Create a Resume</h2>
              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder="Enter resume title"
                className="w-full px-4 py-2 mb-4 outline-none border border-gray-300"
                required
              />
              <button
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-[#615fff] to-[#432dd7] text-white rounded transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
                ) : (
                  <FilePen className="w-5" />
                )}
                Create Resume
              </button>
              <XIcon
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                onClick={() => {
                  setShowCreateResume(false);
                  setTitle("");
                }}
              />
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreateResume(true)}
            className="w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover: shadow-lg transition-all duration-300 cursor-pointer"
          >
            <PlusIcon className="size-11 transition-all duration-300 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full" />
            <p className="text-sm group-hover: text-indigo-600 transition-all duration-300">
              Create Resume
            </p>
          </button>
        )}
      </div>
    </div>
  );
};

export default BuildResume;
