"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoChevronDown, IoSearch, IoCheckmark } from "react-icons/io5";

const ProjectSwitcher = ({ 
  show, 
  onClose, 
  projects = [], 
  currentProject, 
  onProjectChange,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const modalRef = useRef(null);

  useEffect(() => {
    setFilteredProjects(
      projects.filter(project =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, projects]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  const handleProjectSelect = (project) => {
    onProjectChange(project);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Switch Project
          </h2>
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? `No projects found for "${searchTerm}"` : "No projects available"}
            </div>
          ) : (
            <div className="p-2">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                    currentProject?.id === project.id ? "bg-blue-50 border border-blue-200" : ""
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {project.description}
                      </p>
                    )}
                    {project.team && (
                      <p className="text-xs text-gray-400 mt-1">
                        Team: {project.team}
                      </p>
                    )}
                  </div>
                  {currentProject?.id === project.id && (
                    <IoCheckmark className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectSwitcher;
