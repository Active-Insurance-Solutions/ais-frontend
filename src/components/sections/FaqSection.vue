<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ section: { type: Object, default: null } });
const faqs = computed(() => props.section?.items || []);

// Single-open accordion: opening one question closes any previously open one.
const openIdx = ref(null);
function isOpen(idx) { return openIdx.value === idx; }
function toggleFaq(idx) { openIdx.value = openIdx.value === idx ? null : idx; }

// Parse a plain-text answer into renderable blocks. Paragraphs are separated by
// blank lines (\n\n+). Within a block, if every line begins with • or -, the
// block renders as an unordered list; otherwise as a paragraph.
function parseAnswer(text) {
  if (!text) return [];
  return text.split(/\n{2,}/).map((para) => {
    const lines = para.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;
    const looksLikeList = lines.every((l) => /^[•\-]\s+/.test(l));
    if (looksLikeList) {
      return { type: 'list', items: lines.map((l) => l.replace(/^[•\-]\s+/, '')) };
    }
    return { type: 'para', text: lines.join(' ') };
  }).filter(Boolean);
}
</script>

<template>
  <section v-if="faqs.length" class="reveal py-16 px-6 bg-[var(--color-bg)]">
    <div class="max-w-3xl mx-auto">
      <div v-if="section?.heading || section?.subheading" class="text-center mb-10">
        <h2 v-if="section?.heading" class="text-3xl font-bold text-[var(--color-text)] mb-3">{{ section.heading }}</h2>
        <p v-if="section?.subheading" class="text-[var(--color-text-secondary)] text-base">{{ section.subheading }}</p>
      </div>
      <div class="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        <div v-for="(item, idx) in faqs" :key="idx">
          <button :aria-expanded="isOpen(idx)" :aria-controls="`faq-panel-${idx}`" class="w-full flex items-center justify-between py-5 text-left gap-4 rounded-lg hover:bg-[var(--color-surface)] px-2 -mx-2 focus-ring transition-colors" @click="toggleFaq(idx)">
            <span class="font-medium text-[var(--color-text)] text-sm md:text-base">{{ item.question }}</span>
            <span aria-hidden="true" class="shrink-0 w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-lg font-medium text-[var(--color-text-secondary)] transition-transform duration-200" :class="isOpen(idx) ? 'rotate-45' : ''">+</span>
          </button>
          <div v-if="isOpen(idx)" :id="`faq-panel-${idx}`" role="region" :aria-label="item.question" class="pb-5 text-[var(--color-text-secondary)] text-sm leading-relaxed px-2 -mx-2 faq-answer">
            <template v-for="(block, i) in parseAnswer(item.answer)" :key="i">
              <ul v-if="block.type === 'list'" class="list-disc pl-5 my-3 space-y-1.5">
                <li v-for="(li, j) in block.items" :key="j">{{ li }}</li>
              </ul>
              <p v-else class="mb-3 last:mb-0">{{ block.text }}</p>
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
