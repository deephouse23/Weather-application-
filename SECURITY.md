# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | Yes                |

Only the latest version deployed to production (16bitweather.co) receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly. **Do not open a public GitHub issue.**

### How to Report

- **Email:** [security@16bitweather.co](mailto:security@16bitweather.co)
- **GitHub Security Advisories:** Use the [Security Advisories](https://github.com/jelrod27/Weather-application-/security/advisories/new) feature to privately report a vulnerability.

### What to Include

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected components or endpoints
- Potential impact assessment
- Any suggested remediation (optional)

### Response Timeline

- **Acknowledgment:** Within 48 hours of receipt
- **Assessment:** Within 7 days we will provide an initial assessment, including severity classification and expected resolution timeline
- **Updates:** We will keep you informed of progress toward a fix

## Scope

### In Scope

- The 16bitweather.co production application
- API endpoints under the application domain
- Authentication and authorization mechanisms
- Data handling and storage practices

### Out of Scope

- Third-party services and APIs we consume (OpenWeatherMap, Supabase, NOAA, etc.)
- Denial-of-service attacks
- Social engineering
- Findings from automated scanners without demonstrated impact
- Issues in dependencies that are not exploitable in our application context

## Bug Bounty

There is no bug bounty program at this time. We appreciate responsible disclosure and will credit reporters in release notes (with permission).
