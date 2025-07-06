# create-express-it

🚀 A minimal CLI tool to scaffold the [express-it](https://github.com/shaishabcoding/express-it) boilerplate project.

---

## ✨ Features

- ✅ Clones the latest version of `express-it` boilerplate from GitHub
- 🧹 Automatically removes `.git` folder after clone
- 📦 Optionally installs dependencies
- 🚀 Optionally runs the project (`npm run dev`)
- 🔧 Built with TypeScript and Node.js
- ⚡ Provides two CLI commands: `create-express-it` and its shortcut `ex-it`

---

## 🛠️ Installation

You don't need to install globally. Use it with `npx`:

```bash
npx create-express-it <project-name>
# or using shortcut:
npx ex-it <project-name>
```

Or install globally:

```bash
npm install -g create-express-it
# after install run
create-express-it <project-name>
# or using shortcut:
ex-it <project-name>
```

---

## 📦 Usage

```bash
npx create-express-it my-app
# or
npx ex-it my-app
```

Then follow the interactive prompts:

```
📦 Do you want to install dependencies? (y/N)
🚀 Do you want to run the project? (y/N)
```

---

## 📁 Result

After setup, you'll have:

```
my-app/
├── src/
├── package.json
├── tsconfig.json
└── ...
```

---

## 🔧 Requirements

- Node.js v14+
- Git installed and available in your shell

---

## 💡 Author

**Shaishab** — _MERN Stack Developer_

- GitHub: [@shaishabcoding](https://github.com/shaishabcoding)
- Project Template Repo: [express-it](https://github.com/shaishabcoding/express-it)

---

## 📝 License

MIT License © 2025 [@shaishabcoding](https://github.com/shaishabcoding)
