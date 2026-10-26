# Aja Kimsey — workspace

This folder is Aja's personal space in the Wrapper project. Drafts, experiments and notes go here so they don't collide with anyone else's files.

- Branch: `aja-workspace`
- Anything that touches shared code outside this folder goes through a pull request.

## Prototype: `prototypes/youtube-page/`

A clickable demo of the Wrapper page. Open `index.html` in any browser. There's no setup, no server and no API keys.

### Flow

1. Pick a tab: **YouTube**, **Reddit** or **Marketplace**.
2. Type what you need (or click one of the "Try" examples) and press **Ask**.
3. Wrapper's agent asks what it's for, refuses entertainment ("not yet"), or approves. When it refuses, you can argue your case.
4. On approval you get a **session contract**: goal, where, time limit.
5. **Start session** shows one result, with no feed:
   - **YouTube:** one embedded video, no recommendations
   - **Reddit:** one thread, summarized, with the top replies
   - **Marketplace:** only listings that match the goal and budget
6. The session ends when you press **I'm done**, the timer runs out, or the video finishes. The result is removed from the page.

### Built-in examples

| Tab | Approved right away | Asks a question first | Refused |
|---|---|---|---|
| YouTube | "My Singer sewing needle broke and I need to replace it" | "photosynthesis video" (reply e.g. "for biology homework") | "funny cat videos" |
| Reddit | "Best ramen in Boston, I'm visiting this weekend" | "what thread should I use for jeans" | "see what's trending" |
| Marketplace | "I need a desk for my dorm under $100" | "used bike" (reply e.g. "to get to class") | "just browse" |

Other topics also work: changing a tire (YouTube), picking a college laptop (Reddit), and a mini fridge (Marketplace).

### Demo vs. real

- The agent is a set of simple keyword rules standing in for Claude.
- The YouTube videos are real YouTube videos. The Reddit threads and Marketplace listings are made-up examples, labeled that way on the page.
- In the real app, results would come from the YouTube Data API and the Reddit API, and Claude would judge each request. Facebook has no public Marketplace API, so the README's plan for Marketplace is a time-limited Screen Time unlock.
