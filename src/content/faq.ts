import { library } from "./site"
import type { LibraryFaqCategory, LibraryFaqItem, LibraryLink } from "../lib/content/siteContent"

export type FaqLink = LibraryLink
export type FaqItem = LibraryFaqItem
export type FaqCategory = LibraryFaqCategory

export const faqCategories = library.faq.categories
export const faqNav = faqCategories.map((category) => ({ id: category.id, title: category.title }))
export const bowlerGuidelines = library.faq.bowlerGuidelines
export const spectatorGuidelines = library.faq.spectatorGuidelines
export const learningResources = library.faq.learningResources
export const questionTopics = library.faq.topics
