Welcome to your new TanStack Start app! 

# Getting Started

To run this application:

```bash
bun install
bun --bun run dev
```

# Building For Production

To build this application for production:

```bash
bun --bun run build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
bun --bun run test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `bun install @tailwindcss/vite tailwindcss -D`

## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:


```bash
bun --bun run lint
bun --bun run format
bun --bun run check
```


## Setting up Clerk

- Set the `VITE_CLERK_PUBLISHABLE_KEY` in your `.env.local`.


## Setting up Convex

- Set the `VITE_CONVEX_URL` and `CONVEX_DEPLOYMENT` environment variables in your `.env.local`. (Or run `bunx --bun convex init` to set them automatically.)
- Run `bunx --bun convex dev` to start the Convex server.


## Strapi CMS Integration

This add-on integrates Strapi CMS with your TanStack Start application using the official Strapi Client SDK.

### Features

- Article listing with search and pagination
- Article detail pages with dynamic block rendering
- Rich text, quotes, media, and image slider blocks
- Markdown content rendering with GitHub Flavored Markdown
- Responsive image handling with error fallbacks
- URL-based search and pagination (shareable/bookmarkable)
- Graceful error handling with helpful setup instructions

### Project Structure

```
parent/
├── client/                 # TanStack Start frontend (your project name)
│   ├── src/
│   │   ├── components/
│   │   │   ├── blocks/     # Block rendering components
│   │   │   ├── markdown-content.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── search.tsx
│   │   │   └── strapi-image.tsx
│   │   ├── data/
│   │   │   ├── loaders/    # Server functions
│   │   │   └── strapi-sdk.ts
│   │   ├── lib/
│   │   │   └── strapi-utils.ts
│   │   ├── routes/demo/
│   │   │   ├── strapi.tsx              # Articles list
│   │   │   └── strapi.$articleId.tsx   # Article detail
│   │   └── types/
│   │       └── strapi.ts
│   ├── .env.local
│   └── package.json
└── server/                 # Strapi CMS backend (create manually or use hosted Strapi)
    ├── src/api/            # Content types
    ├── config/             # Strapi configuration
    └── package.json
