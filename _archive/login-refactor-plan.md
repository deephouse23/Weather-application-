# Implementation Plan - Login UI Updates

## Goal
Refactor the Login/Signup form (`components/auth/auth-form.tsx`) to use modern Shadcn UI components while maintaining the application's unique retro 16-bit aesthetic.

## User Review Required
> [!NOTE]
> This change will affect both Login and Signup pages as they share the `AuthForm` component.

## Proposed Changes

### [components/auth]

#### [MODIFY] [auth-form.tsx](file:///c:/Users/justi/OneDrive/Desktop/Weather-application--main/components/auth/auth-form.tsx)
-   Replace outer container `div` with Shadcn `Card`, `CardHeader`, `CardContent`, `CardFooter`.
-   Replace native `<input>` fields with Shadcn `<Input>` component.
-   Replace native `<label>` with Shadcn `<Label>` component.
-   Replace native `<button>` elements with Shadcn `<Button>` component.
    -   Primary action: `variant="default"` (or specific high-contrast override).
    -   OAuth buttons: `variant="outline"`.
    -   Eye icon toggle: `variant="ghost"`.
-   Integrate `themeClasses` with Shadcn components using `className` overrides to preserve the retro look (borders, fonts, colors).

## Verification Plan

### Automated Tests
-   Run existing Playwright tests to ensure auth flow still works: `npx playwright test tests/e2e/auth.spec.ts` (if available) or `profile.spec.ts`.

### Manual Verification
-   Start dev server.
-   Navigate to `/auth/login`.
-   Verify visual appearance (retro borders, fonts, colors).
-   Test interaction:
    -   Type in inputs (focus states).
    -   Toggle password visibility.
    -   Switch between Login/Signup.
    -   Attempt login (functionality check).
