"use client";
import { UPDATE_SECTION_VISIBILITY_MUTATIONS } from "@/app/graph/mutations";
import { SECTION_VISIBILITY_QUERY } from "@/app/graph/queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useState, useEffect, useCallback } from "react";
import Loading from "../loading";
import { useToast } from "@/components/ui/use-toast";

interface SectionVisibility {
  section: string;
  visibility_status: boolean;
}

const SectionVisibilityPage = () => {
  const { toast } = useToast();
  const [updateSectionVisibility] = useMutation(
    UPDATE_SECTION_VISIBILITY_MUTATIONS,
  );
  const { data, loading, error, refetch } = useQuery(SECTION_VISIBILITY_QUERY);

  // Local state to handle checkboxes
  const [localVisibility, setLocalVisibility] = useState<
    Record<string, boolean>
  >({});
  const [updatingSection, setUpdatingSection] = useState<string | null>(null);

  // Update localVisibility once data is available
  useEffect(() => {
    if (data?.getAllSectionVisibility) {
      const initialVisibility = data.getAllSectionVisibility.reduce(
        (acc: Record<string, boolean>, item: SectionVisibility) => {
          acc[item.section] = item.visibility_status;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setLocalVisibility(initialVisibility);
    }
  }, [data]);

  const handleToggle = useCallback(async (section: string) => {
    const newVisibilityStatus = !localVisibility[section];
    setUpdatingSection(section);
    
    // Optimistically update UI
    setLocalVisibility((prev) => ({
      ...prev,
      [section]: newVisibilityStatus,
    }));

    try {
      await updateSectionVisibility({
        variables: { section, visibilityStatus: newVisibilityStatus },
      });
      
      // Show success toast
      toast({
        title: "Section updated",
        description: `${section} is now ${newVisibilityStatus ? 'visible' : 'hidden'}`,
        className: newVisibilityStatus ? "bg-green-600 text-white" : "bg-gray-700 text-white",
      });
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error("Failed to update visibility", error);
      
      // Show error toast
      toast({
        title: "Update failed",
        description: "Failed to update section visibility. Please try again.",
        variant: "destructive",
      });
      
      // Revert the local state if there's an error
      setLocalVisibility((prev) => ({
        ...prev,
        [section]: !newVisibilityStatus,
      }));
    } finally {
      setUpdatingSection(null);
    }
  }, [localVisibility, updateSectionVisibility, refetch, toast]);

  if (loading) return <Loading />;
  if (error) return (
    <div className="min-h-screen bg-[#202939] p-8 text-white">
      <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-8">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
        <p>{error.message}</p>
      </div>
      <button 
        onClick={() => refetch()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // Group sections by category
  const groupedSections: Record<string, SectionVisibility[]> = {};
  data?.getAllSectionVisibility.forEach((item: SectionVisibility) => {
    const category = item.section.includes("_") 
      ? item.section.split("_")[0] 
      : "General";
    
    if (!groupedSections[category]) {
      groupedSections[category] = [];
    }
    groupedSections[category].push(item);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2234] to-[#202939] p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 bg-white bg-opacity-5 p-6 rounded-xl shadow-lg border border-white border-opacity-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Section Visibility
          </h1>
          <p className="text-gray-300 mt-2 max-w-2xl">
            Control which sections are visible on your website. Toggle sections on or off to customize your site's appearance.
          </p>
        </header>
        
        {Object.entries(groupedSections).map(([category, sections]) => (
          <div key={category} className="mb-12 bg-white bg-opacity-5 p-6 rounded-xl shadow-lg border border-white border-opacity-10">
            <h2 className="text-xl font-semibold mb-6 text-blue-300 border-b border-blue-300 border-opacity-30 pb-3 flex items-center">
              <span className="bg-blue-500 bg-opacity-20 p-2 rounded-lg mr-3">
                {category === "Home" ? "🏠" : 
                 category === "Product" ? "🛍️" : 
                 category === "About" ? "ℹ️" : 
                 category === "Contact" ? "📞" : "📄"}
              </span>
              {category} Sections
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((item) => (
                <div
                  key={item.section}
                  className={`bg-white bg-opacity-10 p-6 rounded-xl flex justify-between items-center shadow-lg transition-all duration-300 
                    ${localVisibility[item.section] ? 'border-l-4 border-green-400' : 'border-l-4 border-gray-600'} 
                    hover:transform hover:translate-y-[-2px] hover:shadow-xl`}
                >
                  <div className="flex-1">
                    <span className="text-xl font-medium">
                      {item.section.replace(`${category}_`, "").replace(/_/g, " ")}
                    </span>
                    <p className={`text-sm mt-1 flex items-center ${localVisibility[item.section] ? 'text-green-400' : 'text-gray-400'}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${localVisibility[item.section] ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                      {localVisibility[item.section] ? "Visible to users" : "Hidden from users"}
                    </p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer ml-4">
                    {updatingSection === item.section ? (
                      <div className="w-14 h-7 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-400"></div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={localVisibility[item.section]}
                          onChange={() => handleToggle(item.section)}
                        />
                        <div className="relative w-14 h-7 bg-gray-700 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600"></div>
                      </>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionVisibilityPage;
