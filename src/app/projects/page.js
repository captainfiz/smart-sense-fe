"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useProjects from "@/hooks/useProjects";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import {
  IoAdd,
  IoArrowBack,
  IoBusinessOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";

const validationSchema = Yup.object().shape({
  projectName: Yup.string()
    .required("Project name is required")
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be less than 100 characters"),
  clientName: Yup.string()
    .required("Client name is required")
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name must be less than 100 characters"),
});

const ProjectsPage = () => {
  useAuthRedirect();
  const router = useRouter();
  const {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    switchProject,
  } = useProjects();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (values, { setSubmitting, resetForm }) => {
    setCreateError(null);
    setCreateSuccess(false);

    const result = await createProject({
      projectName: values.projectName,
      clientName: values.clientName,
    });

    if (result.success) {
      setCreateSuccess(true);
      resetForm();
      setShowCreateForm(false);
      setTimeout(() => setCreateSuccess(false), 3000);
    } else {
      setCreateError(result.error);
    }
    setSubmitting(false);
  };

  const handleProjectSelect = (project) => {
    console.log("Selected project:", project);

    if (!project._id) {
      setCreateError("Project ID is missing. Cannot switch to this project.");
      return;
    }

    const projectId = project._id 
    router.push(`/chat/${projectId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-start flex-col">
              <h1 className="text-xl font-semibold text-gray-900">
                SmartSense
              </h1>
              <span className="text-gray-400 text-sm">By Stormbreaker</span>
            </div>
            <div className="p-4 text-xs">
              <button
                className="text-zinc-800 hover:bg-gray-300 bg-gray-200 py-2 px-3 rounded-full text-sm w-full text-left cursor-pointer flex items-center gap-2"
                onClick={handleLogout}
              >
                <IoIosLogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {createSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">Project created successfully!</p>
          </div>
        )}

        {createError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{createError}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Create Project Form */}
        {showCreateForm && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm border p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Create New Project
            </h2>

            <Formik
              initialValues={{ projectName: "", clientName: "" }}
              validationSchema={validationSchema}
              onSubmit={handleCreateProject}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="projectName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Project Name *
                      </label>
                      <div className="relative">
                        <IoBusinessOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Field
                          name="projectName"
                          type="text"
                          placeholder="Enter project name"
                          className="w-full pl-10 text-zinc-800 pr-4 py-2 border border-gray-300 rounded-lg focus:border-gray-700"
                        />
                      </div>
                      <ErrorMessage
                        name="projectName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="clientName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Client Name *
                      </label>
                      <div className="relative">
                        <IoPersonOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Field
                          name="clientName"
                          type="text"
                          placeholder="Enter client name"
                          className="w-full pl-10 pr-4 text-zinc-800 py-2 border border-gray-300 rounded-lg focus:border-gray-700"
                        />
                      </div>
                      <ErrorMessage
                        name="clientName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setCreateError(null);
                      }}
                      className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-3xl hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-3xl text-white bg-[#3B82F6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? "Creating..." : "Create Project"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-4 border-b border-gray-200 flex flex-row flex-1 items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your Projects</h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage and switch between your projects
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-3xl text-white bg-[#3B82F6] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <IoAdd className="h-4 w-4 mr-2" />
              Create Project
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <IoBusinessOutline className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No projects
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new project.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects?.map((project) => (
                  <div
                    key={project.id || project._id}
                    className="bg-[#E6F0FF] border border-[#b9ceef] rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {project.name || project.project_name}
                        </h3>
                        {(project.description || project.client_name) && (
                          <p className="text-gray-500 mt-1 text-sm font-semibold truncate">
                            {project.description ||
                              `Client: ${project.client_name}`}
                          </p>
                        )}
                        {project.team && (
                          <p className="text-xs text-gray-400 mt-2">
                            Team: {project.team}
                          </p>
                        )}
                        {project.created_at && (
                          <p className="text-xs text-gray-400 mt-1">
                            Created On:{" "}
                            {new Date(project.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <IoBusinessOutline className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
