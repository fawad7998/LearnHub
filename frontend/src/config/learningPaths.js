import { Braces, PanelsTopLeft, BrainCircuit } from "lucide-react";

export const learningPaths = [
  {
    title: "JavaScript & the browser",
    tag: "BUILD YOUR FOUNDATIONS",
    icon: Braces,
    query: "JavaScript",
    description:
      "Understand how the web behaves, then bring a page to life with your own code.",
    steps: [
      "Start with variables, functions, and arrays.",
      "Work with the DOM and browser events.",
      "Explore asynchronous code and API requests.",
    ],
    project: "Build a small task list with filters and a useful empty state.",
  },
  {
    title: "React & modern interfaces",
    tag: "TURN IDEAS INTO INTERFACES",
    icon: PanelsTopLeft,
    query: "React",
    description:
      "Move from individual components to a thoughtful interface that responds to its users.",
    steps: [
      "Get comfortable with components and props.",
      "Connect forms, state, and user interactions.",
      "Organize pages and connect them to data.",
    ],
    project: "Create a course browser with search, filters, and a saved list.",
  },
  {
    title: "Generative AI essentials",
    tag: "EXPLORE WITH CURIOSITY",
    icon: BrainCircuit,
    query: "Generative AI",
    description:
      "Learn the concepts, try small experiments, and build a habit of checking the results.",
    steps: [
      "Learn the language of generative AI.",
      "Write and compare clear, focused prompts.",
      "Explore practical uses and evaluate the output.",
    ],
    project:
      "Make a prompt notebook and compare how different instructions change an answer.",
  },
];
