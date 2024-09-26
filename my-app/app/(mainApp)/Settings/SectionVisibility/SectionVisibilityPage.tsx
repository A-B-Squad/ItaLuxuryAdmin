"use client";
import { UPDATE_SECTION_VISIBILITY_MUTATIONS } from "@/app/graph/mutations";
import { SECTION_VISIBILITY_QUERY } from "@/app/graph/queries";
import { useMutation, useQuery } from "@apollo/client";
import React, { useState, useEffect } from "react";
import Loading from "../loading";

const SectionVisibilityPage = () => {
  const [updateSectionVisibility] = useMutation(
    UPDATE_SECTION_VISIBILITY_MUTATIONS,
  );
  const { data, loading, error, refetch } = useQuery(SECTION_VISIBILITY_QUERY);

  // Local state to handle checkboxes
  const [localVisibility, setLocalVisibility] = useState<
    Record<string, boolean>
  >({});

  // Update localVisibility once data is available
  useEffect(() => {
    if (data?.getAllSectionVisibility) {
      const initialVisibility = data.getAllSectionVisibility.reduce(
        (
          acc: { [x: string]: any },
          item: { section: string | number; visibility_status: any },
        ) => {
          acc[item.section] = item.visibility_status;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setLocalVisibility(initialVisibility);
    }
  }, [data]);

  const handleToggle = async (section: string) => {
    const newVisibilityStatus = !localVisibility[section];
    setLocalVisibility((prev: any) => ({
      ...prev,
      [section]: newVisibilityStatus,
    }));

    try {
      await updateSectionVisibility({
        variables: { section, visibilityStatus: newVisibilityStatus },
      });
      refetch();
    } catch (error) {
      console.error("Failed to update visibility", error);
      // Optionally, revert the local state if there's an error
      setLocalVisibility((prev: any) => ({
        ...prev,
        [section]: !newVisibilityStatus,
      }));
    }
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-white">Error: {error.message}</p>;

  return (
    <div className="min-h-screen bg-[#202939] p-8 text-white">
      <h1 className="text-3xl font-bold mb-8">Section Visibility</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.getAllSectionVisibility.map(
          (item: { section: string; visibility_status: boolean }) => (
            <div
              key={item.section}
              className="bg-white bg-opacity-10 p-6 rounded-lg flex justify-between items-center shadow-lg transition-transform transform hover:scale-105"
            >
              <span className="text-xl font-medium">{item.section}</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localVisibility[item.section]}
                  onChange={() => handleToggle(item.section)}
                />
                <div className="relative w-14 h-7 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600"></div>
              </label>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default SectionVisibilityPage;
