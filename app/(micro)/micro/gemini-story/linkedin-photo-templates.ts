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
    name: "Industry Specialist",
    description: "Subject shown as an expert in their professional environment",
  },
  "thought-leader": {
    id: "thought-leader",
    name: "Thought Leader",
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

// Profession-specific elements and environments
export const PROFESSION_OPTIONS = {
  tech: {
    id: "tech",
    name: "Technology",
    elements:
      "premium laptop, modern tech devices, and a clean minimalist environment with subtle tech elements. Background can include code snippets on screens or modern office space with tech company aesthetic.",
  },
  finance: {
    id: "finance",
    name: "Finance/Business",
    elements:
      "elegant office environment with financial charts or trading screens in the background, leather portfolio, or modern financial district elements.",
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare",
    elements:
      "professional medical setting with subtle medical equipment, lab coat if appropriate, stethoscope or other relevant tools of the profession in a clean clinical environment.",
  },
  creative: {
    id: "creative",
    name: "Creative/Design",
    elements:
      "creative workspace with design elements, artistic tools, portfolios, or screens showing design work in an inspiring creative studio environment.",
  },
  education: {
    id: "education",
    name: "Education",
    elements:
      "professional academic setting with books, teaching materials, or scholarly elements in a classroom, library, or campus environment.",
  },
  legal: {
    id: "legal",
    name: "Legal",
    elements:
      "professional law office with legal books, subtle legal scales of justice motif, or elegant wood-paneled environment with legal documents.",
  },
  engineering: {
    id: "engineering",
    name: "Engineering",
    elements:
      "professional engineering environment with blueprints, models, or technical equipment relevant to their engineering specialty.",
  },
  general: {
    id: "general",
    name: "General Professional",
    elements:
      "clean professional environment with modern office elements and subtle professional tools.",
  },
};

// Build a prompt based on selected options
export function buildPhotoPrompt(
  photoStyle: string,
  gender: string,
  profession: string
): string {
  const genderOption =
    GENDER_OPTIONS[gender as keyof typeof GENDER_OPTIONS] ||
    GENDER_OPTIONS.neutral;
  const professionOption =
    PROFESSION_OPTIONS[profession as keyof typeof PROFESSION_OPTIONS] ||
    PROFESSION_OPTIONS.general;

  // Get the appropriate clothing description based on style and gender
  const clothing =
    genderOption.clothing[photoStyle as keyof typeof genderOption.clothing] ||
    "professional attire appropriate for the context";

  // Base prompts for each style
  const basePrompts = {
    "professional-headshot": `Edit this photo to create a stunning professional headshot with a clean, neutral background. 
      Keep the person's face and identity intact but enhance it to show them with a warm, confident smile and bright, engaging eyes. 
      Dress the subject in ${clothing}. 
      Make the lighting soft and flattering with perfect exposure to highlight facial features without harsh shadows. 
      Create subtle, professional skin retouching while maintaining a natural look. 
      Position the subject with head and shoulders framing at a slightly angled pose that conveys approachability and leadership. 
      Ensure sharp focus on the face with professional color grading that complements skin tone.`,

    "casual-professional": `Edit this photo to create a polished business casual portrait that looks like it was taken in a modern, well-lit office or co-working space. 
      Maintain the person's identity but enhance their appearance with a relaxed yet confident expression showing a genuine smile that reaches their eyes. 
      Dress the subject in ${clothing}. 
      Create natural-looking lighting as if from large windows, with subtle highlights on the face. 
      Adjust the subject's posture to appear engaged and approachable, positioned at a slight angle to camera. 
      Add a sophisticated, slightly blurred background showing a clean, contemporary workspace with subtle professional elements like minimalist furniture or plants. 
      Enhance colors to create a warm, inviting professional atmosphere.`,

    "industry-specialist": `Edit this photo to create a compelling professional portrait in a work environment that establishes subject matter expertise. 
      Keep the person's face and identity intact but enhance the image to show them confidently engaged in their professional environment with an authoritative yet approachable expression. 
      Dress the subject in ${clothing}. 
      Include ${professionOption.elements} 
      Enhance the lighting to create depth and dimension with professional color grading that creates a cohesive look. 
      Position the subject as the clear focal point with perfect focus and a slight perspective that emphasizes their command of their field. 
      Show them actively demonstrating skill or knowledge through posture and expression.`,

    "thought-leader": `Edit this photo to make it look like the person is confidently presenting or speaking at a high-profile professional event. 
      Keep the person's face and identity intact but enhance their appearance with perfect grooming and tailored professional attire. 
      Dress the subject in ${clothing}. 
      Show them with animated, passionate facial expressions and deliberate hand gestures that convey expertise and conviction. 
      Adjust the camera angle to appear slightly from below eye level to convey authority. 
      Create dramatic, professional stage lighting that highlights their features. 
      Add a sophisticated background suggesting a conference, TED-style stage, or executive setting with subtle audience or venue elements. 
      Include subtle ${professionOption.elements} where appropriate.
      Enhance colors to create a high-impact, memorable image with professional color grading that emphasizes blues and contrasting tones. 
      Ensure the clothing appears pristine with perfect fit and premium quality.`,
  };

  // Get the base prompt for the selected style
  const basePrompt =
    basePrompts[photoStyle as keyof typeof basePrompts] ||
    `Edit this photo to create a professional portrait. Keep the person's face and identity intact but enhance it to look professional and polished. Dress them in ${clothing} and include ${professionOption.elements}`;

  // Clean up and format the prompt
  return basePrompt.replace(/\s+/g, " ").trim();
}
