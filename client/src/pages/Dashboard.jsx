import { Protect, useAuth } from "@clerk/clerk-react";
import {
  FilePenLineIcon,
  Gem,
  PencilIcon,
  Sparkles,
  TrashIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import CreationItem from "../components/CreationItem";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];
  const [creations, setCreations] = useState([]);
  const [allResumes, setAllResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { getToken } = useAuth();

  const getAllCreations = async () => {
    try {
      const { data } = await axios.get("/api/user/get-user-creations", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getAllResumesData = async () => {
    try {
      const { data } = await axios.get("/api/resume/get-all-resumes", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setAllResumes(data.resumes);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashboardData = async () => {
    try {
      await Promise.all([getAllCreations(), getAllResumesData()]);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (resumeId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this resume?"
      );
      if (confirm) {
        const { data } = await axios.delete(`/api/resume/delete-resume/${resumeId}`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        });
        if (data.success) {
           setAllResumes((prevResumes) =>
             prevResumes.filter((resume) => resume.id !== resumeId)
           );
          toast.success(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Total Creations</p>
            <h2 className="text-xl font-semibold">{creations.length + allResumes.length}</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Active Plan</p>
            <h2 className="text-xl font-semibold">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-3/4">
          <div className="animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent "></div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <p className="mt-6 mb-4">Recent Resume Creations : </p>
            <div className="grid grid-cols-2 sm:flex flex-wrap gap-4">
              {allResumes.map((resume, index) => {
                const baseColor = colors[index % colors.length];
                return (
                  <button
                    key={resume.id}
                    onClick={() => navigate(`/ai/build-resume/${resume.id}`)}
                    className="relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                      borderColor: `${baseColor}40`,
                    }}
                  >
                    <FilePenLineIcon
                      className="size-7 group-hover:scale-105 transition-all"
                      style={{ color: baseColor }}
                    />
                    <p
                      className="text-sm group-hover:scale-105 transition-all px-2 text-center"
                      style={{ color: baseColor }}
                    >
                      {resume.title}
                    </p>

                    <p
                      className="absolute bottom-1 text-[11px] text-slate-400 group-hover:text-slate-500 transition-all duration-300 px-2 text-center"
                      style={{ color: baseColor + "90" }}
                    >
                      Updated on{" "}
                      {new Date(resume.updated_at).toLocaleDateString()}
                    </p>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-1 right-1 hidden group-hover:flex items-center"
                    >
                      <TrashIcon
                        onClick={() => deleteResume(resume.id)}
                        className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <p className="mt-6 mb-4">Recent Other Creations : </p>
            {creations.map((item) => (
              <CreationItem key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
