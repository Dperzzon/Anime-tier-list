# 🏆 My Anime Tier List

A clean, serverless, drag-and-drop anime ranking web application. Easily search for anime, add them to your unranked pool, and drag them into your numbered top list. The list is saved to the cloud so you can share it with friends, while edits are safely protected by an API key.

## ✨ Features
- **Smart Search & Add**: Integrates with the [Jikan API](https://jikan.moe/) (MyAnimeList database) to automatically fetch official anime titles and cover images.
- **Drag & Drop Ranking**: Smooth and intuitive sorting using [SortableJS](https://sortablejs.github.io/Sortable/). Automatically numbers your top list.
- **Cloud Saving**: Uses [JSONBin.io](https://jsonbin.io/) as a lightweight, serverless database. Anyone can view the list, but only the admin can edit it.
- **Admin Mode**: Edits are locked behind a secure API key prompt. Once logged in, you can add, delete, write comments, and rearrange series.
- **Filter/Search**: Quickly find specific anime in your active list using the built-in search bar.

## 🚀 Live Demo
[Put the link to your GitHub Pages site here, e.g., https://your-username.github.io/anime-toplist]

## 🛠️ Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Drag & Drop**: SortableJS
- **Anime Data**: Jikan API v4
- **Database**: JSONBin.io

## ⚙️ Setup & Installation
Want to fork this project and make your own tier list? Follow these steps:

### 1. Database Setup (JSONBin)
1. Create a free account at [JSONBin.io](https://jsonbin.io/).
2. Create a new "Bin" with the following JSON structure:
   ```json
   {
     "ranked": [],
     "pool": []
   }# Anime-tier-list