```

### Quick Start

Create your Strapi project separately (or use an existing hosted Strapi instance), then point this app to it with `VITE_STRAPI_URL`.

**1. Set up Strapi:**

Follow the Strapi quick-start guide to create a local project, or use your existing Strapi deployment:

- https://docs.strapi.io/dev-docs/quick-start

If you created a local Strapi project in a sibling `server` directory, continue with:

```bash
cd ../server
npm install    # or pnpm install / yarn install
```

**2. Start the Strapi server:**

```bash
npm run develop    # Starts at http://localhost:1337
```

**3. Create an admin account:**

Open http://localhost:1337/admin and create your first admin user.

**4. Create content:**

In the Strapi admin panel, go to Content Manager > Article and create some articles.

**5. Start your TanStack app (in another terminal):**

```bash
cd ../client   # or your project name
npm run dev    # Starts at http://localhost:3000
```

**6. View the demo:**

Navigate to http://localhost:3000/demo/strapi to see your articles.

### Environment Variables

The following environment variable is pre-configured in `.env.local`:

```bash
VITE_STRAPI_URL="http://localhost:1337"
```

For production, update this to your deployed Strapi URL.

### Demo Pages

| URL | Description |
|-----|-------------|
| `/demo/strapi` | Articles list with search and pagination |
| `/demo/strapi/:articleId` | Article detail with block rendering |

### Search and Pagination

- **Search**: Type in the search box to filter articles by title or description
- **Pagination**: Navigate between pages using the pagination controls
- **URL State**: Search and page are stored in the URL (`?query=term&page=2`)

### Block Types Supported

| Block | Component | Description |
|-------|-----------|-------------|
| `shared.rich-text` | RichText | Markdown content |
| `shared.quote` | Quote | Blockquote with author |
| `shared.media` | Media | Single image/video |
| `shared.slider` | Slider | Image gallery grid |

### Dependencies

| Package | Purpose |
|---------|---------|
| `@strapi/client` | Official Strapi SDK |
| `react-markdown` | Markdown rendering |
| `remark-gfm` | GitHub Flavored Markdown |
| `use-debounce` | Debounced search input |

### Running Both Servers

Open two terminal windows from the parent directory:

**Terminal 1 - Strapi:**
```bash
cd server && npm run develop
```

**Terminal 2 - TanStack Start:**
```bash
cd client && npm run dev   # or your project name
```

### Customization

**Change page size:**
Edit `src/data/loaders/articles.ts` and modify `PAGE_SIZE`.

**Add new block types:**
1. Create component in `src/components/blocks/`
2. Export from `src/components/blocks/index.ts`
3. Add case to `block-renderer.tsx` switch statement
4. Update populate in articles loader

**Add new content types:**
1. Add types to `src/types/strapi.ts`
2. Create loader in `src/data/loaders/`
3. Create route in `src/routes/demo/`

### Learn More

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi Client SDK](https://www.npmjs.com/package/@strapi/client)
- [Strapi Cloud Template Blog](https://github.com/strapi/strapi-cloud-template-blog)
- [TanStack Start Documentation](https://tanstack.com/start/latest)
- [TanStack Router Search Params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params)


# TanStack Chat Application

Am example chat application built with TanStack Start, TanStack Store, and Claude AI.

## .env Updates

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## ✨ Features

### AI Capabilities
- 🤖 Powered by Claude 3.5 Sonnet 
- 📝 Rich markdown formatting with syntax highlighting
- 🎯 Customizable system prompts for tailored AI behavior
- 🔄 Real-time message updates and streaming responses (coming soon)

### User Experience
- 🎨 Modern UI with Tailwind CSS and Lucide icons
- 🔍 Conversation management and history
- 🔐 Secure API key management
- 📋 Markdown rendering with code highlighting

### Technical Features
- 📦 Centralized state management with TanStack Store
- 🔌 Extensible architecture for multiple AI providers
- 🛠️ TypeScript for type safety

## Architecture

### Tech Stack
- **Frontend Framework**: TanStack Start
- **Routing**: TanStack Router
- **State Management**: TanStack Store
- **Styling**: Tailwind CSS
- **AI Integration**: Anthropic's Claude API

## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpm dlx shadcn@latest add button
```


## T3Env

- You can use T3Env to add type safety to your environment variables.
- Add Environment variables to the `src/env.mjs` file.
- Use the environment variables in your code.

### Usage

```ts
import { env } from "#/env";

console.log(env.VITE_APP_TITLE);
```





## Setting up Better Auth

1. Generate and set the `BETTER_AUTH_SECRET` environment variable in your `.env.local`:

   ```bash
   bunx --bun @better-auth/cli secret
   ```

2. Visit the [Better Auth documentation](https://www.better-auth.com) to unlock the full potential of authentication in your app.

### Adding a Database (Optional)

Better Auth can work in stateless mode, but to persist user data, add a database:

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  // ... rest of config
});
```

Then run migrations:

```bash
bunx --bun @better-auth/cli migrate
```


## Setting up PostHog

1. Create a PostHog account at [posthog.com](https://posthog.com)
2. Get your Project API Key from [Project Settings](https://app.posthog.com/project/settings)
3. Set `VITE_POSTHOG_KEY` in your `.env.local`

### Optional Configuration

- `VITE_POSTHOG_HOST` - Set this if you're using PostHog Cloud EU (`https://eu.i.posthog.com`) or self-hosting


# Apollo Client Integration

This add-on integrates Apollo Client with TanStack Start to provide modern streaming SSR support for GraphQL data fetching.

## Dependencies

The following packages are automatically installed:

- `@apollo/client` - Apollo Client core
- `@apollo/client-integration-tanstack-start` - TanStack Start integration
- `graphql` - GraphQL implementation

## Configuration

### 1. GraphQL Endpoint

Configure your GraphQL API endpoint in `src/router.tsx`:

```tsx
// Configure Apollo Client
const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'https://your-graphql-api.example.com/graphql', // Update this!
  }),
})
```

You can use environment variables by creating a `.env.local` file:

```bash
VITE_GRAPHQL_ENDPOINT=https://your-api.com/graphql
```

The default configuration already uses this pattern:

