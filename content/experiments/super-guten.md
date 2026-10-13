---
id: "47s6nqU0FJT2ZyYKgJCEWH"
title: "Super Guten"
slug: "super-guten"
description: "Find the best books from Project Gutenberg and read them in any style you want."
publishDate: "2024-08-12T00:00-07:00"
status: "published"
heroImage: "7MUgAIaVrwUar8VUVFJZQi"
---

You can check this hacky experiment out [here](https://superguten.vercel.app/).

Or watch the [loom video](https://www.loom.com/share/c4cf34d654a644ce932dc131ab15140e?sid=bb27ae1a-114b-4588-84ad-68212ae475f2).

Google had a Gemini API competition due this week with prizes up to a $100K and a DeLorean, so I had to participate. 😃&#x20;&#xA;&#xA;My entry was SuperGuten: a better more modern version of Project Gutenberg—a service that lets you find classic books that are copyright-free. It's an awesome resource but the website is pretty dated, and the search functionality is basic.
&#x20;
Gemini's current advantage is its long context capability (up to 2 million tokens) and its generous free tier (15 requests for Gemini Flash). So, I leveraged that for summarizing these huge books.&#xA;&#xA;And I built a modern Next.js website with a slick search feature that lets you find books based not just on keywords but on semantic meaning. You can search by book themes, author, period, etc.&#xA;&#xA;I first ran a script to generate structured summaries for around 4,000-5,000 of the most popular books on Project Gutenberg, sorted by download count.
Then, I indexed them in my database and created embeddings based on the summaries. This allowed me to create a hybrid search index based on important keywords (title, author) + embeddings, etc. Supabase has a great article on settings this up.&#xA;&#xA;Now I had a nice site with generated summaries. Cool. But I wanted to go further, so I added a style option where you could rewrite the book in a style you like. Think Shakespeare in tweet form or Gen Z slang. It's similar to those "Thug Notes" explanations of classic literature, if you've ever seen the YouTube series.&#xA;&#xA;I added some default styles to choose from, but you can input your own custom style as well. Try it out and let your imagination go wild!

You can check this hacky experiment out [here](https://superguten.vercel.app/).
