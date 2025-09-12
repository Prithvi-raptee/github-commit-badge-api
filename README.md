# 🏆 GitHub Commit Badge API

A powerful, customizable API that generates beautiful SVG badges displaying GitHub commit activity with advanced theming, animations, and visual enhancements.

## ✨ Features

- 📊 **Multiple Time Periods** - Week, month, quarter, half-year, year
- 🎨 **9 Beautiful Themes** - Dark, gradient, neon, and more
- 🌈 **10 Custom Colors** - Red, green, blue, purple, and more
- 🎭 **4 Badge Styles** - Flat, flat-square, plastic, for-the-badge
- ⚡ **3 Animation Types** - Pulse, glow, slide effects
- 🚀 **8 Icons** - Fire, rocket, trophy, and more emojis
- 📈 **Mini Sparklines** - Embedded commit trend charts
- ⚡ **Smart Caching** - 6-hour cache for optimal performance
- 🛡️ **Error Resilience** - Graceful fallback and error handling

## 🚀 Quick Start

### Basic Usage
```
https://github-commit-badge-api.vercel.app/commits?account=USERNAME
```

### With Custom Styling
```
https://github-commit-badge-api.vercel.app/commits?account=USERNAME&theme=dark&icon=fire&animated=pulse
```

## 📋 API Reference

### Base URL
```
https://github-commit-badge-api.vercel.app/
```

