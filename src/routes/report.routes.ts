import z from "zod";

const getCategoryBreakdownSchema = z.object({
  query: z.object({
    category: z.string().min(1, "Category query is missing"),
  }),
});

const getTrendsSchema = z.object({
  query: z.object({
    filterBy: z.enum(["7", "30", "365"], {
      error: "filterBy must either be 7 or 30 or 365",
    }),
  }),
});

const getSummarySchema = z.object({
  query: z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  }),
});

export type TGetCategoryBreakdown = z.infer<
  typeof getCategoryBreakdownSchema
>;
export type TGetTrends = z.infer<typeof getTrendsSchema>;
export type TGetSummary = z.infer<typeof getSummarySchema>;
