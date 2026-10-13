---
id: "4MGyM8zv3QWof2LQgyPRiB"
title: "Vididoo"
slug: "vididoo"
description: "Edit your media files and easily create awesome content from your browser.\n"
publishDate: "2021-09-03T00:00-07:00"
status: "published"
heroImage: "5TMu5csc1LEfp5M6QAnwA4"
---

You can check this hacky experiment out [here](https://vididoo.vercel.app/).

I wanted to build a client side photo/video editing tool for the longest time.

Because everything would happen on your machine your files would never leave your browser and hit some random server. I thought that would be a cool feature for anyone concerned about privacy.

It also has the benefit of me not having to worry about managing servers. 😀

This idea remained an idea because the most popular tools for editing media files like OpenCV and ffmpeg are written in C.&#x20;

Till recently, you had to rely on Javascript-Only tools for a client-side focused web app. While you can do a lot with photo editing in Javascript the same is not true for videos which require some compute intensive operations from libraries like ffmpeg.

The game changer was when Web Assembly support was launched for the browser and, shortly after, someone created [ffmpeg-wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) (the ffmpeg package built in Web Assembly).

I used this to build out a few editing tasks I find myself routinely doing such as converting an mp4 video to a GIF or creating a lofi song with an image/GIF. This tool is still in its infancy and lacks support on some browsers like Safari but I am excited about its potential!

You can check this hacky experiment out [here](https://vididoo.vercel.app/).
