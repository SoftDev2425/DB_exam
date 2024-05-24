import { z } from "zod";

export const UserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must be at most 50 characters."),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be at most 50 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8).max(255),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in the format YYYY-MM-DD"),
  gender: z
    .string()
    .min(1, {
      message: "Gender must either be 'M' or 'F'.",
    })
    .max(1, {
      message: "Gender must either be 'M' or 'F'.",
    })
    .regex(/^[MFmf]$/, {
      message: "Gender must either be 'M' or 'F'.",
    }),
});
