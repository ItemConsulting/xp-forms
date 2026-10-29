import type { Meta, StoryObj } from "@itemconsulting/storybook-framework-enonic-xp";
import type { PageReview } from "./form-page-review.freemarker";
import id from "./form-page-review.ftlh";

const meta: Meta<PageReview> = {
  title: "Part/Form View",
  parameters: {
    server: {
      id,
    },
  },
};

export default meta;

export const reviewPage: StoryObj<PageReview> = {
  args: {
    backUrl: "#",
    editUrl: "#",
    title: "Check your answers before sending your application",
    frameId: "frame",
    isPreviewReviewPage: false,
    sections: [
      {
        title: "Personal details",
        fields: [
          {
            id: "field-1",
            label: "Name",
            name: "name",
            values: ["Homer Simpson"],
            valuesResolved: ["Homer Simpson"],
          },
          {
            id: "field-2",
            label: "Email address",
            name: "email",
            values: ["chunkylover53@aol.com"],
            valuesResolved: ["chunkylover53@aol.com"],
          },
          {
            id: "field-3",
            label: "Phone number",
            name: "phone",
            values: ["555-3223"],
            valuesResolved: ["555-3223"],
          },
          {
            id: "field-4",
            label: "Address",
            name: "address",
            values: ["742 Evergreen Terrace\nSpringfield"],
            valuesResolved: ["742 Evergreen Terrace\nSpringfield"],
          },
        ],
      },
      {
        title: "Work experience",
        fields: [
          {
            id: "work-experience-1",
            label: "Position",
            name: "position",
            values: [
              "Nuclear Technician",
              "Astronaut for NASA",
              "Bartender",
              "Car designer",
              "Internet Service Provider",
              'Mascot, known as "Dancing Homer"',
              "Union leader",
            ],
            valuesResolved: [
              "Nuclear Technician",
              "Astronaut for NASA",
              "Bartender",
              "Car designer",
              "Internet Service Provider",
              'Mascot, known as "Dancing Homer"',
              "Union leader",
            ],
          },
        ],
      },
      {
        title: "Education",
        fields: [
          {
            id: "education-1",
            label: "Institution",
            name: "institution",
            values: ["Graduated Springfield High"],
            valuesResolved: ["Graduated Springfield High"],
          },
        ],
      },
    ],
    submitButtonText: "Accept and send",
    pageId: "page-review",
    errors: {},
    spamPreventionConfig: {
      type: "none",
    },
  },
};
