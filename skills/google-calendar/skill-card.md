## Description: <br>
Interact with Google Calendar via the Google Calendar API to list upcoming events and create, update, or delete calendar events from OpenClaw. <br>

This skill is ready for commercial/non-commercial use. <br>

## Publisher: <br>
[AdrianMiller99](https://clawhub.ai/user/AdrianMiller99) <br>

### License/Terms of Use: <br>


## Use Case: <br>
Developers and operators use this skill to let an agent list upcoming Google Calendar events and create, update, or delete events through the Google Calendar API. <br>

### Deployment Geography for Use: <br>
Global <br>

## Known Risks and Mitigations: <br>
Risk: The skill can create, update, and delete Google Calendar events. <br>
Mitigation: Use the narrowest practical Google Calendar OAuth scope, prefer a limited calendar, and independently confirm event IDs before update or delete operations. <br>
Risk: The refresh helper writes and prints a short-lived Google access token. <br>
Mitigation: Avoid running the helper in shared environments or logs, store credentials with secret management, and restrict access to local credential files. <br>


## Reference(s): <br>
- [ClawHub Google Calendar skill page](https://clawhub.ai/AdrianMiller99/google-calendar) <br>
- [Google Calendar API reference](https://developers.google.com/calendar/api/v3/reference) <br>
- [OAuth 2.0 for installed apps](https://developers.google.com/identity/protocols/oauth2/native-app) <br>


## Skill Output: <br>
**Output Type(s):** [JSON, Shell commands, Configuration] <br>
**Output Format:** [JSON payloads printed to stdout, with command-line usage and credential configuration instructions documented in Markdown.] <br>
**Output Parameters:** [1D] <br>
**Other Properties Related to Output:** [Requires Google OAuth credentials and a configured Google Calendar ID; command failures print errors to stderr and exit non-zero.] <br>

## Skill Version(s): <br>
0.1.0 (source: server-resolved release metadata) <br>

## Ethical Considerations: <br>
Users should evaluate whether this skill is appropriate for their environment, review any generated or modified files before relying on them, and apply their organization's safety, security, and compliance requirements before deployment. <br>
