"use client";

import { useRouter } from "next/navigation";
import { generateToken, saveToken } from "@/utils/auth";
import LightningLoader from "@/components/LightningLoader";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  employeeCode: Yup.string()
    .trim()
    .matches(/^[a-zA-Z0-9]{4,10}$/, "Must be 4–10 alphanumeric characters")
    .required("Employee code is required"),
});

export default function Home() {
  const router = useRouter();

  const handleFormSubmit = (values) => {
    const token = generateToken(values.employeeCode);
    saveToken(token);
    router.push("/chat");
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <LightningLoader />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-3xl font-bold text-center z-10">
        Smart Sense
        <div className="text-base font-normal">Presented by Strombreaker</div>
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-xs">
        <h2 className="my-1 text-center">Please Enter Employee Code</h2>

        <Formik
          initialValues={{ employeeCode: "" }}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-2">
              <Field
                name="employeeCode"
                type="text"
                placeholder="Employee Code"
                className="border border-white rounded-md p-2 bg-transparent text-white placeholder-white"
              />
              <ErrorMessage
                name="employeeCode"
                component="div"
                className="text-red-400 text-sm text-center"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="border border-white rounded-md bg-white text-black hover:bg-black hover:text-white py-2 cursor-pointer"
              >
                Continue
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
