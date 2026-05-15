import { z } from "zod";

export const generateSchema = z.object({
  body: z.object({
    topic: z.string().min(3, "Topic is required"),
    type: z.enum(["script", "hook", "caption", "ideas", "other"]),
    platform: z.string().min(1, "Platform is required")
  })
});

export const abTitlesSchema = z.object({
  body: z.object({
    topic: z.string().min(3, "Topic is required")
  })
});

export const scoreSchema = z.object({
  body: z.object({
    content: z.string().min(10, "Content must be at least 10 characters"),
    type: z.enum(["title", "hook", "thumbnailConcept", "script"]),
    platform: z.string().min(1, "Platform is required")
  })
});

export const pipelineSchema = z.object({
  body: z.object({
    topic: z.string().min(3, "Topic is required"),
    script: z.string().min(10, "Script is required")
  })
});
