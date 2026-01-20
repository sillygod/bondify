/**
 * Shadowing Practice Sentences Data
 * Organized by daily life themes with difficulty levels
 */

export interface ShadowingSentence {
    id: string;
    category: string;
    sentence: string;
    translation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tips?: string;
}

export interface ShadowingCategory {
    id: string;
    name: string;
    icon: string;
    color: string;
    sentences: ShadowingSentence[];
}

export const shadowingCategories: ShadowingCategory[] = [
    {
        id: 'travel',
        name: 'Travel',
        icon: '✈️',
        color: 'from-blue-500 to-cyan-400',
        sentences: [
            {
                id: 'travel-1',
                category: 'travel',
                sentence: 'Could you tell me how to get to the train station?',
                translation: '請問您能告訴我怎麼去火車站嗎？',
                difficulty: 'easy',
                tips: 'Focus on the rising intonation at the end for politeness.',
            },
            {
                id: 'travel-2',
                category: 'travel',
                sentence: 'I would like to book a round-trip ticket to New York.',
                translation: '我想預訂一張到紐約的來回票。',
                difficulty: 'medium',
            },
            {
                id: 'travel-3',
                category: 'travel',
                sentence: 'Excuse me, where can I find the baggage claim area?',
                translation: '不好意思，請問行李提領區在哪裡？',
                difficulty: 'easy',
            },
            {
                id: 'travel-4',
                category: 'travel',
                sentence: 'Is there a direct flight available, or do I need to transfer?',
                translation: '請問有直飛的航班嗎，還是需要轉機？',
                difficulty: 'hard',
            },
            {
                id: 'travel-5',
                category: 'travel',
                sentence: 'Could you recommend some local attractions nearby?',
                translation: '您能推薦一些附近的當地景點嗎？',
                difficulty: 'medium',
            },
        ],
    },
    {
        id: 'restaurant',
        name: 'Restaurant',
        icon: '🍽️',
        color: 'from-orange-500 to-red-400',
        sentences: [
            {
                id: 'restaurant-1',
                category: 'restaurant',
                sentence: 'I would like to make a reservation for two, please.',
                translation: '我想預訂兩位，謝謝。',
                difficulty: 'easy',
            },
            {
                id: 'restaurant-2',
                category: 'restaurant',
                sentence: 'Could we get a table by the window?',
                translation: '我們可以坐靠窗的位置嗎？',
                difficulty: 'easy',
            },
            {
                id: 'restaurant-3',
                category: 'restaurant',
                sentence: 'What would you recommend from today\'s specials?',
                translation: '您推薦今天的特餐中的哪一道？',
                difficulty: 'medium',
            },
            {
                id: 'restaurant-4',
                category: 'restaurant',
                sentence: 'I\'m allergic to peanuts. Does this dish contain any nuts?',
                translation: '我對花生過敏。這道菜有堅果嗎？',
                difficulty: 'hard',
            },
            {
                id: 'restaurant-5',
                category: 'restaurant',
                sentence: 'Could I have the check, please?',
                translation: '請給我帳單，謝謝。',
                difficulty: 'easy',
            },
        ],
    },
    {
        id: 'shopping',
        name: 'Shopping',
        icon: '🛍️',
        color: 'from-pink-500 to-purple-400',
        sentences: [
            {
                id: 'shopping-1',
                category: 'shopping',
                sentence: 'Do you have this in a different size?',
                translation: '這個有其他尺寸嗎？',
                difficulty: 'easy',
            },
            {
                id: 'shopping-2',
                category: 'shopping',
                sentence: 'I\'m just looking around, thank you.',
                translation: '我只是隨便看看，謝謝。',
                difficulty: 'easy',
            },
            {
                id: 'shopping-3',
                category: 'shopping',
                sentence: 'Is there a discount if I buy more than one?',
                translation: '如果我買超過一個，有折扣嗎？',
                difficulty: 'medium',
            },
            {
                id: 'shopping-4',
                category: 'shopping',
                sentence: 'Can I get a refund if it doesn\'t fit?',
                translation: '如果不合適，我可以退款嗎？',
                difficulty: 'medium',
            },
            {
                id: 'shopping-5',
                category: 'shopping',
                sentence: 'Do you accept credit cards or is it cash only?',
                translation: '你們接受信用卡還是只收現金？',
                difficulty: 'medium',
            },
        ],
    },
    {
        id: 'business',
        name: 'Business',
        icon: '💼',
        color: 'from-slate-600 to-slate-400',
        sentences: [
            {
                id: 'business-1',
                category: 'business',
                sentence: 'Let me schedule a meeting for next Tuesday.',
                translation: '讓我安排下週二的會議。',
                difficulty: 'easy',
            },
            {
                id: 'business-2',
                category: 'business',
                sentence: 'Could you send me the report by end of day?',
                translation: '您能在今天下班前把報告發給我嗎？',
                difficulty: 'medium',
            },
            {
                id: 'business-3',
                category: 'business',
                sentence: 'I\'d like to discuss the project timeline with you.',
                translation: '我想和您討論一下專案時程。',
                difficulty: 'medium',
            },
            {
                id: 'business-4',
                category: 'business',
                sentence: 'Let\'s circle back to this topic in our next meeting.',
                translation: '我們在下次會議時再回來討論這個話題。',
                difficulty: 'hard',
            },
            {
                id: 'business-5',
                category: 'business',
                sentence: 'I appreciate your feedback on the proposal.',
                translation: '感謝您對提案的意見。',
                difficulty: 'easy',
            },
        ],
    },
    {
        id: 'social',
        name: 'Social',
        icon: '🎉',
        color: 'from-green-500 to-emerald-400',
        sentences: [
            {
                id: 'social-1',
                category: 'social',
                sentence: 'It was really nice meeting you today!',
                translation: '今天見到你真的很高興！',
                difficulty: 'easy',
            },
            {
                id: 'social-2',
                category: 'social',
                sentence: 'Would you like to grab a coffee sometime?',
                translation: '有空要不要一起喝杯咖啡？',
                difficulty: 'easy',
            },
            {
                id: 'social-3',
                category: 'social',
                sentence: 'I\'m sorry, but I already have plans this weekend.',
                translation: '抱歉，這週末我已經有安排了。',
                difficulty: 'medium',
            },
            {
                id: 'social-4',
                category: 'social',
                sentence: 'Congratulations on your promotion! You deserve it.',
                translation: '恭喜你升職！你值得擁有。',
                difficulty: 'medium',
            },
            {
                id: 'social-5',
                category: 'social',
                sentence: 'Thanks for inviting me. I had a wonderful time!',
                translation: '謝謝你的邀請，我玩得很開心！',
                difficulty: 'easy',
            },
        ],
    },
    {
        id: 'health',
        name: 'Health',
        icon: '🏥',
        color: 'from-red-500 to-rose-400',
        sentences: [
            {
                id: 'health-1',
                category: 'health',
                sentence: 'I\'ve been having headaches for the past few days.',
                translation: '我這幾天一直頭痛。',
                difficulty: 'medium',
            },
            {
                id: 'health-2',
                category: 'health',
                sentence: 'Do I need a prescription for this medication?',
                translation: '這種藥需要處方嗎？',
                difficulty: 'medium',
            },
            {
                id: 'health-3',
                category: 'health',
                sentence: 'I would like to schedule an appointment with the doctor.',
                translation: '我想預約醫生的門診。',
                difficulty: 'easy',
            },
            {
                id: 'health-4',
                category: 'health',
                sentence: 'Is there anything I should avoid eating while taking this?',
                translation: '服用這個藥物期間有什麼不能吃的嗎？',
                difficulty: 'hard',
            },
            {
                id: 'health-5',
                category: 'health',
                sentence: 'How many times a day should I take this medicine?',
                translation: '這個藥一天要吃幾次？',
                difficulty: 'easy',
            },
        ],
    },
];

