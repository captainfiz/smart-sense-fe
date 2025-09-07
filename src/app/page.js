"use client";

import { useRouter } from "next/navigation";
import { generateToken, saveToken } from "@/utils/auth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
import axiosInstance from "@/utils/axiosInstance";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username or Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Home() {
  const router = useRouter();

  const handleFormSubmit = (values) => {
    // Replace with real authentication
    const token = generateToken(values.username);
    saveToken(token);
    router.push("/projects");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left side - Login form */}
        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            SmartSense by StormBreaker
          </h2>
          <p className="text-gray-600 mb-6">Welcome back</p>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to continue managing your projects and chats.
          </p>

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-4">
                <div>
                  <Field
                    name="username"
                    type="text"
                    placeholder="e.g., alex@company.com or alex_id"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* <div className="flex justify-between items-center text-sm">
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                  >
                    Forgot password
                  </button>
                </div> */}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 cursor-pointer"
                >
                  Sign In
                </button>

                {/* <div className="flex items-center justify-center gap-2 text-sm mt-2">
                  <span className="text-gray-500">New to SmartSense?</span>
                  <button
                    type="button"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Create Account
                  </button>
                </div> */}
              </Form>
            )}
          </Formik>

          <p className="text-xs text-gray-400 mt-6">
            Use your work email or unique ID as your username.
          </p>
        </div>

        {/* Right side - Features / Testimonials */}
        <div className="bg-blue-50 p-8 md:p-12 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Project management meets AI
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>⚡ Intelligent chat that understands your projects</li>
              <li>📂 Organize initiatives and milestones</li>
              <li>👥 Collaborate with your team effortlessly</li>
            </ul>

            <div className="mt-6 bg-white border rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm inline-block">
              🔒 Enterprise-grade security
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-gray-700">
                “SmartSense keeps our projects moving.”
              </p>
              <p className="text-sm text-gray-500 mt-1">
                — Priya, Program Manager
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <p className="text-gray-700">
                “The chat interface is a game changer.”
              </p>
              <p className="text-sm text-gray-500 mt-1">
                — Markus, Product Lead
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
