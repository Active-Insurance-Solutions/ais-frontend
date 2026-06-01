<script setup>
import { ref, computed } from 'vue';
import { useSanity } from '@/composables/useSanity';
import { useViewStore } from '@/stores/useViewStore';
import { useSiteStore } from '@/stores/useSiteStore';
import { sectionMap, pageQuery } from '@/composables/useSections';
import { useRevealObserver } from '@/composables/useRevealObserver';

/* One query for both view modes — same pattern as About/Services/FAQ.
 * Modern view iterates `sections` straight through sectionMap (the original
 * ContactSection component renders unchanged). Classic view derives its
 * regions client-side and inlines a styled form, leaving ContactSection
 * fully untouched. */
const { data: page } = useSanity(pageQuery('/contact'));
const view = useViewStore();
const site = useSiteStore();

/* Combine view mode + page-load state into one trigger so the reveal
 * observer rescans both when the Sanity fetch resolves AND when toggling
 * back to modern view re-mounts its `.reveal` nodes. */
const revealTrigger = computed(
  () => `${view.mode}:${page.value ? 'loaded' : 'pending'}`,
);
useRevealObserver(revealTrigger);

const sections = computed(() => page.value?.sections || []);
const hero = computed(
  () => sections.value.find((s) => s._type === 'heroSection') || null,
);
const contact = computed(
  () => sections.value.find((s) => s._type === 'contactSection') || null,
);

const heroTitle = computed(() => hero.value?.title || 'Contact Us');
const heroSubtitle = computed(() => hero.value?.subtitle || '');
const heading = computed(() => contact.value?.heading || 'Get in Touch');
const preferenceNotes = computed(() => contact.value?.preferenceNotes || '');
const phone = computed(() => contact.value?.phone || site.contactPhone);
const address = computed(() => contact.value?.address || site.address);
const mapEmbedUrl = computed(() => contact.value?.mapEmbedUrl || '');

/* Same pattern as About/Services/FAQ: bump the title bar's top padding in
 * classic view so it clears HeaderClassic's fixed gradient + tab overlay. */
const titleBarTopPad = computed(() =>
  view.mode === 'classic' ? 'pt-8 min-[850px]:pt-32' : 'pt-8',
);

const telHref = computed(
  () => 'tel:' + (phone.value || '').replace(/[^\d+]/g, ''),
);

/* ── Inline form state for classic view ──────────────────────────────────
 * Mirrors the ContactSection component's state + submit handler so the
 * Netlify function on the receiving end sees the same payload shape from
 * either view. Inlining (rather than extracting a shared component) keeps
 * the classic and modern visual treatments fully independent. */
const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  bestDay: '',
  bestTime: '',
  preferredMethod: 'Email',
  message: '',
});
const contactSent = ref(false);
const contactError = ref('');
const submitting = ref(false);

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeOptions = ['Morning', 'Afternoon', 'Evening'];