/**
 * Get random sentences from a category
 */
export function getRandomSentences(categoryId: string, count: number = 5): ShadowingSentence[] {
    const category = shadowingCategories.find(c => c.id === categoryId);
    if (!category) return [];

    const shuffled = [...category.sentences].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get all categories for selection
 */
export function getAllCategories(): Omit<ShadowingCategory, 'sentences'>[] {
    return shadowingCategories.map(({ sentences, ...rest }) => rest);
}

/**
 * Calculate similarity score between two strings (0-100)
 */
export function calculateSimilarity(original: string, spoken: string): number {
    const normalizeText = (text: string) =>
        text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(Boolean);

    const originalWords = normalizeText(original);
    const spokenWords = normalizeText(spoken);

    if (originalWords.length === 0) return 0;

    let matchCount = 0;
    const usedIndices = new Set<number>();

    for (const originalWord of originalWords) {
        for (let i = 0; i < spokenWords.length; i++) {
            if (!usedIndices.has(i) && spokenWords[i] === originalWord) {
                matchCount++;
                usedIndices.add(i);
                break;
            }
        }
    }

    return Math.round((matchCount / originalWords.length) * 100);
}

/**
 * Get score grade based on percentage
 */
export function getScoreGrade(score: number): { grade: string; color: string; message: string } {
    if (score >= 90) return { grade: 'S', color: 'text-yellow-400', message: 'Perfect! Native-like!' };
    if (score >= 80) return { grade: 'A', color: 'text-green-400', message: 'Excellent work!' };
    if (score >= 70) return { grade: 'B', color: 'text-cyan-400', message: 'Good job!' };
    if (score >= 60) return { grade: 'C', color: 'text-blue-400', message: 'Keep practicing!' };
    return { grade: 'D', color: 'text-orange-400', message: 'Try again!' };
}
