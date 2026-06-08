import { ref, onMounted, type Ref } from 'vue'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01'

function buildUrl(query: string, params?: Record<string, unknown>): string {
  const base = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`
  const url = new URL(base)
  url.searchParams.set('query', query)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(`$${key}`, JSON.stringify(value))
    }
  }
  return url.toString()
}

/**
 * Reactive composable for fetching data from Sanity via the CDN API on the
 * CLIENT. Fetch fires in onMounted, so it never runs during SSG prerender —
 * useful for non-critical data (e.g. header/footer settings) where seeing
 * default values briefly during hydration is acceptable.
 *
 * For page-level content that needs to be in the prerendered HTML (SEO,
 * social previews, no-JS visibility), use `useSanityAsync` instead — that
 * awaits inside script-setup via Suspense and bakes the data into SSG output.
 *
 * Returns null without fetching if VITE_SANITY_PROJECT_ID is not set,
 * allowing static defaults to show in the template.
 */
export function useSanity<T = unknown>(
  query: string,
  params?: Record<string, unknown>,
): { data: Ref<T | null>; loading: Ref<boolean>; error: Ref<string | null> } {
  // Initial loading is `false` (not `true`) so SSG-rendered HTML doesn't
  // show a loading spinner — the fetch hasn't started yet during prerender,
  // and treating "not started" as "in-progress" was blocking SiteLayout from
  // rendering content in the prerendered output. Flips to true only while a
  // fetch is actively in flight on the client.
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  onMounted(async () => {
    if (!projectId) {
      return
    }
    loading.value = true
    try {
      const res = await fetch(buildUrl(query, params))
      if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
      const json = await res.json()
      data.value = json.result as T
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      loading.value = false
    }
  })

  return { data, loading, error }
}

/**
 * SSG-aware variant: performs the fetch inside the call, returning a Promise.
 * Designed to be `await`ed in <script setup> so Vue's <Suspense> can hold
 * rendering until the data resolves — vite-ssg awaits the same Suspense
 * during prerender, baking the fetched data into the static HTML.
 *
 * Use for page-level Sanity queries whose result drives the visible page
 * content (heroes, splitSections, FAQ items, etc.) where having the content
 * present at first byte matters for SEO + social previews + no-JS visibility.
 *
 * Hydration: the client re-runs script-setup on hydration and fetches the
 * same query again. Sanity's CDN returns the identical payload, so there's
 * no hydration mismatch — just a small duplicate fetch on first load. Cheap
 * enough at <100ms over the Sanity CDN that it's not worth adding an
 * initialState transport layer.
 */
export async function useSanityAsync<T = unknown>(
  query: string,
  params?: Record<string, unknown>,
): Promise<{ data: Ref<T | null>; error: Ref<string | null> }> {
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<string | null>(null)

  if (!projectId) {
    return { data, error }
  }

  try {
    const res = await fetch(buildUrl(query, params))
    if (!res.ok) throw new Error(`Sanity query failed: ${res.status}`)
    const json = await res.json()
    data.value = json.result as T
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }

  return { data, error }
}
