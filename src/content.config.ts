import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    categories: z.array(z.string()).default(['未分类']),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    top: z.boolean().default(false),
    description: z.string().optional(),
  }),
});

const friends = defineCollection({
  loader: glob({ pattern: 'friends-*.yml', base: './src/content/data' }),
  schema: z.object({
    class_name: z.string(),
    flink_style: z.string().optional(),
    class_desc: z.string().optional(),
    link_list: z.array(z.object({
      name: z.string(),
      link: z.string(),
      avatar: z.string(),
      descr: z.string(),
      siteshot: z.string().optional(),
      color: z.string().optional(),
      tag: z.string().optional(),
      recommend: z.boolean().optional(),
    })),
  }),
});

const equipment = defineCollection({
  loader: glob({ pattern: 'equipment.yml', base: './src/content/data' }),
  schema: z.object({
    class_name: z.string(),
    description: z.string().optional(),
    tip: z.string().optional(),
    top_background: z.string().optional(),
    good_things: z.array(z.object({
      title: z.string(),
      description: z.string(),
      equipment_list: z.array(z.object({
        name: z.string(),
        specification: z.string(),
        description: z.string(),
        image: z.string(),
        link: z.string().optional(),
      })),
    })),
  }),
});

const essay = defineCollection({
  loader: glob({ pattern: 'essay.yml', base: './src/content/data' }),
  schema: z.object({
    title: z.string(),
    subTitle: z.string().optional(),
    tips: z.string().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    limit: z.number().optional(),
    home_essay: z.boolean().optional(),
    top_background: z.string().optional(),
    essay_list: z.array(z.object({
      content: z.string(),
      date: z.string(),
      img: z.array(z.string()).optional(),
      video: z.array(z.string()).optional(),
      link: z.string().optional(),
      aplayer: z.object({
        server: z.string(),
        id: z.string(),
      }).optional(),
    })),
  }),
});

const album = defineCollection({
  loader: glob({ pattern: 'album-*.yml', base: './src/content/data' }),
  schema: z.object({
    class_name: z.string(),
    path_name: z.string(),
    description: z.string().optional(),
    cover: z.string().optional(),
    album_list: z.array(z.object({
      date: z.coerce.string().transform((v) => v.includes('T') ? v.split('T')[0] : v),
      content: z.string(),
      album_name: z.string().optional(),
      image: z.array(z.string()),
    })),
  }),
});

export const collections = { blog, friends, equipment, essay, album };
