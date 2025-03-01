"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, RefreshCw, Moon, Sun, ChevronRight, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define assessment questions with options
const assessmentQuestions = [
  // Emotional Regulation
  {
    id: "mood",
    question:
      "When something doesn't go as planned in your day (like missing a deadline or making a mistake), how do you typically react emotionally?",
    options: [
      { value: "3", label: "I feel completely devastated and have trouble recovering for days" },
      { value: "2", label: "I become very upset and need several hours to calm down" },
      { value: "1", label: "I feel disappointed but can usually manage my emotions" },
      { value: "0", label: "I can maintain perspective and regulate my emotions well" },
    ],
    category: "emotional_regulation",
    explanation:
      "This question helps assess your emotional resilience and ability to cope with daily challenges. Strong emotional reactions to minor setbacks might indicate difficulty with emotion regulation.",
  },
  {
    id: "emotional_awareness",
    question: "When someone asks you how you're feeling, how easy is it for you to identify and express your emotions?",
    options: [
      { value: "3", label: "I often feel numb or confused about what I'm feeling" },
      { value: "2", label: "I struggle to identify specific emotions beyond 'good' or 'bad'" },
      { value: "1", label: "I can usually identify my emotions but sometimes have trouble expressing them" },
      { value: "0", label: "I can easily identify and express my emotional state" },
    ],
    category: "emotional_awareness",
    explanation:
      "Difficulty identifying emotions (alexithymia) can be associated with various mental health conditions and may impact emotional processing and relationships.",
  },

  // Thought Patterns
  {
    id: "self_talk",
    question: "When you make a mistake or face a setback, what kind of thoughts typically go through your mind?",
    options: [
      { value: "3", label: "I constantly berate myself and think I'm worthless/hopeless" },
      { value: "2", label: "I focus on my flaws and think about past failures" },
      { value: "1", label: "I feel disappointed but try to learn from the experience" },
      { value: "0", label: "I maintain a balanced perspective and view it as an opportunity to grow" },
    ],
    category: "cognitive_patterns",
    explanation:
      "Your internal dialogue and self-talk patterns can significantly impact mental health and reveal cognitive distortions that may need addressing.",
  },
  {
    id: "future_thinking",
    question: "When thinking about your future, which pattern best describes your typical thoughts?",
    options: [
      { value: "3", label: "I feel hopeless and can't imagine things ever improving" },
      { value: "2", label: "I worry extensively about potential negative outcomes" },
      { value: "1", label: "I have mixed feelings but generally hope things will work out" },
      { value: "0", label: "I maintain an optimistic yet realistic outlook" },
    ],
    category: "depression",
    explanation:
      "Future-oriented thinking patterns can indicate depression (hopelessness) or anxiety (excessive worry about potential outcomes).",
  },

  // Social Interactions
  {
    id: "social_comfort",
    question: "In group social situations (like parties or meetings), how do you typically feel and behave?",
    options: [
      { value: "3", label: "I feel intense anxiety and often leave early or avoid going altogether" },
      { value: "2", label: "I feel very uncomfortable and stick to people I know well" },
      { value: "1", label: "I feel slightly nervous but can usually manage" },
      { value: "0", label: "I feel comfortable and can interact naturally" },
    ],
    category: "social",
    explanation:
      "Social anxiety can significantly impact quality of life and may be linked to deeper patterns of thinking about social evaluation and judgment.",
  },
  {
    id: "relationship_patterns",
    question:
      "In close relationships (friends, family, or romantic partners), how do you typically handle conflicts or disagreements?",
    options: [
      { value: "3", label: "I either become extremely hostile or completely shut down" },
      { value: "2", label: "I get very defensive or try to avoid the conflict entirely" },
      { value: "1", label: "I feel uncomfortable but try to work through it" },
      { value: "0", label: "I can usually discuss issues calmly and work toward solutions" },
    ],
    category: "interpersonal",
    explanation:
      "Relationship patterns can reveal attachment styles and emotional regulation capabilities in interpersonal contexts.",
  },

  // Behavioral Responses
  {
    id: "stress_response",
    question: "When under significant stress, which behaviors do you most commonly engage in?",
    options: [
      { value: "3", label: "I engage in harmful behaviors (excessive drinking, self-harm, etc.)" },
      { value: "2", label: "I withdraw completely and neglect responsibilities" },
      { value: "1", label: "I might procrastinate or avoid some situations" },
      { value: "0", label: "I use healthy coping strategies (exercise, talking to friends, etc.)" },
    ],
    category: "coping_mechanisms",
    explanation:
      "Stress response patterns can indicate the development of healthy or unhealthy coping mechanisms and potential risk behaviors.",
  },
  {
    id: "routine_changes",
    question:
      "How have your daily routines (sleep, eating, self-care) changed when you're going through difficult periods?",
    options: [
      { value: "3", label: "Severe disruption - completely abandon normal routines" },
      { value: "2", label: "Significant changes in sleep and eating patterns" },
      { value: "1", label: "Minor changes but maintain basic routines" },
      { value: "0", label: "Maintain consistent routines even during stress" },
    ],
    category: "functional_impact",
    explanation:
      "Changes in basic daily routines can be important indicators of mental health status and functional impairment.",
  },

  // Dissociation and Identity
  {
    id: "dissociation_experiences",
    question:
      "Have you experienced any of the following: feeling disconnected from your body, like you're watching yourself from outside, or like the world isn't real?",
    options: [
      { value: "3", label: "Frequently and intensely, often with memory gaps" },
      { value: "2", label: "Sometimes, especially during stress" },
      { value: "1", label: "Rarely, usually in specific situations" },
      { value: "0", label: "Never or very rarely" },
    ],
    category: "dissociation",
    explanation:
      "Dissociative experiences can range from normal stress responses to indicators of trauma or dissociative disorders.",
  },
  {
    id: "identity_consistency",
    question:
      "How consistent do you feel your sense of self (personality, preferences, behaviors) is across different situations and time?",
    options: [
      { value: "3", label: "I feel like a completely different person at different times" },
      { value: "2", label: "My sense of self often feels fragmented or unclear" },
      { value: "1", label: "I notice some changes but maintain a core sense of self" },
      { value: "0", label: "I feel consistently like myself across situations" },
    ],
    category: "identity",
    explanation:
      "Significant identity inconsistency might indicate personality-related concerns or dissociative experiences that warrant professional attention.",
  },

  // Trauma and Triggers
  {
    id: "trauma_responses",
    question: "When reminded of past difficult experiences, how do you typically react?",
    options: [
      { value: "3", label: "Intense physical and emotional reactions, flashbacks" },
      { value: "2", label: "Strong anxiety and need to avoid related situations" },
      { value: "1", label: "Mild discomfort but can usually cope" },
      { value: "0", label: "Can process memories without significant distress" },
    ],
    category: "trauma",
    explanation:
      "Trauma responses can manifest in various ways and understanding their intensity helps guide appropriate support and intervention.",
  },

  // Physical Symptoms
  {
    id: "physical_anxiety",
    question:
      "How often do you experience physical symptoms of anxiety (racing heart, sweating, trembling, chest tightness)?",
    options: [
      { value: "3", label: "Multiple times daily, often severe" },
      { value: "2", label: "Several times a week" },
      { value: "1", label: "Occasionally in stressful situations" },
      { value: "0", label: "Rarely or never" },
    ],
    category: "anxiety",
    explanation: "Physical anxiety symptoms can indicate the severity of anxiety and its impact on daily functioning.",
  },

  // Cognitive Function
  {
    id: "concentration",
    question:
      "When trying to focus on tasks (work, reading, conversations), how often do you experience difficulty concentrating?",
    options: [
      { value: "3", label: "Constantly, can barely maintain focus for short periods" },
      { value: "2", label: "Frequently, especially with complex tasks" },
      { value: "1", label: "Sometimes, but can usually refocus" },
      { value: "0", label: "Rarely have significant concentration issues" },
    ],
    category: "cognitive_function",
    explanation:
      "Concentration difficulties can be related to various conditions including anxiety, depression, ADHD, or stress.",
  },

  // Sleep Patterns
  {
    id: "sleep_quality",
    question: "How would you describe your sleep patterns over the past month?",
    options: [
      { value: "3", label: "Severe insomnia or excessive sleeping (12+ hours)" },
      { value: "2", label: "Frequent difficulty falling/staying asleep" },
      { value: "1", label: "Occasional sleep issues but generally manageable" },
      { value: "0", label: "Consistent, restful sleep patterns" },
    ],
    category: "sleep",
    explanation:
      "Sleep disturbances can both indicate and exacerbate mental health conditions, making it an important area to assess.",
  },

  // Risk Assessment
  {
    id: "self_harm",
    question: "Have you had thoughts about harming yourself or wishing you weren't alive?",
    options: [
      { value: "3", label: "Yes, with specific plans or recent attempts" },
      { value: "2", label: "Yes, frequently but no specific plans" },
      { value: "1", label: "Occasionally, passive thoughts only" },
      { value: "0", label: "No such thoughts" },
    ],
    category: "crisis",
    explanation:
      "This is a critical safety assessment question that helps determine the need for immediate intervention.",
  },
]

