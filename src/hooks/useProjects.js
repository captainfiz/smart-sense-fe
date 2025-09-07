"use client";
import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/utils/axiosInstance";

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default project when projects are loaded and no current project exists
  useEffect(() => {
    if (!currentProject && projects.length > 0) {
      const defaultProject = projects[0];
      setCurrentProject(defaultProject);
    }
  }, [projects, currentProject]);

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/protected/project");
      const projectsData = response.data.result;
      setProjects(projectsData);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Switch to a different project
  const switchProject = useCallback((project) => {
    setCurrentProject(project);

    // You can add additional logic here like:
    // - Clear current chat messages
    // - Reset application state
    // - Send analytics events
    // - Redirect to project-specific routes
  }, []);

  // Get project by ID
  const getProjectById = useCallback(
    (id) => {
      return projects.find((project) => project.id === id);
    },
    [projects]
  );

  // Create a new project
  const createProject = useCallback(
    async (projectData) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.post(
          "/protected/project",
          {
            project_name: projectData.projectName,
            client_name: projectData.clientName,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const newProject = response.data;

        // Add the new project to the existing projects list
        // setProjects(prev => [newProject, ...prev]);

        // Refresh projects to get the latest data
        await fetchProjects();

        return { success: true, data: newProject };
      } catch (err) {
        console.error("Error creating project:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to create project";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProjects]
  );

  // Refresh projects data
  const refreshProjects = useCallback(() => {
    return fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    switchProject,
    getProjectById,
    refreshProjects,
    createProject,
  };
};

export default useProjects;
