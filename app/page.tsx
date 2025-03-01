import MentalHealthChatbot from "@/components/mental-health-chatbot"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-slate-800 dark:text-slate-100">
          Mental Health Assessment
        </h1>
        <p className="text-center mb-8 text-slate-600 dark:text-slate-300">
          A comprehensive evaluation tool to help understand your mental wellbeing
        </p>
        <MentalHealthChatbot />
      </div>
    </main>
  )
}

