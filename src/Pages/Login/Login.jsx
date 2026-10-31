import React, { useContext } from "react";
import { Button, Input, Label, Form } from "@heroui/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

import { loginschema } from "../../Lib/Schema/Loginschema";
import { TokenContext } from "../../Components/Context/TokenContext";

export default function Login() {
  const { setToken } = useContext(TokenContext);

  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginschema),
  });

  async function onsubmit(value) {

    try {
      const response = await axios.post(
        "https://oud-elite.shaarapp.com/api/v1/auth/login",
        value,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


      if (response.data.success === true) {
        const token = response.data.data.token;

        localStorage.setItem("token", token);
        setToken(token);

        toast.success(
          response.data.message || "Login successful!"
        );

        setTimeout(() => {
          nav("/home");
        }, 800);
      }
    } catch (error) {

      const message =
        error.response?.data?.message ||
        "Invalid email or password.";

      toast.error(message);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4 py-8 bg-[#b89452]/50 relative overflow-hidden">

      {/* Background Decorations */}

      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#b89452]/20 rounded-full blur-3xl" />

      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#8a6a35]/20 rounded-full blur-3xl" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#b89452]/10 rounded-full blur-3xl" />

      {/* Glass Card */}

      <div className="relative h-fit w-full max-w-md rounded-2xl bg-gray/60 backdrop-blur-xl border border-white/70 shadow-2xl p-6 md:p-8">

        {/* Header */}

        <div className="text-center mb-7">

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Sign in to your Oud Elite account
          </p>

        </div>

        {/* Form */}

        <Form
          onSubmit={handleSubmit(onsubmit)}
          className="flex w-full flex-col gap-5"
        >

          {/* Email */}

          <div className="w-full flex flex-col gap-1.5">

            <Label
              htmlFor="input-type-email"
              className="text-gray-800 text-sm font-medium"
            >
              Email
            </Label>

            <Input
              {...register("email")}
              id="input-type-email"
              type="email"
              placeholder="Enter your email"
              className="w-full"
              classNames={{
                inputWrapper:
                  "bg-white/70 border border-gray-300 shadow-none hover:bg-white focus-within:bg-white",
                input:
                  "text-gray-900 placeholder:text-gray-400",
              }}
            />

            {errors.email && (
              <p className="text-red-600 text-xs mt-1">
                {errors.email.message}
              </p>
            )}

          </div>

          {/* Password */}

          <div className="w-full flex flex-col gap-1.5">

            <Label
              htmlFor="input-type-password"
              className="text-gray-800 text-sm font-medium"
            >
              Password
            </Label>

            <Input
              {...register("password")}
              id="input-type-password"
              type="password"
              placeholder="Enter your password"
              className="w-full"
              classNames={{
                inputWrapper:
                  "bg-white/70 border border-gray-300 shadow-none hover:bg-white focus-within:bg-white",
                input:
                  "text-gray-900 placeholder:text-gray-400",
              }}
            />

            {errors.password && (
              <p className="text-red-600 text-xs mt-1">
                {errors.password.message}
              </p>
            )}

          </div>

          {/* Login Button */}

          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="
              w-full
              bg-black
              text-white
              rounded-lg
              font-semibold
              py-3
              hover:bg-[#b89452]
              hover:text-white
              transition-all
              duration-300
            "
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>

        </Form>

        {/* Register */}

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}

          <Link
            to="/register"
            className="
              text-gray-900
              font-semibold
              hover:text-[#b89452]
              hover:underline
              transition
            "
          >
            Create Account
          </Link>
        </p>

      </div>
    </main>
  );
}