import { ImageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

export const mediaAssetSchema = defineType({
  name: "mediaAsset",
  title: "Media Asset",
  type: "document",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "The filename or display name of the media",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "asset",
      title: "Media File",
      type: "file",
      description: "Upload the image or video file",
      options: {
        accept: "image/*,video/*",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt Text",
      type: "string",
      description: "Alternative text for accessibility",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "displayName",
      title: "Display Name",
      type: "string",
      description: "Project name shown in the grid and project view.",
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "number",
      description: "Width in pixels",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "number",
      description: "Height in pixels",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "invertColor",
      title: "Invert Color",
      type: "string",
      description: "Apply color inversion filter to this media asset",
      options: {
        list: [
          { title: "No", value: "no" },
          { title: "Yes", value: "yes" },
        ],
        layout: "radio",
      },
      initialValue: "no",
    }),
    defineField({
      name: "projectTypes",
      title: "Project Types",
      type: "array",
      description: "Select up to four categories for hover dots.",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: [
              { title: "Development", value: "dev" },
              { title: "Design", value: "design" },
              { title: "Motion", value: "motion" },
              { title: "3D", value: "3D" },
            ],
          },
        }),
      ],
      validation: (Rule) =>
        Rule.max(4)
          .unique()
          .custom((value) => {
            if (!Array.isArray(value)) return true;
            if (value.includes("3d")) {
              return 'Use uppercase "3D" for this project type.';
            }
            return true;
          }),
    }),
    orderRankField({ type: "mediaAsset" }),
  ],
  preview: {
    select: {
      title: "name",
      media: "asset",
      type: "type",
    },
    prepare({ title, media, type }) {
      return {
        title: title || "Untitled",
        subtitle: type ? type.charAt(0).toUpperCase() + type.slice(1) : "",
        media: type === "image" ? media : undefined,
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
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
