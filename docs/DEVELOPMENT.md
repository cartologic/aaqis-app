# Development Guide - AAQIS

## 🛠️ Development Validation Workflow

This project uses a comprehensive validation system to ensure consistent, high-quality Svelte 5 code. All tools are configured to work with **Bun** as the primary package manager.

### ⚡ Quick Commands

```bash
# Development server
bun dev

# Validation commands
bun run validate       # Check formatting, lint, and types
bun run validate:fix   # Auto-fix formatting and linting issues

# Individual commands
bun run format         # Auto-format all files
bun run format:check   # Check formatting without changes
bun run lint           # Run ESLint
bun run lint:fix       # Run ESLint with auto-fix
bun run check          # TypeScript type checking
bun run check:watch    # TypeScript type checking (watch mode)
```

### 🔧 Validation Stack

#### 1. **Prettier** - Code Formatting

- **Configuration**: `.prettierrc`
- **Purpose**: Consistent code formatting across all files
- **Svelte 5 Support**: ✅ Full support with `prettier-plugin-svelte`

```json
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 120,
	"plugins": ["prettier-plugin-svelte"]
}
```

#### 2. **ESLint** - Code Quality & Best Practices

- **Configuration**: `eslint.config.js` (ESLint 9 Flat Config)
- **Purpose**: Code quality, best practices, and Svelte 5 specific rules
- **Features**:
  - TypeScript support
  - Svelte 5 syntax validation
  - Basic accessibility checks
  - No unused variables/imports
  - Consistent coding patterns

#### 3. **svelte-check** - TypeScript Integration

- **Purpose**: TypeScript type checking for Svelte components
- **Configuration**: Uses `tsconfig.json`
- **Features**:
  - Full TypeScript support in `.svelte` files
  - Svelte 5 runes type checking
  - Import/export validation

### 📁 Configuration Files

```
.prettierrc          # Prettier configuration
.prettierignore      # Files to ignore for formatting
eslint.config.js     # ESLint 9 flat configuration
tsconfig.json        # TypeScript configuration
.vscode/settings.json # VS Code integration
.vscode/extensions.json # Recommended extensions
```

### 🔄 Development Workflow

#### During Development:

1. **Format on Save** (if using VS Code with recommended settings)
2. **Live Type Checking** with `bun run check:watch`
3. **Manual Validation** with `bun run validate`

#### Before Committing:

```bash
# Auto-fix all issues
bun run validate:fix

# Verify everything passes
bun run validate
```

### 🚨 Common Issues & Solutions

#### ESLint Errors

```bash
# Fix auto-fixable issues
bun run lint:fix

# Common issues:
# - Unused variables: Remove or prefix with _
# - Missing semicolons: Auto-fixed by Prettier
# - Case declarations: Wrap in blocks {}
```

#### TypeScript Errors

```bash
# Check types
bun run check

# Common issues:
# - Unknown error types: Use error instanceof Error checks
# - Missing types: Add proper type annotations
# - Svelte component props: Use proper typing
```

#### Formatting Issues

```bash
# Auto-format everything
bun run format

# Check formatting
bun run format:check
```

### 🎯 Svelte 5 Specific Guidelines

#### ✅ Do:

```svelte
<!-- Use runes for reactivity -->
<script>
	let count = $state(0);
	const doubled = $derived(count * 2);

	$effect(() => {
		console.log('Count changed:', count);
	});
</script>

<!-- Use proper event handlers -->
<button onclick={() => count++}> Click me </button>
```

#### ❌ Don't:

```svelte
<!-- Avoid old reactive syntax -->
<script>
	let count = 0;
	$: doubled = count * 2; // ❌ Use $derived instead

	$: {
		// ❌ Use $effect instead
		console.log(count);
	}
</script>
```

### 🔌 VS Code Integration

Install recommended extensions:

- **Svelte for VS Code** - Svelte language support
- **ESLint** - Linting integration
- **Prettier** - Formatting integration
- **TypeScript Hero** - TypeScript utilities
- **Tailwind CSS IntelliSense** - Tailwind support

### 📊 Performance Considerations

#### File Watching

```bash
# For large codebases, use selective watching
bun run check:watch  # Only watch TypeScript files
```

#### Linting Performance

- ESLint ignores `build/`, `.svelte-kit/`, and `node_modules/`
- Large files are automatically excluded
- Use `--quiet` flag for cleaner output

### 🧪 Testing Integration

```bash
# Run all validations (recommended before push)
bun run validate

# Individual validation steps
bun run format:check   # Fast formatting check
bun run lint           # ESLint validation
bun run check          # Type checking
```

### 🚀 Deployment Preparation

```bash
# Before deployment, ensure all validations pass
bun run validate

# Build the project
bun run build

# Preview production build
bun run preview
```

### 🔧 Customization

#### Adding New ESLint Rules

Edit `eslint.config.js`:

```javascript
rules: {
  'your-new-rule': 'error',
  // Add custom rules here
}
```

#### Modifying Prettier Settings

Edit `.prettierrc`:

```json
{
	"printWidth": 100, // Adjust line width
	"useTabs": false, // Use spaces instead
	"tabWidth": 2 // Set tab width
}
```

#### TypeScript Configuration

Edit `tsconfig.json` for compiler options:

```json
{
	"compilerOptions": {
		"strict": true, // Enable strict mode
		"noUnusedLocals": true // Catch unused variables
	}
}
```

---

## 🆘 Need Help?

- **ESLint Issues**: Check the [ESLint documentation](https://eslint.org/docs/latest/)
- **Svelte 5**: Visit [Svelte 5 documentation](https://svelte.dev/docs/svelte/overview)
- **TypeScript**: See [TypeScript handbook](https://www.typescriptlang.org/docs/)
- **Prettier**: Reference [Prettier configuration](https://prettier.io/docs/en/configuration.html)

---

**💡 Pro Tip**: Run `bun run validate:fix` regularly during development to catch and auto-fix issues early!
