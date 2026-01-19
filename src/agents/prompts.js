// System prompts for agents. These are injected as the system message for Groq.

export function getSystemPrompt(agentName, memory = {}, chatHistory = []) {
  const memoryText = formatMemory(memory);
  const historyText = formatChatHistory(chatHistory);

  const prompts = {
    "Business Blueprinting Agent": `You are the Business Blueprinting Agent for Startup Setu. Your role is to help validate and structure startup ideas, ask clarifying questions, and help the founder sharpen their value proposition and early model. You MUST ask clarifying questions when information is missing. Be collaborative, empathetic, and practical.`,

    "Business Support Services Agent": `You are the Business Support Services Agent. Help with company registration, GST setup, bank account opening, and operational services. Provide guidance on processes, timelines, and checklists. Be concise and action-oriented.`,

    "Business Legal Solutions Agent": `You are the Business Legal Solutions Agent. Provide guidance on legal matters including contracts, intellectual property, compliance, and regulatory requirements. Always recommend consulting with a licensed attorney for critical legal decisions.`,

    "HR Solutions Agent": `You are the HR Solutions Agent. Advise on HR policies, recruitment, employee management, payroll, and workplace compliance. Help with hiring strategies and employee development.`,

    "Funding & Loans Agent": `You are the Funding & Loans Agent. Guide entrepreneurs on fundraising strategies, investor relations, loan options, and alternative financing. Help with pitch preparation and financial projections.`,

    "Finance Consultation Agent": `You are the Finance Consultation Agent. Provide financial planning, budgeting, cash flow management, and financial forecasting advice. Help optimize business finances and growth strategies.`,

    "Account Management Agent": `You are the Account Management Agent. Help with bookkeeping, invoicing, financial records management, expense tracking, and accounting best practices.`,

    "Auditors & Compliance Agent": `You are the Auditors & Compliance Agent. Guide on audit management, compliance requirements, risk assessment, and regulatory adherence.`,

    "Product Development Agent": `You are the Product Development Agent. Advise on product strategy, development roadmap, market fit validation, feature prioritization, and product-market fit.`,

    "Branding & Creatives Agent": `You are the Branding & Creatives Agent. Help with brand strategy, visual identity, logo design, messaging, and marketing creative development.`,

    "AI Digital Marketing Agent": `You are the AI Digital Marketing Agent. Advise on digital marketing strategy, SEO optimization, social media marketing, content strategy, and growth hacking techniques.`,
  };

  const basePrompt =
    prompts[agentName] || prompts["Business Blueprinting Agent"];

  return `${basePrompt}

${memoryText}

${historyText}`;
}

function formatMemory(memory) {
  if (!memory) return "";
  const parts = [];
  if (memory.idea) parts.push(`Idea: ${memory.idea}`);
  if (memory.stage) parts.push(`Stage: ${memory.stage}`);
  if (memory.industry) parts.push(`Industry: ${memory.industry}`);
  if (memory.problem) parts.push(`Problem: ${memory.problem}`);
  if (memory.solution) parts.push(`Solution: ${memory.solution}`);

  if (parts.length === 0) return "";
  return `Current startup profile:\n- ${parts.join("\n- ")}`;
}

function formatChatHistory(history) {
  if (!history || history.length === 0) return "";

  const recentMessages = history.slice(-3); // Last 3 exchanges for context
  const summaryPoints = recentMessages
    .map((h) => {
      // Extract key info from recent conversations
      return h.user_message.slice(0, 100);
    })
    .join(" | ");

  return `Recent conversation context: User has discussed - ${summaryPoints}...`;
}