// Mental health condition thresholds and descriptions
const mentalHealthConditions = {
  emotional_regulation: {
    threshold: 4,
    name: "Emotional Regulation Difficulties",
    description: "Challenges in managing and responding to emotional experiences in healthy ways.",
    explanation:
      "Emotional regulation difficulties often develop from a combination of biological sensitivity and learned responses to emotions. Early experiences, trauma, or lack of emotional guidance can contribute to these challenges.",
    selfHelp: [
      "Practice mindfulness to observe emotions without immediate reaction",
      "Use the PLEASE skills: treat PhysicaL illness, balanced Eating, avoid mood-Altering substances, balanced Sleep, and get Exercise",
      "Create an emotion regulation toolkit with specific strategies for different emotions",
      "Keep an emotion diary to identify triggers and patterns",
      "Learn and practice deep breathing techniques",
    ],
    professionalHelp:
      "Dialectical Behavior Therapy (DBT) is particularly effective for emotional regulation difficulties. A mental health professional can help you develop specific skills and strategies tailored to your needs.",
  },
  cognitive_patterns: {
    threshold: 4,
    name: "Negative Thought Patterns",
    description: "Recurring patterns of negative or distorted thinking that impact mood and behavior.",
    explanation:
      "Negative thought patterns often develop as a way to make sense of difficult experiences or protect ourselves from hurt. While these patterns might have served a purpose initially, they can become self-reinforcing and harmful over time.",
    selfHelp: [
      "Practice identifying and challenging negative thoughts using thought records",
      "Look for evidence that both supports and contradicts negative thoughts",
      "Develop balanced alternative thoughts",
      "Practice self-compassion exercises",
      "Engage in activities that build mastery and positive experiences",
    ],
    professionalHelp:
      "Cognitive Behavioral Therapy (CBT) can help you identify and modify unhelpful thought patterns. A therapist can guide you through this process and help you develop more balanced thinking.",
  },
  interpersonal: {
    threshold: 4,
    name: "Interpersonal Relationship Patterns",
    description: "Difficulties in maintaining healthy relationships and managing interpersonal conflicts.",
    explanation:
      "Relationship patterns often reflect early attachment experiences and learned ways of relating to others. These patterns can be influenced by past relationships, trauma, or family dynamics.",
    selfHelp: [
      "Practice assertive communication using 'I' statements",
      "Set and maintain healthy boundaries",
      "Work on identifying your needs and expressing them clearly",
      "Practice active listening skills",
      "Learn to recognize and respect both your own and others' boundaries",
    ],
    professionalHelp:
      "Interpersonal Psychotherapy (IPT) or Schema Therapy can be particularly helpful for addressing relationship patterns. A therapist can help you understand and modify these patterns.",
  },
  depression: {
    threshold: 4,
    name: "Depression",
    description:
      "Depression is characterized by persistent feelings of sadness, loss of interest in activities, and decreased energy.",
    selfHelp: [
      "Establish a regular exercise routine, even if it's just a short daily walk",
      "Practice mindfulness meditation for 10-15 minutes daily",
      "Maintain a consistent sleep schedule",
      "Connect with supportive friends or family members regularly",
      "Consider keeping a gratitude journal to focus on positive aspects of life",
    ],
    professionalHelp:
      "If your symptoms persist for more than two weeks or significantly impact your daily functioning, please consider consulting a mental health professional for therapy options such as Cognitive Behavioral Therapy (CBT) or medication evaluation.",
    explanation:
      "Persistent sadness, loss of interest, and low energy are key indicators of depression.  It's important to note that depression can manifest differently in individuals.",
  },
  anxiety: {
    threshold: 4,
    name: "Anxiety",
    description:
      "Anxiety disorders involve excessive worry, fear, or nervousness that can interfere with daily activities.",
    selfHelp: [
      "Practice deep breathing exercises when feeling anxious (4-7-8 technique)",
      "Gradually expose yourself to situations that cause mild anxiety",
      "Limit caffeine and alcohol consumption",
      "Engage in regular physical activity",
      "Try progressive muscle relaxation techniques before bed",
    ],
    professionalHelp:
      "If anxiety significantly impacts your quality of life or ability to function, consider seeking help from a mental health professional who can provide therapy approaches like Cognitive Behavioral Therapy (CBT) or medication options.",
    explanation:
      "Excessive worry, fear, and nervousness that interfere with daily life are hallmarks of anxiety disorders.  These can range from generalized anxiety to specific phobias.",
  },
  ocd: {
    threshold: 4,
    name: "Obsessive-Compulsive Tendencies",
    description:
      "OCD involves unwanted, intrusive thoughts (obsessions) and repetitive behaviors or mental acts (compulsions) performed to reduce anxiety.",
    selfHelp: [
      "Practice mindfulness to observe intrusive thoughts without judgment",
      "Try exposure and response prevention techniques (gradually facing fears without performing compulsions)",
      "Establish a regular exercise routine",
      "Learn and practice stress management techniques",
      "Educate yourself about OCD through reputable resources",
    ],
    professionalHelp:
      "OCD typically requires professional treatment. Consider seeking help from a mental health professional specialized in OCD who can provide Exposure and Response Prevention (ERP) therapy, which is highly effective for OCD.",
    explanation:
      "Unwanted, intrusive thoughts (obsessions) and repetitive behaviors (compulsions) are characteristic of OCD.  The severity and impact on daily life vary greatly.",
  },
  trauma: {
    threshold: 4,
    name: "Trauma-Related Symptoms",
    description:
      "Trauma-related conditions can develop after experiencing or witnessing traumatic events, characterized by intrusive memories, avoidance, and heightened reactivity.",
    selfHelp: [
      "Practice grounding techniques when experiencing flashbacks (5-4-3-2-1 sensory exercise)",
      "Establish safety routines and identify safe spaces",
      "Engage in gentle physical activities like yoga or walking",
      "Connect with supportive people who understand trauma",
      "Practice self-compassion and patience with your healing process",
    ],
    professionalHelp:
      "Trauma processing typically requires professional support. Consider seeking help from a trauma-informed therapist who can provide evidence-based treatments like EMDR (Eye Movement Desensitization and Reprocessing) or trauma-focused CBT.",
    explanation:
      "Trauma-related symptoms can emerge after exposure to significant trauma.  These can include flashbacks, nightmares, avoidance behaviors, and emotional dysregulation.",
  },
  dissociation: {
    threshold: 4,
    name: "Dissociative Symptoms",
    description:
      "Dissociation involves feeling disconnected from your thoughts, feelings, surroundings, or identity. In severe cases, it may include conditions like Dissociative Identity Disorder (DID).",
    selfHelp: [
      "Practice grounding techniques using your five senses",
      "Maintain a consistent daily routine",
      "Keep a journal to track dissociative episodes and potential triggers",
      "Practice mindfulness to increase present-moment awareness",
      "Ensure adequate sleep and nutrition",
    ],
    professionalHelp:
      "Significant dissociative symptoms, especially those suggesting DID, require specialized professional treatment. Please consult with a mental health professional who specializes in dissociative disorders for proper assessment and treatment.",
    explanation:
      "Dissociation involves a detachment from reality, emotions, or sense of self.  It can range from mild depersonalization to severe dissociative disorders.",
  },
  social: {
    threshold: 4,
    name: "Social Anxiety",
    description: "Social anxiety involves intense fear of social situations and being judged or evaluated by others.",
    selfHelp: [
      "Start with small, manageable social interactions and gradually increase exposure",
      "Practice prepared responses for common social situations",
      "Focus on others rather than self-monitoring during conversations",
      "Challenge negative thoughts about social performance",
      "Practice relaxation techniques before social events",
    ],
    professionalHelp:
      "If social anxiety significantly limits your activities or causes substantial distress, consider seeking help from a mental health professional who can provide Cognitive Behavioral Therapy (CBT), which is highly effective for social anxiety.",
    explanation:
      "Intense fear and avoidance of social situations are key features of social anxiety.  This can significantly impact relationships and daily life.",
  },
  attention: {
    threshold: 4,
    name: "Attention Difficulties",
    description:
      "Attention difficulties may involve problems with focus, organization, completing tasks, and managing time effectively.",
    selfHelp: [
      "Break tasks into smaller, manageable steps",
      "Use organizational tools like planners or digital apps",
      "Create a structured environment with minimal distractions",
      "Implement the Pomodoro technique (25 minutes of focus followed by a 5-minute break)",
      "Engage in regular physical exercise",
    ],
    professionalHelp:
      "If attention difficulties significantly impact your daily functioning, consider seeking an evaluation from a mental health professional who can assess for conditions like ADHD and provide appropriate treatment options.",
    explanation:
      "Difficulties with focus, organization, and task completion can be indicative of various conditions, including ADHD and other attention-related challenges.",
  },
  crisis: {
    threshold: 1,
    name: "Crisis Support Needed",
    description: "Thoughts of self-harm or suicide require immediate attention and support.",
    selfHelp: [
      "Contact a crisis helpline immediately (National Suicide Prevention Lifeline: 988 or 1-800-273-8255)",
      "Remove access to potential means of harm",
      "Reach out to a trusted person who can stay with you",
      "Use distraction techniques to get through immediate crisis moments",
      "Create a safety plan with emergency contacts and coping strategies",
    ],
    professionalHelp:
      "Please seek immediate professional help. Contact a crisis helpline, go to your local emergency room, or call emergency services if you're experiencing thoughts of harming yourself. This requires urgent professional intervention.",
    explanation:
      "Thoughts of self-harm or suicide are serious and require immediate attention.  Please reach out for help immediately.",
  },
  coping_mechanisms: {
    threshold: 4,
    name: "Unhealthy Coping Mechanisms",
    description: "Use of maladaptive strategies to manage stress and difficult emotions.",
    explanation:
      "Unhealthy coping mechanisms can develop as ways to avoid or numb difficult emotions.  While they might provide temporary relief, they often lead to further problems.",
    selfHelp: [
      "Identify your unhealthy coping mechanisms",
      "Explore healthier alternatives (exercise, mindfulness, creative expression)",
      "Seek support from friends, family, or support groups",
      "Practice self-compassion",
      "Learn stress management techniques",
    ],
    professionalHelp:
      "Therapy can help you identify and replace unhealthy coping mechanisms with healthier strategies.  A therapist can provide guidance and support.",
  },
  functional_impact: {
    threshold: 4,
    name: "Functional Impairment",
    description: "Significant disruption in daily routines and ability to perform daily tasks.",
    explanation:
      "Functional impairment can be a significant indicator of mental health challenges.  It reflects the impact of mental health on daily life.",
    selfHelp: [
      "Break down tasks into smaller, manageable steps",
      "Prioritize essential tasks",
      "Seek support from others",
      "Create a structured daily routine",
      "Practice self-compassion",
    ],
    professionalHelp:
      "Therapy can help you develop strategies to manage functional impairment and improve daily functioning.  A therapist can provide support and guidance.",
  },
  identity: {
    threshold: 4,
    name: "Identity Disturbances",
    description: "Significant inconsistencies or fragmentation in sense of self.",
    explanation:
      "Identity disturbances can be related to trauma, dissociation, or other mental health conditions.  It's important to address these concerns with professional support.",
    selfHelp: [
      "Journaling to explore your sense of self",
      "Mindfulness practices to increase self-awareness",
      "Engaging in activities that bring you joy and a sense of purpose",
      "Connecting with supportive individuals",
      "Seeking professional guidance",
    ],
    professionalHelp:
      "Therapy, particularly trauma-informed therapy, can be very helpful in addressing identity disturbances.  A therapist can provide support and guidance.",
  },
  cognitive_function: {
    threshold: 4,
    name: "Cognitive Impairment",
    description: "Significant difficulties with concentration, memory, and other cognitive functions.",
    explanation:
      "Cognitive impairment can be a symptom of various mental health conditions or other underlying medical issues.  It's important to seek professional evaluation.",
    selfHelp: [
      "Minimize distractions",
      "Use organizational tools",
      "Break tasks into smaller steps",
      "Get sufficient sleep",
      "Engage in brain-boosting activities",
    ],
    professionalHelp:
      "A mental health professional can assess for underlying conditions and recommend appropriate treatment.  Neuropsychological testing may be helpful.",
  },
  sleep: {
    threshold: 4,
    name: "Sleep Disturbances",
    description: "Significant difficulties with sleep quality, quantity, or timing.",
    explanation:
      "Sleep disturbances can be a symptom of various mental health conditions or other underlying medical issues.  Addressing sleep problems is often crucial for improving overall mental health.",
    selfHelp: [
      "Establish a regular sleep schedule",
      "Create a relaxing bedtime routine",
      "Improve sleep hygiene",
      "Limit screen time before bed",
      "Consider cognitive behavioral therapy for insomnia (CBT-I)",
    ],
    professionalHelp:
      "A mental health professional or sleep specialist can assess for underlying conditions and recommend appropriate treatment.",
  },
}

