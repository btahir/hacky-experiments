// LinkedIn Photo Templates with customizable options

// Photography styles
export const PHOTO_STYLES = {
  "professional-headshot": {
    id: "professional-headshot",
    name: "Professional Headshot",
    description: "Clean professional headshot with neutral background",
  },
  "casual-professional": {
    id: "casual-professional",
    name: "Casual Professional",
    description: "Business casual portrait in modern office setting",
  },
  "industry-specialist": {
    id: "industry-specialist",
    name: "Industry Expert",
    description: "Subject shown as an expert with confident posture",
  },
  "thought-leader": {
    id: "thought-leader",
    name: "Presenter/Speaker",
    description: "Subject presenting or speaking at a professional event",
  },
};

// Gender-specific clothing and styling options
export const GENDER_OPTIONS = {
  male: {
    id: "male",
    name: "Male",
    clothing: {
      "professional-headshot":
        "a well-fitted navy blue or charcoal suit with a crisp light-colored shirt and subtle tie",
      "casual-professional":
        "a quality button-down shirt with open collar and well-fitted chinos/slacks",
      "industry-specialist": "smart business wear with a modern touch",
      "thought-leader":
        "a premium dark suit with subtle pattern and quality tie",
    },
  },
  female: {
    id: "female",
    name: "Female",
    clothing: {
      "professional-headshot":
        "a professional blazer/blouse in a flattering color",
      "casual-professional": "a smart blouse with tasteful accessories",
      "industry-specialist":
        "stylish professional clothes with a polished look",
      "thought-leader": "an elegant business dress/suit in a commanding color",
    },
  },
  neutral: {
    id: "neutral",
    name: "Gender Neutral",
    clothing: {
      "professional-headshot":
        "professional business attire with a well-coordinated color scheme",
      "casual-professional":
        "smart business casual attire that looks modern and professional",
      "industry-specialist":
        "appropriate professional clothing for the industry",
      "thought-leader":
        "polished professional attire suitable for public speaking",
    },
  },
};

// Background color options and environments
export const BACKGROUND_COLORS = {
  neutral_gray: {
    id: "neutral_gray",
    name: "Neutral Gray",
    description: "Classic professional gray background (most popular choice)",
  },
  studio_gradient: {
    id: "studio_gradient",
    name: "Studio Backdrop",
    description: "Professional studio lighting with subtle gradient backdrop",
  },
  office_environment: {
    id: "office_environment",
    name: "Office Environment",
    description: "Tastefully blurred modern office setting in background",
  },
  textured_solid: {
    id: "textured_solid",
    name: "Textured Solid",
    description: "Solid colored background with subtle texture for dimension",
  },
  outdoor_professional: {
    id: "outdoor_professional",
    name: "Outdoor Professional",
    description: "Clean outdoor setting with professional lighting",
  },
};

// Build a prompt based on selected options
export function buildPhotoPrompt(
  photoStyle: string,
  gender: string,
  backgroundColor: string
): string {
  // Get the clothing description based on gender and photo style
  const clothing =
    GENDER_OPTIONS[gender as keyof typeof GENDER_OPTIONS]?.clothing[
      photoStyle as keyof typeof PHOTO_STYLES
    ] || "professional attire";

  // Get background description based on selected background color
  let backgroundDesc = "";
  switch (backgroundColor) {
    case "neutral_gray":
      backgroundDesc = "a clean, professional neutral gray backdrop";
      break;
    case "studio_gradient":
      backgroundDesc =
        "a professional studio backdrop with soft, flattering lighting and subtle gradient";
      break;
    case "office_environment":
      backgroundDesc =
        "a tastefully blurred professional office environment that suggests a corporate setting";
      break;
    case "textured_solid":
      backgroundDesc =
        "a solid colored background with subtle texture that adds visual interest while keeping focus on the subject";
      break;
    case "outdoor_professional":
      backgroundDesc =
        "a clean, well-lit outdoor setting with professional lighting that looks polished but natural";
      break;
    default:
      backgroundDesc =
        "a professionally lit neutral backdrop that enhances the subject's presence";
  }

  // Base prompts for each style
  const basePrompts = {
    "professional-headshot": `Edit this photo to create a stunning professional headshot with ${backgroundDesc}. 
      Keep the person's face and identity intact but enhance it to show them with a warm, confident smile and bright, engaging eyes. 
      Dress the subject in ${clothing}. 
      Make the lighting soft and flattering with perfect exposure to highlight facial features without harsh shadows. 
      Ensure the subject takes up approximately 80% of the frame, with proper headroom and spacing.
      Position the subject with head and shoulders framing at a slightly angled pose that conveys approachability and leadership. 
      Ensure sharp focus on the face with professional color grading that complements skin tone.`,

    "casual-professional": `Edit this photo to create a polished business casual portrait with ${backgroundDesc}. 
      Maintain the person's identity but enhance their appearance with a relaxed yet confident expression showing a genuine smile that reaches their eyes. 
      Dress the subject in ${clothing}. 
      Create natural-looking lighting as if from large windows, with subtle highlights on the face. 
      Position the person to take up 70-80% of the frame with a professional, relaxed pose.
      Apply subtle bokeh effect to the background for a professional depth-of-field.
      Enhance colors to create a warm, inviting professional atmosphere.`,

    "industry-specialist": `Edit this photo to create a compelling professional portrait with ${backgroundDesc}. 
      Keep the person's face and identity intact but enhance the image to show them confidently engaged as the main focus with an authoritative yet approachable expression. 
      Dress the subject in ${clothing}. 
      Ensure the subject takes up at least 70% of the frame with perfect lighting that highlights their face and expression.
      Maintain clean, minimal composition with professional lighting that creates separation between subject and background.
      Position the subject as the clear focal point with perfect focus and a slight perspective that emphasizes their expertise. 
      Apply a subtle vignette effect to further focus attention on the subject.`,

    "thought-leader": `Edit this photo to make it look like the person is confidently presenting or speaking at a professional event with ${backgroundDesc}. 
      Keep the person's face and identity intact but enhance their appearance with perfect grooming and tailored professional attire. 
      Dress the subject in ${clothing}. 
      Show them with animated, passionate facial expressions and deliberate hand gestures that convey expertise and conviction. 
      Position the subject in the foreground taking up about 60% of the frame, standing confidently.
      
      Create a professional speaking context with:
      - Soft spotlighting on the subject from above
      - A sense of space around the subject suggesting a stage or speaking area
      - IMPORTANT: Ensure a completely clear, unobstructed view of the subject
      
      Enhance colors to create a high-impact, memorable image that emphasizes the subject as a thought leader.
      Ensure the clothing appears pristine with perfect fit and premium quality.`,
  };

  // Get the base prompt for the selected style
  const basePrompt =
    basePrompts[photoStyle as keyof typeof basePrompts] ||
    `Edit this photo to create a professional portrait. Keep the person's face and identity intact but enhance it to look professional and polished. Dress them in ${clothing} with ${backgroundDesc}`;

  // Clean up and format the prompt
  return basePrompt.replace(/\s+/g, " ").trim();
}