async function sendContact() {
  const { name, email, message } = contactForm.value;
  if (!name || !email || !message) {
    contactError.value = 'Please fill in name, email, and message.';
    return;
  }
  contactError.value = '';
  submitting.value = true;
  try {
    const res = await fetch('/.netlify/functions/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactForm.value),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    contactSent.value = true;
  } catch (err) {
    contactError.value = err instanceof Error ? err.message : 'Failed to send. Please try again.';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="page page--contact">
    <!-- ─── Classic view: navy title bar + intro/quote + form + map ─── -->
    <template v-if="view.mode === 'classic'">
      <section
        class="bg-[var(--color-primary)] text-white text-center px-6 pb-8"
        :class="titleBarTopPad"
      >
        <h1 class="text-3xl font-bold m-0">{{ heroTitle }}</h1>
      </section>

      <div class="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <!-- Two-column: 40% intro/contact-info + 60% form, single column
             below lg. -->
        <div class="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12">
          <!-- Left column: heading + intro + quote callout + phone + address -->
          <aside class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold text-[var(--color-primary)] m-0 mb-3">
                {{ heading }}
              </h2>
              <p
                v-if="heroSubtitle"
                class="text-[var(--color-text-secondary)] leading-relaxed m-0"
              >
                {{ heroSubtitle }}
              </p>
            </div>

            <!-- Highlighted quote block — light gray bg, navy left rule,
                 rounded-lg. Pulls from the existing preferenceNotes field. -->
            <blockquote
              v-if="preferenceNotes"
              class="bg-[var(--color-bg-secondary)] border-l-4 border-[var(--color-primary)] rounded-lg p-5 text-[var(--color-text-secondary)] text-sm leading-relaxed m-0"
            >
              {{ preferenceNotes }}
            </blockquote>

            <!-- Extra top spacing so the quote callout has breathing room before
                 the contact-info eyebrows start. Overrides the parent's space-y-6
                 (1.5rem) → 2.75rem gap. -->
            <div v-if="phone" class="mt-11!">
              <p class="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1 m-0">
                Call us
              </p>
              <a
                :href="telHref"
                class="text-2xl font-bold text-[var(--color-secondary)] hover:underline"
              >{{ phone }}</a>
            </div>

            <div v-if="address">
              <p class="text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1 m-0">
                Office
              </p>
              <p class="text-base text-[var(--color-text)] whitespace-pre-line m-0">
                {{ address }}
              </p>
            </div>
          </aside>

          <!-- Right column: black backdrop with the white form card sitting
               on top. Echo of the original site's bold dark-mat treatment.
               Inner card keeps its navy border + amber submit; the black
               mat just frames it. -->
          <div class="bg-black rounded-lg p-6">
            <div
              v-if="!contactSent"
              class="bg-[var(--color-bg-card)] rounded-lg p-6 border-2 border-[var(--color-primary)] space-y-4"
            >
              <h3 class="text-lg font-bold text-[var(--color-primary)] m-0 mb-2">
                Send a Message
              </h3>

              <div>
                <label
                  for="cl-name"
                  class="block text-sm font-semibold text-[var(--color-primary)] mb-1"
                >
                  Full Name <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="cl-name"
                  v-model="contactForm.name"
                  type="text"
                  placeholder="Your name"
                  aria-required="true"
                  :aria-describedby="contactError ? 'cl-error' : undefined"
                  class="w-full px-3 py-2.5 rounded-lg border-2 border-[var(--color-primary)] text-sm bg-[var(--color-bg-card)] text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                />
              </div>

              <div>
                <label
                  for="cl-email"
                  class="block text-sm font-semibold text-[var(--color-primary)] mb-1"
                >
                  Email Address <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="cl-email"
                  v-model="contactForm.email"
                  type="email"
                  placeholder="your@email.com"
                  aria-required="true"
                  :aria-describedby="contactError ? 'cl-error' : undefined"
                  class="w-full px-3 py-2.5 rounded-lg border-2 border-[var(--color-primary)] text-sm bg-[var(--color-bg-card)] text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                />
              </div>

              <div>
                <label
                  for="cl-phone"
                  class="block text-sm font-semibold text-[var(--color-primary)] mb-1"
                >Phone Number</label>
                <input
                  id="cl-phone"
                  v-model="contactForm.phone"
                  type="tel"
                  placeholder="970.555.0123"
                  autocomplete="tel"
                  class="w-full px-3 py-2.5 rounded-lg border-2 border-[var(--color-primary)] text-sm bg-[var(--color-bg-card)] text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                />
              </div>

              <!-- Day/time side-by-side from 426px+. Below that, Best time
                   drops to its own row so the two selects don't get squeezed
                   into ~140px-wide cells on small phones. -->
              <div class="grid grid-cols-1 min-[426px]:grid-cols-2 gap-3">
                <div>
                  <label
                    for="cl-day"
                    class="block text-sm font-semibold text-[var(--color-primary)] mb-1"
                  >Best day</label>
                  <select
                    id="cl-day"
                    v-model="contactForm.bestDay"
                    class="w-full px-3 py-2.5 rounded-lg border-2 border-[var(--color-primary)] text-sm bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                  >
                    <option value="">No preference</option>
                    <option v-for="day in dayOptions" :key="day" :value="day">
                      {{ day }}
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    for="cl-time"
                    class="block text-sm font-semibold text-[var(--color-primary)] mb-1"
                  >Best time</label>
                  <select
                    id="cl-time"
                    v-model="contactForm.bestTime"
                    class="w-full px-3 py-2.5 rounded-lg border-2 border-[var(--color-primary)] text-sm bg-[var(--color-bg-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
                  >
                    <option value="">No preference</option>
                    <option v-for="time in timeOptions" :key="time" :value="time">
                      {{ time }}
                    </option>
                  </select>
                </div>
              </div>

              <fieldset>
                <legend class="block text-sm font-semibold text-[var(--color-primary)] mb-2">
                  Please contact me via
                </legend>
                <div class="flex items-center gap-5 text-sm text-[var(--color-text)]">
                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      v-model="contactForm.preferredMethod"
                      value="Email"
                      class="accent-[var(--color-primary)]"
                    />
                    Email
                  </label>
                  <label class="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      v-model="contactForm.preferredMethod"
                      value="Phone"
                      class="accent-[var(--color-primary)]"
                    />
                    Phone
                  </label>
                </div>
              </fieldset>

              <div>
                <label
                  for="cl-msg"
                  class="block text-sm font-semibold text-[var(--color-primary)] mb-1"
                >
                  How can we help? <span class="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="cl-msg"
                  v-model="contactForm.message"
                  rows="5"
                  placeholder="Tell us about your situation or question..."
                  aria-required="true"
                  :aria-describedby="contactError ? 'cl-error' : undefined"
                  class="w-full px-3 py-2.5 rounded-lg border-2 border-[var(--color-primary)] text-sm bg-[var(--color-bg-card)] text-[var(--color-text)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] resize-none"
                ></textarea>
              </div>

              <p
                v-if="contactError"
                id="cl-error"
                role="alert"
                class="text-red-500 text-sm m-0"
              >{{ contactError }}</p>

              <!-- Amber submit. accent-hover (#b16105) for AA contrast
                   against white text — same convention as other classic CTAs. -->
              <button
                @click="sendContact"
                :disabled="submitting"
                class="w-full py-3 text-white font-semibold rounded-lg text-base transition-colors cursor-pointer bg-[var(--color-accent-hover)] hover:bg-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Sending...' : 'Submit Message' }}
              </button>
            </div>

            <!-- Post-submit confirmation -->
            <div
              v-else
              class="bg-[var(--color-bg-card)] rounded-lg p-8 border-2 border-[var(--color-primary)] text-center"
            >
              <div
                class="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center mx-auto mb-3 text-white text-xl"
                aria-hidden="true"
              >✓</div>
              <p class="font-bold text-[var(--color-primary)] m-0 mb-1">
                Message sent!
              </p>
              <p class="text-[var(--color-text-secondary)] text-sm m-0">
                We'll be in touch shortly.
              </p>
            </div>
          </div>
        </div>

        <!-- Full-width map below the columns -->
        <div
          v-if="mapEmbedUrl"
          class="rounded-lg overflow-hidden border border-[var(--color-border)]"
        >
          <iframe
            :src="mapEmbedUrl"
            :title="`Map of ${site.name || 'Active Insurance Solutions'}`"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            class="w-full h-96 border-0"
            allow="fullscreen"
          />
        </div>
      </div>
    </template>

    <!-- ─── Modern view: original generic sections renderer ─── -->
    <template v-else>
      <template v-for="section in sections" :key="section._key">
        <component
          :is="sectionMap[section._type]"
          v-if="sectionMap[section._type]"
          :section="section"
        />
      </template>
    </template>
  </main>
</template>
