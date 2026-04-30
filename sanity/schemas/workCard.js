import { DocumentTextIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

export const workCardSchema = defineType({
  name: "workCard",
  title: "Work",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Card Categories",
      type: "array",
      description: "Add one or more category labels for this card",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.required().min(1).unique(),
    }),
    defineField({
      name: "category",
      title: "Category (Legacy)",
      type: "string",
      description: "Legacy field. Use Card Categories instead.",
      hidden: true,
    }),
    defineField({
      name: "media",
      title: "Card Media",
      type: "file",
      description: "Upload an image or video for this card",
      options: {
        accept: "image/*,video/*",
      },
    }),
    defineField({
      name: "mediaAlt",
      title: "Media Alt Text",
      type: "string",
      description: "Accessibility text for uploaded media",
      hidden: ({ document }) => !document?.media,
    }),
    defineField({
      name: "url",
      title: "Project URL",
      type: "url",
      description: "External URL opened when this card is clicked",
      validation: (Rule) =>
        Rule.required().uri({
          scheme: ["http", "https"],
          allowRelative: false,
        }),
    }),
    orderRankField({ type: "workCard" }),
  ],
  preview: {
    select: {
      title: "title",
      categories: "categories",
      category: "category",
      media: "media",
    },
    prepare({ title, categories, category, media }) {
      const categoryList = Array.isArray(categories)
        ? categories.filter(Boolean)
        : [];
      const subtitle =
        categoryList.length > 0
          ? categoryList.join(" / ")
          : category || "No categories";

      return {
        title,
        subtitle,
        media,
      };
    },
  },
  orderings: [
    {
      title: "Order",
      name: "orderRankAsc",
      by: [{ field: "orderRank", direction: "asc" }],
    },
    {
      title: "Order (Descending)",
      name: "orderRankDesc",
      by: [{ field: "orderRank", direction: "desc" }],
    },
  ],
});
