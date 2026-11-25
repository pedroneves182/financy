# UI Standards

Source of truth for pages, layouts, components, forms, dialogs, and other UI work.

---

# 1. Scope

Read this file before changing:

- `src/app/**` pages, layouts, loading states, and route UI
- Reusable app components
- Forms, dialogs, toasts, and other interactive UI
- Component structure and file organization

---

# 2. UI Boundaries

- `src/app/**` is for rendering and composition.
- Prefer Server Components for reads.
- Use Client Components only for interactivity.
- Must never import server-only modules into client components.
- `src/app/**` may depend on `application` and `presentation` but must not depend on `infra` directly.

---

# 3. Page Rules

- Avoid adding logic to `page.tsx`.
- Keep `page.tsx` focused on wiring, composition, and route-level data access.
- Move business logic into `application/use-cases`, `application/services`, or `application/queries`.
- Move complex UI behavior out of the page and into dedicated components/hooks.

---

# 4. Component Organization

- Use 1 component per file.
- Use `function` declarations for React components.
- If a component has complex logic, create a separate file for logic.
- Example: `signup-form.tsx` becomes `signup-form.view.tsx` and imports `useSignupForm()` from `signup-form.logic.ts`.
- Keep view files focused on rendering and interaction wiring.

---

# 5. UI Composition Rules

- Reuse primitives from `src/components/ui/`; do not invent new primitives casually.
- Use shadcn/ui variants and `cn(...)` from `src/lib/utils.ts` for class composition.
- Avoid one-off Tailwind overrides on component instances; add or extend variants instead.
- Use `lucide-react` for icons.
- User-facing labels and UI copy should be in Portuguese.

---

# 6. Forms And Actions

- Reuse shared Zod schemas for forms and Server Actions.
- Client-side validation is UX only; the server remains the source of truth.
- Server Actions stay thin and declarative; UI should call them, not reimplement business rules.
- When a Client Component form triggers a Server Action, use `useActionSubmit()` from `@/lib/utils/action-submit`.
- This is the default pattern for form submission in the UI layer.
- Do not create ad-hoc submit handlers for loading, timeout, duplicate-submit prevention, or toast handling when `useActionSubmit()` already covers the flow.
- Use `messageConfig` to customize or disable success and error toasts when needed.

---

# 7. UI States

- Provide loading UI for async boundaries where appropriate.
- Handle `ActionResult` errors with user-friendly messages.
- Never leak internal error details to the UI.
