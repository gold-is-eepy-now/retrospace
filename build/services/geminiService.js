const RETRO_STATUS_POOL = [
    'brb crying to my chemical romance T_T',
    'mall food court drama again lol',
    'rawr means i love you in dinosaur xD',
    'coding profile css at 2am no regrets',
    'currently away: mixtape + daydreaming',
];
const RETRO_COMMENT_POOL = [
    'omg iconic post!!',
    'this is sooo 2006 i love it',
    'rawr xD never change',
    'main character energy tbh',
    'stoppp this is too good',
];
const BLOG_INTROS = [
    'so today felt like a whole movie soundtrack',
    'okay i know nobody asked but i need to vent',
    'not to be dramatic but everything is glitter and chaos',
    'if life had a status song right now it would be loud',
];
const pick = (items) => items[Math.floor(Math.random() * items.length)];
export const generateRetroStatus = async () => {
    return pick(RETRO_STATUS_POOL);
};
export const generateBlogPost = async (topic) => {
    const safeTopic = (topic || 'my life').trim();
    return {
        title: `${safeTopic} // lyrics to my life`,
        content: `${pick(BLOG_INTROS)}...<br><br>been thinking about ${safeTopic} nonstop lately. i swear every song on my playlist gets it. anyway i'm trying to keep it together, customize my page, and pretend i'm totally fine lol. if you're reading this, leave a comment so i know i'm not yelling into the void. <3`,
    };
};
export const generateAIComment = async (_postContent) => {
    return pick(RETRO_COMMENT_POOL);
};
export const generateProfileBio = async () => {
    return "music is my life, html is my therapy, and the mall is my happy place <3";
};
