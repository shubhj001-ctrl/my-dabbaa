import { z } from "zod";
import {
  CHANDIGARH_SECTORS,
  CUISINE_OPTIONS,
  MEAL_CATEGORY_OPTIONS,
  OPERATING_DAY_OPTIONS,
} from "@/config/marketplace";

const sectorSchema = z
  .string()
  .regex(/^Sector \d+$/)
  .refine(
    (sector) =>
      CHANDIGARH_SECTORS.some((number) => sector === `Sector ${number}`),
    "Choose a Chandigarh sector.",
  );

const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(?:\+91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number."));

export const kitchenDraftSchema = z.object({
  id: z.string().uuid().optional(),
  kitchenName: z.string().trim().min(2).max(100),
  contactName: z.string().trim().min(2).max(100),
  description: z.string().trim().min(30).max(2000),
  contactPhone: phoneSchema,
  contactEmail: z.string().trim().email().max(254),
  address: z.string().trim().min(5).max(300),
  sector: sectorSchema,
  pincode: z.string().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
  cuisineTypes: z.array(z.enum(CUISINE_OPTIONS)).min(1).max(8),
  foodType: z.enum(["vegetarian", "non_vegetarian", "both"]),
  preparationType: z.enum(["homemade", "cloud_kitchen", "tiffin_service"]),
  mealCategories: z.array(z.enum(MEAL_CATEGORY_OPTIONS)).min(1).max(3),
  avgDailyCapacity: z.coerce.number().int().min(1).max(10000),
  operatingDays: z.array(z.enum(OPERATING_DAY_OPTIONS)).min(1).max(7),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/),
  serviceSectors: z.array(sectorSchema).min(1).max(15),
}).refine((value) => value.openingTime < value.closingTime, {
  path: ["closingTime"],
  message: "Closing time must be after opening time.",
});

export const planSchema = z.object({
  id: z.string().uuid().optional(),
  planName: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(500),
  mealType: z.enum(MEAL_CATEGORY_OPTIONS),
  price: z.coerce.number().positive().max(100000),
  durationDays: z.coerce.number().int().min(1).max(365),
  mealsPerWeek: z.coerce.number().int().min(1).max(21),
  isVegetarian: z.boolean(),
});

export const menuPostSchema = z.object({
  id: z.string().uuid().optional(),
  menuDate: z.string().date(),
  mealType: z.enum(MEAL_CATEGORY_OPTIONS),
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(2000),
  imageUrl: z.union([z.literal(""), z.string().url().max(2048)]).optional(),
  isPublished: z.boolean().default(true),
});

export const kitchenReviewSchema = z.object({
  kitchenId: z.string().uuid(),
  decision: z.enum(["approved", "rejected", "suspended"]),
  reason: z.string().trim().max(1000).optional(),
}).superRefine((value, context) => {
  if (value.decision === "rejected" && (value.reason?.length ?? 0) < 10) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "Give the provider at least 10 characters of helpful feedback.",
    });
  }
});
