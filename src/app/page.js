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
    <div className="relative h-screen overflow-hidden bg-white">
      <LightningLoader />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-3xl font-bold text-center text-zinc-800 z-10">
        Smart Sense
        <div className="text-base font-normal">Presented by Stormbreaker</div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xs">
        <h2 className="my-1 text-center text-zinc-800">Please Enter Employee Code</h2>

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
                className="border border-zinc-800 rounded-md p-2 bg-transparent text-zinc-800 placeholder-gray-500"
              />
              <ErrorMessage
                name="employeeCode"
                component="div"
                className="text-red-400 text-sm text-center"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="border border-zinc-800 rounded-md bg-zinc-800 text-white hover:bg-white hover:text-zinc-800 py-2 cursor-pointer"
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