```tsx
uri: import.meta.env.VITE_GRAPHQL_ENDPOINT ||
  'https://your-graphql-api.example.com/graphql'
```

## Usage Patterns

### Pattern 1: Loader with preloadQuery (Recommended for SSR)

Use `preloadQuery` in route loaders for optimal streaming SSR performance:

```tsx
import { gql, TypedDocumentNode } from '@apollo/client'
import { useReadQuery } from '@apollo/client/react'
import { createFileRoute } from '@tanstack/react-router'

const MY_QUERY: TypedDocumentNode<{
  posts: { id: string; title: string; content: string }[]
}> = gql`
  query GetData {
    posts {
      id
      title
      content
    }
  }
`

export const Route = createFileRoute('/my-route')({
  component: RouteComponent,
  loader: ({ context: { preloadQuery } }) => {
    const queryRef = preloadQuery(MY_QUERY, {
      variables: {},
    })
    return { queryRef }
  },
})

function RouteComponent() {
  const { queryRef } = Route.useLoaderData()
  const { data } = useReadQuery(queryRef)

  return <div>{/* render your data */}</div>
}
```

### Pattern 2: useSuspenseQuery

Use `useSuspenseQuery` directly in components with automatic suspense support:

```tsx
import { gql, TypedDocumentNode } from '@apollo/client'
import { useSuspenseQuery } from '@apollo/client/react'
import { createFileRoute } from '@tanstack/react-router'

const MY_QUERY: TypedDocumentNode<{
  posts: { id: string; title: string }[]
}> = gql`
  query GetData {
    posts {
      id
      title
    }
  }
`

export const Route = createFileRoute('/my-route')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useSuspenseQuery(MY_QUERY)

  return <div>{/* render your data */}</div>
}
```

### Pattern 3: Manual Refetching

```tsx
import { useQueryRefHandlers, useReadQuery } from '@apollo/client/react'

function MyComponent() {
  const { queryRef } = Route.useLoaderData()
  const { refetch } = useQueryRefHandlers(queryRef)
  const { data } = useReadQuery(queryRef)

  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      {/* render data */}
    </div>
  )
}
```

## Important Notes

### SSR Optimization

The integration automatically handles:

- Query deduplication across server and client
- Streaming SSR with `@defer` directive support
- Proper cache hydration

## Learn More

- [Apollo Client Documentation](https://www.apollographql.com/docs/react)
- [@apollo/client-integration-tanstack-start](https://www.npmjs.com/package/@apollo/client-integration-tanstack-start)

## Demo

Visit `/demo/apollo-client` in your application to see a working example of Apollo Client integration.


# Resume Example

A professional resume template built with TanStack Start and content-collections for Netlify deployment.

## Features

- **Content Collections**: Work experience and education managed as markdown files
- **Skills Filter**: Interactive sidebar to filter jobs by skills/technologies
- **Beautiful UI**: Modern design with shadcn/ui components
- **SSR Ready**: Full server-side rendering with TanStack Start

## Project Structure

```
├── content/
│   ├── jobs/              # Work experience entries
│   └── education/         # Education entries
├── src/
│   ├── components/
│   │   └── ui/            # Shadcn UI components
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── hover-card.tsx
│   │       └── separator.tsx
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   └── routes/
│       ├── __root.tsx     # Root layout
│       └── index.tsx      # Resume page
└── public/
    └── headshot-on-white.jpg
```

## Adding Work Experience

Create a new markdown file in `content/jobs/` with the following frontmatter:

```markdown
---
jobTitle: Your Job Title
company: Company Name
location: City, State
startDate: 2024-01-01
endDate: 2024-12-31  # Optional - omit for current position
summary: Brief summary of your role
tags:
  - React
  - TypeScript
  - Web Development
---

Detailed description of your responsibilities and achievements...
```

## Adding Education

Create a new markdown file in `content/education/`:

```markdown
---
school: School Name
summary: Degree or Program Name
startDate: 2020-01-01
endDate: 2024-01-01
tags:
  - Relevant
  - Skills
---

Details about your education...
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```



## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')
  
  useEffect(() => {
    getServerTime().then(setTime)
  }, [])
  
  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
