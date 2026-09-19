# Campaign attribution

The web app keeps campaign attribution in a first-party
`chofex_campaign_attribution` cookie. The cookie is written only from public
landing URLs with recognized UTM parameters. It is browser-readable because
the first landing can happen before authentication, and it uses `SameSite=Lax`,
`Path=/`, `Secure` on HTTPS, and a 90-day maximum age.

The stored first and latest touches each contain only normalized UTM values and
a capture time. Cookie input is untrusted: the server validates its version,
timestamps, recognized fields, value lengths, and retention window before
adding `first_utm_*`, `latest_utm_*`, `first_campaign_at`, and
`latest_campaign_at` to product events. No participant email or profile data is
stored. Sign-out and account switches reset PostHog identity and remove the
attribution cookie so a shared browser cannot carry one participant's identity
or campaign into another participant's activity.

The browser calls `posthog.identify` with the authenticated Clerk user ID. This
follows the installed `posthog-js` 1.433.10 identity interface, which replaces
the anonymous distinct ID and connects the prior anonymous history. Email is
never used as a distinct ID.

## Reproducible campaign funnels

Use `person_id`, rather than raw `distinct_id`, so PostHog's anonymous-to-Clerk
identity merge joins the landing and authenticated server events. Replace the
campaign literal when running each query.

Challenge-link outcomes:

```sql
WITH landings AS (
    SELECT person_id, min(timestamp) AS landed_at
    FROM events
    WHERE event = '$pageview'
      AND properties.$utm_campaign = 'CAMPAIGN'
      AND properties.$current_url LIKE '%/challenges/%'
    GROUP BY person_id
)
SELECT
    uniq(landings.person_id) AS landed,
    uniqIf(events.person_id, events.event = 'challenge_query_completed') AS queried,
    uniqIf(events.person_id, events.event = 'challenge_local_test_completed') AS tested,
    uniqIf(events.person_id, events.event = 'challenge_evaluation_submitted') AS evaluated
FROM landings
LEFT JOIN events
    ON events.person_id = landings.person_id
   AND events.timestamp >= landings.landed_at
   AND events.properties.first_utm_campaign = 'CAMPAIGN'
```

Application outcomes remain a separate funnel because those links have a
different intent:

```sql
WITH landings AS (
    SELECT person_id, min(timestamp) AS landed_at
    FROM events
    WHERE event = '$pageview'
      AND properties.$utm_campaign = 'CAMPAIGN'
      AND properties.$current_url NOT LIKE '%/challenges/%'
    GROUP BY person_id
)
SELECT
    uniq(landings.person_id) AS landed,
    uniqIf(events.person_id, events.event = 'application_draft_saved') AS saved_draft,
    uniqIf(events.person_id, events.event = 'application_submitted') AS submitted
FROM landings
LEFT JOIN events
    ON events.person_id = landings.person_id
   AND events.timestamp >= landings.landed_at
   AND events.properties.first_utm_campaign = 'CAMPAIGN'
```

The report and campaign operating artifacts remain the source for campaign
names and link templates; do not duplicate recipient or message content here.
