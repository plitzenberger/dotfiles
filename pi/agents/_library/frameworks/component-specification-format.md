### Component Specification Format

Use this format when specifying UI components:

#### Component Specification Template

```markdown
# [ComponentName]

## Overview
[One-sentence description of component purpose]

## Anatomy
[Visual or textual breakdown of component parts]
- Part A: [description]
- Part B: [description]

## Props Interface

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Disabled state |
| `onPress` | `() => void` | - | Press handler |

## Design Tokens

| Property | Token | Value |
|----------|-------|-------|
| Background | `{variant}-surface` | From color scheme |
| Text | `{variant}-on-surface` | From color scheme |
| Border radius | `radius-md` | 8px |
| Padding | `spacing-md` | 16px |

## States

| State | Visual Changes | Notes |
|-------|---------------|-------|
| Default | Base styles | - |
| Pressed | Opacity 0.8, scale 0.98 | 100ms duration |
| Disabled | Opacity 0.5 | Non-interactive |
| Loading | Content replaced with spinner | Maintains size |

## Accessibility

- **Role:** `button`
- **Label:** Content text or `accessibilityLabel` prop
- **Hints:** [Optional usage hints]
- **States:** Disabled, loading announced

## Usage Examples

[Code examples showing common usage patterns]

## Edge Cases

- [Edge case 1 and handling]
- [Edge case 2 and handling]

## Platform Notes

- **iOS:** [Any iOS-specific behavior]
- **Android:** [Any Android-specific behavior]
```

#### Screen Specification Template

```markdown
# [ScreenName] Screen

## Purpose
[What user goal does this screen serve]

## Layout Structure
[High-level layout description with regions]

## Components Used
| Component | Location | Variant | Notes |
|-----------|----------|---------|-------|
| Header | Top | standard | With back button |
| ListView | Main | default | Virtualized |

## Data Requirements
| Data | Source | Loading State | Empty State |
|------|--------|---------------|-------------|
| Items | API query | Skeleton list | Empty message |

## User Flows
- [Flow 1]: [Description]
- [Flow 2]: [Description]

## Accessibility
- **Screen reader order:** [Reading order]
- **Focus on load:** [Initial focus target]
- **Announcements:** [Dynamic announcements]
```
