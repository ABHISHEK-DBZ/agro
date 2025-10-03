<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Smart Krishi Sahayak - Copilot Instructions

This is a React TypeScript application for agriculture assistance. When working on this project, please follow these guidelines:

## Project Context
- This is an agriculture assistant app called "Smart Krishi Sahayak"
- Primary users are farmers in India
- The app provides weather, crop info, disease detection, market prices, and government schemes
- Supports Hindi and English languages

## Code Style & Standards
- Use TypeScript with strict type checking
- Follow React functional components with hooks
- Use Tailwind CSS for styling
- Implement responsive design for mobile-first approach
- Use lucide-react for icons
- Follow component composition patterns

## File Structure
- Components go in `src/components/`
- Pages go in `src/pages/`
- Types and interfaces should be defined inline or in separate type files
- Use proper import/export conventions

## UI/UX Guidelines
- Use green/agriculture theme colors
- Implement mobile-responsive design
- Include Hindi translations for farmer accessibility
- Use clear, simple language in UI text
- Add appropriate loading states and error handling

## API Integration
- Use axios for HTTP requests
- Implement proper error handling
- Add loading states for all API calls
- Mock data should be realistic and relevant to Indian agriculture

## Accessibility & Localization
- Support Hindi (hi) and English (en) languages
- Use react-i18next for translations
- Ensure ARIA labels for accessibility
- Consider rural internet connectivity constraints

## Agriculture Domain
- Use Indian crop names and varieties
- Include relevant government schemes (PM-KISAN, PMFBY, etc.)
- Use Indian currency (₹) and measurement units
- Reference Indian weather patterns and farming seasons (Kharif, Rabi)

## Best Practices
- Implement proper TypeScript types
- Add appropriate loading and error states
- Use semantic HTML elements
- Optimize for performance and bundle size
- Include proper SEO meta tags
