'use server'

import { searchStackOverflow } from '@/lib/integrations/stack-exchange'

export async function searchStackOverflowAction(query: string, tag?: string) {
    try {
        const results = await searchStackOverflow(query, tag)
        return { results }
    } catch (error) {
        console.error("Stack Server Action Error", error)
        return { results: [], error: 'Failed to fetch results' }
    }
}
