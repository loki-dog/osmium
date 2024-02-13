import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import type { ExtendedRecordMap } from 'notion-types'

import type { PageMeta } from '@/lib/server/page'
import { useConfig } from '@/contexts/config'
import type { Props as SearchLayoutProps } from '@/layouts/blog/search'

import blogRoot from '../layouts/blog/root'
import blankRoot from '../layouts/blank/root'
import docsRoot from '../layouts/docs/root'
import { any } from 'prop-types'

const requireLayoutRoot = (require as any).context('../layouts', true, /^\.\/\w+\/root\.tsx$/)

const requireLayout = (require as any).context('../layouts', true, /^\.\/\w+\/(root|index|post|search)\.tsx$/, 'lazy')

const loadLayout = (name: string) => {
  const _require = (key: string) => requireLayout.keys().includes(key)
    ? requireLayout(key)
    : Promise.resolve(() => null)


// Step 2: Map names to the imported components to replicate the original behavior
const layouts :any = {
  blank: blankRoot,
  blog: blogRoot,
  docs: docsRoot,
  // ...add other layouts similarly
};

  // Step 3: Access the mappings, removing the `.default` part
const getRootComponentByName = (name: any) => {
  // Assuming `name` is something like 'layout1', 'layout2', ...
  const RootComponent = layouts[name]; // Note: No `.default` since we import default directly
  if (!RootComponent) {
    throw new Error(`No root component found for layout: ${name}`);
  }
  return RootComponent;
};

// Usage example
const Rooty = getRootComponentByName(name); // Use `Root` as a React component

  return {
    //Root: requireLayoutRoot(`./${name}/root.tsx`).default,
    Root: Rooty,
    Index: dynamic<Partial<{
      posts: PageMeta[]
      total: number
    }>>(() => _require(`./${name}/index.tsx`)),
    Post: dynamic<Partial<{
      post: PageMeta
      recordMap: ExtendedRecordMap
    }>>(() => _require(`./${name}/post.tsx`)),
    Search: dynamic<SearchLayoutProps>(() => _require(`./${name}/search.tsx`)),
  }
}

type Context = {
  layout: string
  setLayout: (layout: string) => void
  Layout: ReturnType<typeof loadLayout>
}

const LayoutContext = createContext<Context>(undefined as any)

export function LayoutProvider ({ children }: { children: ReactNode }) {
  const config = useConfig()
  const [layout, setLayout] = useState(config.layout)
  const Layout = loadLayout(layout)

  //console.log(Layout);

  return (
    <LayoutContext.Provider value={{ layout, setLayout, Layout }}>
      <Layout.Root>
        {children}
      </Layout.Root>
    </LayoutContext.Provider>
  )
}

export const useLayout = () => useContext(LayoutContext)
