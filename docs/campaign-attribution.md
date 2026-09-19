# Campaign attribution

The web app keeps campaign attribution in a first-party
`chofex_campaign_attribution` cookie. The cookie is written only from public
landing URLs with recognized UTM parameters. It is browser-readable because
the first landing can happen before authentication, and it uses `SameSite=Lax`,
`Path=/`, `Secure` on HTTPS, and a 90-day maximum age.

The stored first and latest touches each contain only normalized UTM values and
a capture time. Each touch expires independently after 90 days; when the older
first touch expires, the still-valid latest touch becomes the first touch for
the new retention window. Cookie input is untrusted: the server validates its
version, timestamps, recognized fields, value lengths, and retention window before
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
WITH campaign_landings AS (
    SELECT
        uuid AS landing_id,
        person_id,
        timestamp AS landed_at,
        properties.$utm_campaign AS landing_campaign
    FROM events
    WHERE event = '$pageview'
      AND properties.chofex_campaign_landing = true
      AND properties.$utm_campaign IS NOT NULL
      AND (
          properties.$current_url LIKE '%/challenges'
          OR properties.$current_url LIKE '%/challenges/%'
      )
),
conversion_candidates AS (
    SELECT
        conversions.uuid AS conversion_id,
        conversions.person_id,
        conversions.event,
        landings.landing_campaign,
        row_number() OVER (
            PARTITION BY conversions.uuid
            ORDER BY landings.landed_at DESC, landings.landing_id DESC
        ) AS landing_rank
    FROM events AS conversions
    LEFT JOIN campaign_landings AS landings
       ON conversions.person_id = landings.person_id
       AND conversions.timestamp >= landings.landed_at
       AND conversions.timestamp < landings.landed_at + INTERVAL 30 DAY
       AND (
           isNull(conversions.properties.latest_utm_campaign)
           OR conversions.properties.latest_utm_campaign = landings.landing_campaign
       )
    WHERE conversions.event IN (
        'challenge_query_completed',
        'challenge_local_test_completed',
        'challenge_evaluation_submitted'
    )
),
attributed_conversions AS (
    SELECT person_id, event
    FROM conversion_candidates
    WHERE landing_rank = 1
      AND landing_campaign = 'CAMPAIGN'
)
SELECT
    (
        SELECT uniq(person_id)
        FROM campaign_landings
        WHERE landing_campaign = 'CAMPAIGN'
    ) AS landed,
    uniqIf(person_id, event IN (
        'challenge_query_completed',
        'challenge_local_test_completed',
        'challenge_evaluation_submitted'
    )) AS started,
    uniqIf(person_id, event = 'challenge_query_completed') AS queried,
    uniqIf(person_id, event = 'challenge_local_test_completed') AS tested,
    uniqIf(person_id, event = 'challenge_evaluation_submitted') AS evaluated
FROM attributed_conversions
```

Application outcomes remain a separate funnel because those links have a
different intent:

```sql
WITH campaign_landings AS (
    SELECT
        uuid AS landing_id,
        person_id,
        timestamp AS landed_at,
        properties.$utm_campaign AS landing_campaign
    FROM events
    WHERE event = '$pageview'
      AND properties.chofex_campaign_landing = true
      AND properties.$utm_campaign IS NOT NULL
      AND properties.$current_url NOT LIKE '%/challenges'
      AND properties.$current_url NOT LIKE '%/challenges/%'
),
conversion_candidates AS (
    SELECT
        conversions.uuid AS conversion_id,
        conversions.person_id,
        conversions.event,
        landings.landing_campaign,
        row_number() OVER (
            PARTITION BY conversions.uuid
            ORDER BY landings.landed_at DESC, landings.landing_id DESC
        ) AS landing_rank
    FROM events AS conversions
    LEFT JOIN campaign_landings AS landings
       ON conversions.person_id = landings.person_id
       AND conversions.timestamp >= landings.landed_at
       AND conversions.timestamp < landings.landed_at + INTERVAL 30 DAY
       AND (
           isNull(conversions.properties.latest_utm_campaign)
           OR conversions.properties.latest_utm_campaign = landings.landing_campaign
       )
    WHERE conversions.event IN (
        'application_draft_saved',
        'application_submitted'
    )
),
attributed_conversions AS (
    SELECT person_id, event
    FROM conversion_candidates
    WHERE landing_rank = 1
      AND landing_campaign = 'CAMPAIGN'
)
SELECT
    (
        SELECT uniq(person_id)
        FROM campaign_landings
        WHERE landing_campaign = 'CAMPAIGN'
    ) AS landed,
    uniqIf(person_id, event = 'application_draft_saved') AS saved_draft,
    uniqIf(person_id, event = 'application_submitted') AS submitted
FROM attributed_conversions
```

Each qualifying landing opens its own 30-day conversion window. The `uniq`
aggregates keep conversions from double-counting a person. Events with explicit
`latest_utm_campaign` attribution match a preceding landing for that campaign.
Cookieless CLI events instead use `row_number()` to select the nearest preceding
qualifying campaign landing, so one conversion cannot count for every campaign
the person visited. `chofex_campaign_landing` is set only when the raw pageview
URL contains recognized UTM parameters; registered campaign properties on later
navigation pageviews do not extend or reclassify the landing.

The report and campaign operating artifacts remain the source for campaign
names and link templates; do not duplicate recipient or message content here.
