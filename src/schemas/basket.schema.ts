import { z } from "zod";

export const AddToBasketSchema = z.object({
  isbn: z
    .string()
    .regex(
      /^(?:ISBN(?:-1[03])?:? )?(?=[-0-9X ]{13,17}$|[-0-9 ]{10,16}$)(?:97[89][- ]?)?(?:[0-9][- ]?){9}[0-9X]$/,
      "ISBN must be a 13-digit number."
    ),
  quantity: z.number().int().positive("Quantity must be a positive number."),
});
