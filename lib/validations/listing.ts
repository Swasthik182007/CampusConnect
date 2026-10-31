import { z } from "zod";

export const listingCategories = [
  "Books",
  "Notes",
  "Lab Equipment",
  "Electronics",
  "Furniture",
  "Others",
] as const;

export const itemConditions = ["New", "Like New", "Good", "Used"] as const;

export const listingSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title cannot exceed 100 characters."),
  category: z.enum(listingCategories, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  condition: z.enum(itemConditions, {
    errorMap: () => ({ message: "Please select a valid condition." }),
  }),
  price: z
    .number({ invalid_type_error: "Price must be a valid number." })
    .min(0, "Price cannot be negative.")
    .max(100000, "Price cannot exceed ₹1,00,000."),
  negotiable: z.boolean().default(false),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(1000, "Description cannot exceed 1000 characters."),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least 1 photo is required.")
    .max(5, "Maximum 5 photos allowed."),
});

export type ListingFormValues = z.infer<typeof listingSchema>;