// Initial greeting messages from the assistant
const initialMessages = [
  {
    role: "assistant",
    content:
      "Hello, I'm your mental health assessment assistant. I'm here to help you understand your mental wellbeing better through a structured assessment. Would you like to begin the assessment now?",
    options: [
      { value: "yes", label: "Yes, I'd like to start the assessment" },
      { value: "info", label: "Tell me more about how this works first" },
    ],
  },
]

type Message = {
  role: "user" | "assistant"
  content: string
  options?: Array<{ value: string; label: string }>
}

type AssessmentResults = {
  [key: string]: number
}

export default function MentalHealthChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1)
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)
  const [selectedOption, setSelectedOption] = useState("")
  const [results, setResults] = useState<AssessmentResults>({})
  const [showResults, setShowResults] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value)

    if (!assessmentStarted) {
      if (value === "yes") {
        startAssessment()
      } else if (value === "info") {
        provideInfo()
      }
      return
    }

    if (assessmentStarted && !assessmentCompleted) {
      // Record the answer
      const currentQuestion = assessmentQuestions[currentQuestionIndex]

      // Add user's selection to messages
      const selectedLabel = currentQuestion.options.find((opt) => opt.value === value)?.label
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: selectedLabel || value,
        },
      ])

      // Update results
      setResults((prev) => {
        const category = currentQuestion.category
        const score = Number.parseInt(value)
        return {
          ...prev,
          [category]: (prev[category] || 0) + score,
        }
      })

      // Move to next question or finish assessment
      if (currentQuestionIndex < assessmentQuestions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1)
          setSelectedOption("")
        }, 500)
      } else {
        finishAssessment()
      }
    }
  }

  const startAssessment = () => {
    setAssessmentStarted(true)
    setCurrentQuestionIndex(0)

    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Yes, I'd like to start the assessment" },
      {
        role: "assistant",
        content:
          "Great! I'll ask you a series of questions to better understand your mental wellbeing. Please select the option that best describes your experience. Remember, this is not a diagnostic tool, but it can help identify areas that might need attention.\n\nLet's begin with the first question:",
      },
    ])
  }

  const provideInfo = () => {
    setMessages((prev) => [
      ...prev,
      { role: "user", content: "Tell me more about how this works first" },
      {
        role: "assistant",
        content:
          "This assessment consists of 10 questions covering different aspects of mental health, including mood, anxiety, sleep, and more. For each question, you'll select the option that best describes your experience.\n\nAfter completing the assessment, I'll provide personalized feedback based on your responses, including potential areas of concern and helpful resources.\n\nImportant notes:\n• This is not a diagnostic tool and cannot replace professional evaluation\n• Your responses are not stored permanently\n• If you're in crisis, please contact emergency services or a crisis helpline immediately\n\nWould you like to begin the assessment now?",
        options: [
          { value: "yes", label: "Yes, I'd like to start the assessment" },
          { value: "no", label: "No, maybe later" },
        ],
      },
    ])
  }

  const finishAssessment = () => {
    setAssessmentCompleted(true)

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Thank you for completing the assessment. I'm conducting a comprehensive analysis of your responses to provide detailed feedback.",
      },
    ])

    setTimeout(() => {
      setShowResults(true)

      // Identify concerning areas
      const concerningAreas = Object.entries(results)
        .filter(([category, score]) => {
          const condition = mentalHealthConditions[category as keyof typeof mentalHealthConditions]
          return condition && score >= condition.threshold
        })
        .sort((a, b) => b[1] - a[1])

      // Crisis check
      const inCrisis = results.crisis && results.crisis >= mentalHealthConditions.crisis.threshold

      let resultMessage = ""

      if (inCrisis) {
        resultMessage =
          "Based on your responses, I'm concerned about your immediate safety and wellbeing. It's crucial that you speak with a mental health professional as soon as possible. "
        resultMessage +=
          "Please consider contacting a crisis helpline (988 or 1-800-273-8255 in the US) or going to your local emergency room if you're having thoughts of harming yourself.\n\n"
      }

      if (concerningAreas.length === 0 && !inCrisis) {
        resultMessage =
          "Based on your responses, you appear to be managing your mental health relatively well. However, mental health exists on a spectrum, and everyone can benefit from ongoing self-care and support.\n\n"
        resultMessage += "Key Strengths Identified:\n"
        resultMessage += "• Ability to regulate emotions effectively\n"
        resultMessage += "• Healthy coping mechanisms\n"
        resultMessage += "• Stable sleep patterns\n"
        resultMessage += "• Good social support system\n\n"
        resultMessage += "Recommendations for Maintaining Mental Wellness:\n"
        resultMessage += "• Continue practicing stress management techniques\n"
        resultMessage += "• Maintain regular sleep schedule\n"
        resultMessage += "• Engage in regular physical activity\n"
        resultMessage += "• Nurture social connections\n"
        resultMessage += "• Practice mindfulness or meditation\n\n"
        resultMessage += "Remember that mental health can fluctuate, and it's good to check in with yourself regularly."
      } else {
        resultMessage =
          "Based on your responses, I've identified several areas that may benefit from attention and support. Here's a detailed analysis:\n\n"

        concerningAreas.forEach(([category, score]) => {
          const condition = mentalHealthConditions[category as keyof typeof mentalHealthConditions]
          if (condition) {
            resultMessage += `**${condition.name}**\n`
            resultMessage += `${condition.description}\n\n`
            resultMessage += `Why this might be happening:\n${condition.explanation}\n\n`

            resultMessage += "Recommended self-help strategies:\n"
            condition.selfHelp.forEach((tip) => {
              resultMessage += `• ${tip}\n`
            })

            resultMessage += "\nProfessional support options:\n"
            resultMessage += `${condition.professionalHelp}\n\n`
          }
        })

        // Add pattern analysis
        resultMessage += "**Overall Patterns Observed:**\n"
        if (results.emotional_regulation && results.cognitive_patterns) {
          resultMessage +=
            "• Your responses suggest a connection between emotional reactions and thought patterns, which is common and treatable with appropriate support.\n"
        }
        if (results.trauma && results.anxiety) {
          resultMessage +=
            "• There appears to be a relationship between past experiences and current anxiety levels, which can be addressed through trauma-informed therapy.\n"
        }
        if (results.sleep && results.mood) {
          resultMessage +=
            "• Your sleep patterns may be influencing your mood, or vice versa. Addressing one often helps improve the other.\n"
        }

        resultMessage +=
          "\nRemember that these patterns are common and treatable with appropriate support. Many people experience similar challenges and go on to develop effective coping strategies with help."
      }

      // Add disclaimer
      resultMessage += "\n\n**Important Information About This Assessment:**\n"
      resultMessage += "• This evaluation is meant to provide insights and guidance, not to diagnose conditions\n"
      resultMessage += "• Mental health is complex and can change over time\n"
      resultMessage += "• Professional assessment is recommended for a complete evaluation\n"
      resultMessage += "• Many mental health challenges are highly treatable with appropriate support\n"

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: resultMessage,
          options: [
            { value: "restart", label: "Take the assessment again" },
            { value: "resources", label: "Find mental health resources" },
          ],
        },
      ])
    }, 2000)
  }

  const handleSend = () => {
    if (input.trim()) {
      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: input }])
      setInput("")
      setIsLoading(true)

      // Handle user message
      setTimeout(() => {
        let response =
          "I'm designed to provide a structured mental health assessment rather than an open conversation. Would you like to start the assessment or learn more about how it works?"

        if (assessmentCompleted) {
          response =
            "The assessment has been completed. Would you like to take it again or find mental health resources?"
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response,
            options: !assessmentStarted
              ? [
                  { value: "yes", label: "Start the assessment" },
                  { value: "info", label: "Learn more about the assessment" },
                ]
              : assessmentCompleted
                ? [
                    { value: "restart", label: "Take the assessment again" },
                    { value: "resources", label: "Find mental health resources" },
                  ]
                : undefined,
          },
        ])
        setIsLoading(false)
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const resetChat = () => {
    setMessages(initialMessages)
    setCurrentQuestionIndex(-1)
    setAssessmentStarted(false)
    setAssessmentCompleted(false)
    setSelectedOption("")
    setResults({})
    setShowResults(false)
  }

  const handleSpecialOptions = (value: string) => {
    if (value === "restart") {
      resetChat()
      setTimeout(() => {
        startAssessment()
      }, 500)
    } else if (value === "resources") {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "Find mental health resources" },
        {
          role: "assistant",
          content:
            "Here are some valuable mental health resources:\n\n" +
            "**Crisis Resources:**\n" +
            "• National Suicide Prevention Lifeline: 988 or 1-800-273-8255\n" +
            "• Crisis Text Line: Text HOME to 741741\n\n" +
            "**Find a Therapist:**\n" +
            "• Psychology Today Therapist Directory: https://www.psychologytoday.com/us/therapists\n" +
            "• American Psychological Association: https://locator.apa.org/\n\n" +
            "**Mental Health Organizations:**\n" +
            "• National Alliance on Mental Illness (NAMI): https://www.nami.org\n" +
            "• Mental Health America: https://www.mhanational.org\n" +
            "• Anxiety and Depression Association of America: https://adaa.org\n\n" +
            "**Self-Help Resources:**\n" +
            "• MindTools by Mental Health America: https://screening.mhanational.org/diy/\n" +
            "• Headspace (meditation app): https://www.headspace.com\n" +
            "• Calm (meditation app): https://www.calm.com\n\n" +
            "Would you like to take the assessment again?",
          options: [
            { value: "restart", label: "Take the assessment again" },
            { value: "no", label: "No, thank you" },
          ],
        },
      ])
    } else if (value === "no") {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "No, thank you" },
        {
          role: "assistant",
          content:
            "Thank you for using the mental health assessment tool. If you have concerns about your mental health, please don't hesitate to reach out to a qualified mental health professional. Take care of yourself, and remember that seeking help is a sign of strength.\n\nYou can restart the assessment at any time by clicking the reset button in the top right corner.",
        },
      ])
    }
  }

  return (
    <Card className="w-full shadow-lg border-slate-200 dark:border-slate-700 transition-colors duration-200">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 bg-primary/10">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI Assistant" />
            <AvatarFallback className="bg-primary/10 text-primary">AI</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">Mental Health Assessment</CardTitle>
            <CardDescription>Professional evaluation tool</CardDescription>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetChat} aria-label="Reset conversation">
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      {assessmentStarted && !assessmentCompleted && (
        <div className="px-4 py-2 border-b">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentQuestionIndex + 1) / assessmentQuestions.length) * 100)}%
            </span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / assessmentQuestions.length) * 100} className="h-2" />
        </div>
      )}

      {showResults && (
        <div className="px-4 py-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Assessment completed - Results below</span>
          </div>
        </div>
      )}

      <CardContent className="p-4 h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-3",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {message.content.split("\n").map((text, i) => {
                  // Check if the text starts with a bold marker
                  if (text.startsWith("**") && text.endsWith("**")) {
                    return (
                      <p key={i} className="font-bold">
                        {text.slice(2, -2)}
                      </p>
                    )
                  }
                  // Check if the text is a bullet point
                  else if (text.startsWith("• ")) {
                    return (
                      <p key={i} className="pl-2">
                        • {text.slice(2)}
                      </p>
                    )
                  }
                  // Regular text
                  else {
                    return text ? (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {text}
                      </p>
                    ) : (
                      <br key={i} />
                    )
                  }
                })}

                {message.options && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          if (["restart", "resources", "no"].includes(option.value)) {
                            handleSpecialOptions(option.value)
                          } else {
                            handleOptionSelect(option.value)
                          }
                        }}
                      >
                        {option.label}
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {assessmentStarted &&
            !assessmentCompleted &&
            currentQuestionIndex >= 0 &&
            currentQuestionIndex < assessmentQuestions.length && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg px-4 py-3 bg-muted">
                  <p className="font-medium">{assessmentQuestions[currentQuestionIndex].question}</p>
                  <div className="mt-3 space-y-2">
                    <RadioGroup value={selectedOption} onValueChange={handleOptionSelect}>
                      {assessmentQuestions[currentQuestionIndex].options.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50"
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex-grow cursor-pointer">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-3 bg-muted">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {(!assessmentStarted || assessmentCompleted) && (
        <CardFooter className="border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              id="message"
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      )}

      {results.crisis && results.crisis >= mentalHealthConditions.crisis.threshold && (
        <div className="px-4 pb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Crisis Resources</AlertTitle>
            <AlertDescription>
              If you're experiencing thoughts of harming yourself, please contact a crisis helpline immediately:
              <br />
              National Suicide Prevention Lifeline: 988 or 1-800-273-8255
              <br />
              Crisis Text Line: Text HOME to 741741
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  )
}

