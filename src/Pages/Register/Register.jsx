

import React from "react";
import { Input, Label, Form, Button } from "@heroui/react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerschema } from "../../Lib/Schema/registerschema";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
    resolver: zodResolver(registerschema),
  });

  async function onsubmit(value) {

    try {
      const response = await axios.post(
        "https://oud-elite.shaarapp.com/api/v1/auth/register",
        value,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Register Response:", response.data);

      if (response.data.success === true) {
        toast.success(
          response.data.message || "Account created successfully!"
        );

        setTimeout(() => {
          nav("/login");
        }, 1000);
      }
    } catch (error) {

      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      toast.error(message);
    }
  }

  return (
    <main className="min-h-screen text-black w-full flex items-center justify-center px-4 py-8 bg-[#b89452]/50 relative overflow-hidden">

      {/* Background Decorations */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#b89452]/20 rounded-full blur-3xl" />

      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#8a6a35]/30 rounded-full blur-3xl" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#b89452]/5 rounded-full blur-3xl" />

      {/* Glass Card */}
      <div className="relative h-fit w-full max-w-md rounded-2xl bg-gray/60 backdrop-blur-xl border border-white/70 shadow-2xl p-6 md:p-8">

        {/* Header */}
        <div className="text-center mb-6">

          <h1 className="text-2xl md:text-3xl font-bold text-black">
            Create Account
          </h1>

          <p className="text-black/60 text-sm mt-2">
            Join Oud Elite and discover your signature scent
          </p>

        </div>

        {/* Form */}
        <Form
          onSubmit={handleSubmit(onsubmit)}
          className="flex w-full flex-col gap-4"
        >

          {/* Name */}
          <div className="w-full flex flex-col gap-1.5">

            <Label
              htmlFor="input-type-name"
              className="text-black text-sm font-medium"
            >
              Full Name
            </Label>

            <Input
              {...register("name")}
              id="input-type-name"
              type="text"
              placeholder="Enter your name"
              className="w-full"
              classNames={{
                inputWrapper:
                  "bg-white/10 border border-white/30 shadow-none hover:bg-white/15 focus-within:bg-white/15",
                input:
                  "text-black placeholder:text-black/40",
              }}
            />

            {errors.name && (
              <p className="text-red-600 text-xs mt-1">
                {errors.name.message}
              </p>
            )}

          </div>

          {/* Email */}
          <div className="w-full flex flex-col gap-1.5">

            <Label
              htmlFor="input-type-email"
              className="text-black text-sm font-medium"
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
                  "bg-white/10 border border-white/30 shadow-none hover:bg-white/15 focus-within:bg-white/15",
                input:
                  "text-black placeholder:text-black/40",
              }}
            />

            {errors.email && (
              <p className="text-red-600 text-xs mt-1">
                {errors.email.message}
              </p>
            )}

          </div>

          {/* Phone */}
          <div className="w-full flex flex-col gap-1.5">

            <Label
              htmlFor="input-type-phone"
              className="text-black text-sm font-medium"
            >
              Phone
            </Label>

            <Input
              {...register("phone")}
              id="input-type-phone"
              type="tel"
              placeholder="+971501234567"
              className="w-full"
              classNames={{
                inputWrapper:
                  "bg-white/10 border border-white/30 shadow-none hover:bg-white/15 focus-within:bg-white/15",
                input:
                  "text-black placeholder:text-black/40",
              }}
            />

            {errors.phone && (
              <p className="text-red-600 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}

          </div>

          {/* Password */}
          <div className="w-full flex flex-col gap-1.5">

            <Label
              htmlFor="input-type-password"
              className="text-black text-sm font-medium"
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
                  "bg-white/10 border border-white/30 shadow-none hover:bg-white/15 focus-within:bg-white/15",
                input:
                  "text-black placeholder:text-black/40",
              }}
            />

            {errors.password && (
              <p className="text-red-600 text-xs mt-1">
                {errors.password.message}
              </p>
            )}

          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isDisabled={isSubmitting}
            className="
              w-full
              mt-2
              bg-white
              text-black
              py-3
              rounded-lg
              font-semibold
              hover:bg-[#d6bd8a]
              hover:text-black
              transition-all
              duration-300
            "
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>

        </Form>

        {/* Login */}
        <p className="text-center text-sm text-black/60 mt-5">

          Already have an account?{" "}

          <Link
            to="/login"
            className="
              text-black
              font-semibold
              hover:text-gray-900
              hover:underline
              transition
            "
          >
            Login
          </Link>

        </p>

      </div>
    </main>
  );
}



