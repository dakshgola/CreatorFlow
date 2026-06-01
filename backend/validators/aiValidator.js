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

export const ideasSchema = z.object({
  body: z.object({
    prompt: z.string().optional(),
    niche: z.string().min(1, "Niche is required"),
    count: z.number().optional()
  })
});

export const captionsSchema = z.object({
  body: z.object({
    topic: z.string().min(1, "Topic is required"),
    tone: z.string().optional(),
    count: z.number().optional()
  })
});

export const scriptsSchema = z.object({
  body: z.object({
    topic: z.string().min(1, "Topic is required"),
    length: z.string().optional()
  })
});

export const hooksSchema = z.object({
  body: z.object({
    topic: z.string().min(1, "Topic is required"),
    count: z.number().optional()
  })
});

export const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required")
  })
});

export const bookmarkSchema = z.object({
  body: z.object({
    bookmarked: z.boolean({ required_error: "bookmarked field is required" })
  }),
  params: z.object({
    id: z.string().min(1, "ID parameter is required")
  })
});

