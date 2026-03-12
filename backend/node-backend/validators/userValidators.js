import { z } from "zod";
export const userZodSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be at most 50 characters"),
    email: z
        .string()
        .email("invalid email format"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
    role: z
        .enum(["user", "hr"])
        .optional(),
    provider: z
        .enum(["local", "google"])
        .default("local"),
    officeName: z
        .string()
        .optional(),
    refreshToken: z
        .string()
        .optional(),
    refreshTokenExpiry: z
        .coerce.date()
        .optional(),

})
    .refine((data) => {
        if (data.provider === "local" && !data.password) {
            return false
        }
        return true
    },
        {
            message: "Password is required when provider is local",
            path: ["password"]

        })
    .refine((data) => {
        if (data.role === "hr" && !data.officeName) {
            return false
        }
        return true
    },
        {
            message: "office name is required when role is hr",
            path: ["officeName"]

        })

