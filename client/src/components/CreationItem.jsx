import { ArrowDownToLine } from "lucide-react";
import React, { useState } from "react";
import Markdown from "react-markdown";

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  const handleDownload = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `quick.ai-${Date.now()}.png`;
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  };
  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer"
    >
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2>{item.prompt}</h2>
          <p className="text-gray-500">
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full">
          {item.type}
        </button>
      </div>
      {expanded && (
        <div>
          {item.type === "image" ? (
            <div className="mt-3 w-full max-w-md relative group rounded-lg overflow-hidden">
              <img
                src={item.content}
                alt="image"
              />
              <div className="absolute inset-0 group-hover:bg-gradient-to-b from-transparent to-black/80">
                <ArrowDownToLine
                  onClick={() => handleDownload(item.content)}
                  className="absolute size-5 md:size-6 right-4 bottom-4 text-white cursor-pointer hidden group-hover:block"
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-700">
              <div className="reset-tw">
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CreationItem;
