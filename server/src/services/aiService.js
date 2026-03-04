const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
require('dotenv').config();

// Initialize DeepSeek client via LangChain OpenAI adapter
const model = new ChatOpenAI({
    modelName: "deepseek-chat", // or "deepseek-reasoner"
    apiKey: process.env.DEEPSEEK_API_KEY,
    configuration: {
        baseURL: process.env.DEEPSEEK_BASE_URL,
    },
    temperature: 0.7,
});

const generatePlan = async (title, days = 10) => {
    try {
        const systemPrompt = `你是一个专业的学习计划规划师。请根据用户提供的目标（Title）和天数（Days），生成一个详细的学习计划，你需要将学习计划分成若干个10天的队列，通过这若干个10天队列，最终达成用户的学习目标。
    
    如果day大于30天，你仅需要提供前3个任务队列。
    
    注意每个队列之间要循序渐进，且每个队列包含一句该10天每日必做任务，以及三个阶段任务：入门期、进阶期、冲刺期。
        
        输出必须严格遵守以下 JSON 格式，不要包含 markdown 代码块标记：
        {
          "stages": {
              "baseTask": "一句话描述每日必修的基础任务（基石）",
              "stage1": [
                { "name": "入门期", "days": "Day 1-3", "task": "描述阶段1的核心任务" },
                { "name": "进阶期", "days": "Day 4-7", "task": "描述阶段1的核心任务" },
                { "name": "冲刺期", "days": "Day 8-10", "task": "描述阶段1的核心任务" }
              ],
              "stage2": [
                { "name": "入门期", "days": "Day 1-3", "task": "描述阶段2的核心任务" },
                { "name": "进阶期", "days": "Day 4-7", "task": "描述阶段2的核心任务" },
                { "name": "冲刺期", "days": "Day 8-10", "task": "描述阶段2的核心任务" }
              ],
              ...
            }
        }
        
        确保每个阶段的任务具体、可执行，并能帮助任务在对应时间内达成目标。`;

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
            stages: {
                baseTask: `坚持每日针对「${title}」的基础训练`,
                stage1: [
                    { name: "入门期", days: "Day 1-3", task: `了解${title}的核心概念与基础操作` },
                    { name: "进阶期", days: "Day 4-7", task: `强化${title}的专项技巧与实战演练` },
                    { name: "冲刺期", days: "Day 8-10", task: `完成${title}的综合项目与成果展示` }
                ],
                // If days > 10, add stage2 mock
                ...(days > 10 ? {
                    stage2: [
                        { name: "入门期", days: "Day 11-13", task: `深入${title}的高级特性` },
                        { name: "进阶期", days: "Day 14-17", task: `复杂场景下的${title}应用` },
                        { name: "冲刺期", days: "Day 18-20", task: `完成${title}的进阶项目挑战` }
                    ]
                } : {})
            }
        };
    }
};

module.exports = {
    generatePlan
};
