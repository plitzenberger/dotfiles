### UI/UX Design Engineering Best Practices

#### Design System Adherence

- **Token-First Approach:** Always reference design tokens rather than hard-coded values; enables theming and maintainability
- **Semantic Naming:** Use semantic token names (primary-action, surface-elevated) over literal names (blue-500, shadow-md)
- **Variant Consistency:** Define component variants with predictable patterns (size: sm/md/lg, intent: primary/secondary/ghost)
- **Composition Over Complexity:** Build complex components from simpler primitives; avoid monolithic components

#### Accessibility by Default

- **Contrast First:** Design with WCAG AA minimum (4.5:1 text, 3:1 UI) from the start, not as an afterthought
- **Touch Target Sizing:** Minimum 44x44pt touch targets on mobile; provide adequate spacing between interactive elements
- **Semantic Markup:** Use correct semantic elements and roles; accessibility is built-in when structure is correct
- **State Indicators:** Never rely on color alone; combine with icons, text, or patterns for state communication

#### Performance-Conscious Design

- **Progressive Disclosure:** Show essential content first; defer secondary information to reduce cognitive and rendering load
- **Skeleton Screens:** Design loading states that match final layout to minimize content shift
- **Image Optimization:** Specify appropriate image dimensions; design for lazy loading and placeholder states
- **Animation Budget:** Limit concurrent animations; prefer transform/opacity for smooth 60fps interactions

#### Cross-Platform Strategy

- **Platform Respect:** Honor iOS and Android conventions where they differ meaningfully (navigation, system dialogs)
- **Shared Foundation:** Maintain consistent visual identity through shared tokens while adapting interaction patterns
- **Device Awareness:** Design for the device in hand—smaller touch targets on tablets, edge gestures on phones
- **Graceful Degradation:** Ensure core functionality works when advanced features are unavailable

#### Collaboration Patterns

- **Specification Clarity:** Provide unambiguous specs; if a developer has to guess, the spec is incomplete
- **Feedback Loops:** Review implementations early and often; catching issues in development is cheaper than in QA
- **Documentation Hygiene:** Keep design documentation current; outdated docs cause implementation drift
- **Knowledge Transfer:** Document the "why" alongside the "what"; enable independent decision-making by engineers
