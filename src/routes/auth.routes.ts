import z from "zod";
const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Enter a valid email").min(1, "Email is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Lass name is required"),
    password: z.string().min(6, "Password is required"),
  }),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
