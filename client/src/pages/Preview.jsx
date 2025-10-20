import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ResumePreview from "../components/ResumePreview";
import Loader from "../components/Loader";
import { ArrowLeftIcon } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;


const Preview = () => {
  const { resumeId } = useParams();
  const { getToken } = useAuth();
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadResume = async () => {
   if (!resumeId) return;
   try {
     setIsLoading(true);
     const { data } = await axios.get(`/api/resume/get-public-resume/${resumeId}`, {
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

  useEffect(() => {
    loadResume();
  }, []);

  return resumeData ? (
    <div className="bg-slate-100">
      <div className="max-w-3xl mx-auto py-10">
        <ResumePreview
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          className="py-4 bg-white"
        />
      </div>
    </div>
  ) : (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-center text-6xl text-slate-400 font-medium">
            Resume not found
          </p>
          <a
            href="/"
            className="mt-6 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring-1 ring-green-400 flex items-center transition-colors"
          >
            <ArrowLeftIcon className="mr-2 size-4" /> go to home page
          </a>
        </div>
      )}
    </div>
  );
};

export default Preview;