### Endpoint
```
GET /commits
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `account` | string | **required** | GitHub username |
| `period` | string | `month` | Time period: `week`, `month`, `quarter`, `half`, `year` |
| `theme` | string | `default` | Badge theme (see themes below) |
| `color` | string | - | Custom color (see colors below) |
| `style` | string | `flat` | Badge style (see styles below) |
| `animated` | string | - | Animation type: `pulse`, `glow`, `slide` |
| `icon` | string | - | Icon to display (see icons below) |
| `sparkline` | boolean | `false` | Show mini trend chart (`true`/`false`) |
| `border` | boolean | `false` | Add border to badge (`true`/`false`) |

## 🎨 Themes

### Available Themes

| Theme | Preview | Description |
|-------|---------|-------------|
| `default` | ![Default](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=default) | Classic blue and gray |
| `dark` | ![Dark](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=dark) | GitHub dark mode inspired |
| `github-dark` | ![GitHub Dark](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=github-dark) | Official GitHub dark colors |
| `dracula` | ![Dracula](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=dracula) | Popular Dracula theme |
| `monokai` | ![Monokai](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=monokai) | Monokai syntax theme |
| `gradient` | ![Gradient](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=gradient) | Beautiful gradient backgrounds |
| `ocean` | ![Ocean](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=ocean) | Ocean blue theme |
| `sunset` | ![Sunset](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=sunset) | Warm sunset colors |
| `neon` | ![Neon](https://github-commit-badge-api.vercel.app//commits?account=octocat&theme=neon) | Neon green cyberpunk |

## 🌈 Colors

Override any theme's value color with custom colors:

| Color | Preview | Hex |
|-------|---------|-----|
| `red` | ![Red](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=red) | #e53e3e |
| `green` | ![Green](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=green) | #38a169 |
| `blue` | ![Blue](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=blue) | #3182ce |
| `yellow` | ![Yellow](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=yellow) | #d69e2e |
| `purple` | ![Purple](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=purple) | #805ad5 |
| `pink` | ![Pink](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=pink) | #d53f8c |
| `orange` | ![Orange](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=orange) | #dd6b20 |
| `teal` | ![Teal](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=teal) | #319795 |
| `cyan` | ![Cyan](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=cyan) | #0bc5ea |
| `gray` | ![Gray](https://github-commit-badge-api.vercel.app//commits?account=octocat&color=gray) | #718096 |

## 🎭 Badge Styles

| Style | Preview | Description |
|-------|---------|-------------|
| `flat` | ![Flat](https://github-commit-badge-api.vercel.app//commits?account=octocat&style=flat) | Clean, flat design (default) |
| `flat-square` | ![Flat Square](https://github-commit-badge-api.vercel.app//commits?account=octocat&style=flat-square) | Sharp, square corners |
| `plastic` | ![Plastic](https://github-commit-badge-api.vercel.app//commits?account=octocat&style=plastic) | 3D plastic look with shadows |
| `for-the-badge` | ![For The Badge](https://github-commit-badge-api.vercel.app//commits?account=octocat&style=for-the-badge) | Large, bold uppercase style |

## ⚡ Animations

Add life to your badges with CSS animations:

| Animation | Preview | Description |
|-----------|---------|-------------|
| `pulse` | ![Pulse](https://github-commit-badge-api.vercel.app//commits?account=octocat&animated=pulse) | Gentle pulsing effect |
| `glow` | ![Glow](https://github-commit-badge-api.vercel.app//commits?account=octocat&animated=glow) | Glowing shadow effect |
| `slide` | ![Slide](https://github-commit-badge-api.vercel.app//commits?account=octocat&animated=slide) | Subtle sliding animation |

## 🚀 Icons

Add personality with emoji icons:

| Icon | Emoji | Usage |
|------|-------|-------|
| `fire` | 🔥 | `?icon=fire` |
| `star` | ⭐ | `?icon=star` |
| `rocket` | 🚀 | `?icon=rocket` |
| `code` | 💻 | `?icon=code` |
| `chart` | 📈 | `?icon=chart` |
| `commit` | 📝 | `?icon=commit` |
| `calendar` | 📅 | `?icon=calendar` |
| `trophy` | 🏆 | `?icon=trophy` |

## 📈 Sparklines

Show commit trends with mini charts embedded in your badges:

```
?sparkline=true
```

![Sparkline Example](https://github-commit-badge-api.vercel.app//commits?account=octocat&sparkline=true&theme=dark)

Sparklines display the last 7 days of commit activity as a small line chart within the badge.

## 🔧 Usage Examples

### Basic Examples

```markdown
<!-- Simple daily commits -->
![Daily Commits](https://github-commit-badge-api.vercel.app/commits?account=octocat)

<!-- Weekly commits -->
![Weekly Commits](https://github-commit-badge-api.vercel.app/commits?account=octocat&period=week)

<!-- Yearly commits -->
![Yearly Commits](https://github-commit-badge-api.vercel.app/commits?account=octocat&period=year)
```

### Themed Examples

```markdown
<!-- Dark theme with fire icon -->
![Commits](https://github-commit-badge-api.vercel.app/commits?account=octocat&theme=dark&icon=fire)

<!-- Neon theme with pulse animation -->
![Commits](https://github-commit-badge-api.vercel.app/commits?account=octocat&theme=neon&animated=pulse)

<!-- Gradient with sparkline -->
![Commits](https://github-commit-badge-api.vercel.app/commits?account=octocat&theme=gradient&sparkline=true)
```

### Advanced Examples

```markdown
<!-- For-the-badge style with trophy -->
![Commits](https://github-commit-badge-api.vercel.app/commits?account=octocat&style=for-the-badge&icon=trophy&color=purple)

<!-- Complete customization -->
![Commits](https://github-commit-badge-api.vercel.app/commits?account=octocat&theme=dracula&animated=glow&sparkline=true&icon=rocket&period=quarter)
```

### HTML Usage

```html
<img src="https://github-commit-badge-api.vercel.app/commits?account=octocat&theme=dark&animated=pulse" 
     alt="Daily Commits" 
     title="Average daily commits">
```

### Complete Dashboard

Create a comprehensive activity dashboard:

```markdown
# 📊 My GitHub Activity

| Period | Badge |
|--------|-------|
| Weekly | ![Weekly](https://github-commit-badge-api.vercel.app//commits?account=YOUR_USERNAME&period=week&theme=dark&icon=calendar) |
| Monthly | ![Monthly](https://github-commit-badge-api.vercel.app//commits?account=YOUR_USERNAME&period=month&theme=gradient&icon=chart) |
| Quarterly | ![Quarterly](https://github-commit-badge-api.vercel.app//commits?account=YOUR_USERNAME&period=quarter&theme=ocean&icon=rocket) |
| Yearly | ![Yearly](https://github-commit-badge-api.vercel.app//commits?account=YOUR_USERNAME&period=year&theme=sunset&icon=trophy) |

## 🔥 Trending Activity
![Sparkline](https://github-commit-badge-api.vercel.app//commits?account=YOUR_USERNAME&theme=neon&sparkline=true&animated=glow&style=for-the-badge)
```

> **💡 Remember:** Replace `YOUR_USERNAME` with your actual GitHub username in all examples!

## 🚀 Deployment

### Deploy to Vercel

1. Clone the repository
2. Set up environment variables:
   ```bash
   GITHUB_TOKEN=your_github_token
   ```
3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | Yes |
| `PORT` | Server port (default: 3000) | No |

### GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `read:user` and `public_repo` scopes
3. Add it to your Vercel environment variables

## ⚡ Performance

- **Smart Caching**: 6-hour cache TTL reduces API calls
- **Browser Caching**: 6-hour browser cache for optimal loading
- **Error Resilience**: Serves stale cache during API failures
- **Optimized SVG**: Lightweight, scalable vector graphics

## 🔒 Rate Limits

- Respects GitHub API rate limits (5000 requests/hour for authenticated requests)
- Intelligent caching reduces API usage
- Graceful handling of rate limit exceeded scenarios

## 🐛 Error Handling

The API handles various error scenarios gracefully:

- **User not found**: Shows "user not found" error badge
- **API errors**: Shows "api error" badge
- **Server errors**: Shows "server error" badge
- **Invalid parameters**: Falls back to defaults

Error badges inherit your theme and styling preferences.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub GraphQL API for commit data
- Shields.io for badge design inspiration
- Vercel for hosting platform

## 💡 Feature Requests

Have ideas for new features? Open an issue with the `enhancement` label!

Possible future features:
- More themes and color schemes
- Additional chart types
- Streak tracking
- Repository-specific badges
- Team/organization badges

---

<div align="center">

**[🌟 Star this repo](https://github.com/yourusername/github-commit-badge-api)** if you find it useful!

Made with ❤️ for the GitHub community

</div>