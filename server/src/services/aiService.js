const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
require('dotenv').config();

// Initialize DeepSeek client via LangChain OpenAI adapter
const model = new ChatOpenAI({
    modelName: "deepseek-chat", // or "deepseek-reasoner"
    openAIApiKey: process.env.DEEPSEEK_API_KEY,
    configuration: {
        baseURL: process.env.DEEPSEEK_BASE_URL,
    },
    temperature: 0.7,
});

const generatePlan = async (title, days = 10) => {
    try {
        const systemPrompt = `你是一个专业的学习计划规划师。请根据用户提供的目标（Title）和天数（Days），生成一个详细的学习计划。
        
        输出必须严格遵守以下 JSON 格式，不要包含 markdown 代码块标记：
        {
            "baseTask": "一句话描述每日必修的基础任务（基石）",
            "stages": [
                { "name": "入门期", "days": "Day 1-3", "task": "描述该阶段的核心任务" },
                { "name": "进阶期", "days": "Day 4-7", "task": "描述该阶段的核心任务" },
                { "name": "冲刺期", "days": "Day 8-${days}", "task": "描述该阶段的核心任务" }
            ]
        }
        
        确保任务具体、可执行，适合初学者。`;

        const userPrompt = `目标：${title}，时长：${days}天。`;

        const messages = [
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ];

        const response = await model.invoke(messages);
        
        // Clean up response content if it contains markdown code blocks
        let content = response.content;
        if (content.startsWith('```json')) {
            content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (content.startsWith('```')) {
             content = content.replace(/^```\n/, '').replace(/\n```$/, '');
        }

        return JSON.parse(content);
    } catch (error) {
        console.error("AI Generation Error:", error);
        // Fallback mock data in case of AI failure
        return {
            baseTask: `坚持每日针对「${title}」的基础训练`,
            stages: [
                { name: "入门期", days: "Day 1-3", "task": `了解${title}的核心概念与基础操作` },
                { name: "进阶期", "days": "Day 4-7", "task": `强化${title}的专项技巧与实战演练` },
                { name: "冲刺期", "days": `Day 8-${days}`, "task": `完成${title}的综合项目与成果展示` }
            ]
        };
    }
};

module.exports = {
    generatePlan
};
