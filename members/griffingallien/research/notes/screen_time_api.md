# Apple Screen Time API (FamilyControls, ManagedSettings, ManagedSettingsUI, DeviceActivity): what a third-party iOS app can and cannot do to other apps, as of October 2026

Research date: 2026-10-20. Primary sources are Apple's developer documentation, which I read through its `.md` endpoints (for example `developer.apple.com/documentation/<framework>/<symbol>.md`), and the Apple Developer Forums. Secondary sources are developer blogs and GitHub. Each availability label like "iOS 26.4+" is copied from the metadata on the Apple doc page.

Background: the Screen Time API is made of three frameworks: Managed Settings, Family Controls and Device Activity. It was introduced at WWDC21 with iOS 15 — [WWDC Notes, WWDC21 "Meet the Screen Time API"](https://wwdcnotes.com/notes/wwdc21/10123). Developers today also count ManagedSettingsUI, which holds the shield UI, as a fourth framework. In practice you write three extension types: a DeviceActivityMonitor, a ShieldConfigurationDataSource and a ShieldActionDelegate — [dev.to, T. Willheim (HonorFit), Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e). A fourth, the DeviceActivityReport extension, is optional and only for showing usage.

---

## 1. What can be blocked or shielded, how FamilyActivityPicker works, and why apps are opaque tokens

### Takeaway
An app can shield (cover with a system "blocked" screen) whole apps, whole app categories, and web domains. It can also shield every app except a list of up to 50 exceptions. The only way to choose targets is Apple's `FamilyActivityPicker`, which returns opaque tokens: `ApplicationToken`, `ActivityCategoryToken` and `WebDomainToken`. Outside the EU, the host app cannot read which real app a token stands for. It can only show the app's name and icon through Apple-rendered views. Since iOS 26.4 there is an EU-only exception (`FamilyActivityData`) that returns real bundle identifiers.

### Cited Findings
**Picker and tokens**
- `FamilyActivityPicker` is "A view in which users specify applications, web domains, and categories without revealing their choices to the app." The selection comes back in a `FamilyActivitySelection` binding with `.applications`, `.categories` and `.webDomains`. "To protect the user's privacy, the system uses opaque values to represent the selections." The app passes those values to ManagedSettings and DeviceActivity. — [Apple Docs: FamilyActivityPicker](https://developer.apple.com/documentation/familycontrols/familyactivitypicker)
- On an individually authorized device, the picker lists apps and websites from that same device. On a parent's device, it lists only apps and websites from authorized child devices in the Family Sharing group. There is an initializer with optional `headerText:` and `footerText:`, and a `.familyActivityPicker(isPresented:selection:)` sheet modifier. — [Apple Docs: FamilyActivityPicker](https://developer.apple.com/documentation/familycontrols/familyactivitypicker)
- The picker returns `ApplicationToken`, `ActivityCategoryToken` and `WebDomainToken`. The app can count them but cannot turn them into app names. Categories stay categories unless `includeEntireCategory` is true. — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- FamilyControls has an "Activity labels" feature that will "Provide users with a read-only, visual representation of an application, category, or web domain." The app can display a token's icon and name in its UI without being able to read them. — [Apple Docs: Family Controls](https://developer.apple.com/documentation/familycontrols)
- The `Application` struct has `bundleIdentifier: String?`, `localizedDisplayName: String?` and `token: ApplicationToken?`. "Managed Settings represents apps with tokens to preserve user privacy and control." — [Apple Docs: Application](https://developer.apple.com/documentation/managedsettings/application)
- Inside the ShieldConfiguration extension, the app does learn the identity: "The system provides your extension with the display names, bundle identifiers, and domains for each application, website, or category it shields." That extension cannot send the information anywhere (see section 5). — [Apple Docs: ShieldConfigurationDataSource](https://developer.apple.com/documentation/managedsettingsui/shieldconfigurationdatasource)
- The ShieldActionDelegate (button handler) gets only tokens: "The system doesn't provide the name of a shielded Application, WebDomain, or ActivityCategory to preserve the Family Sharing group's privacy. Instead, the system uses a token." — [Apple Docs: ShieldActionDelegate](https://developer.apple.com/documentation/managedsettings/shieldactiondelegate)

**EU-only de-tokenized data (iOS 26.4+)**
- `FamilyActivityData` (iOS 26.4+) has `installedApplications: [Application]`, `visitedWebDomains: [WebDomain]` and `activityCategories`. "Customer installations of your app can only use the class on devices located in the EU that are signed in with an Apple Account with an EU country or region." You can develop and test with it in any region. The authorization status must be `approvedWithDataAccess`. — [Apple Docs: FamilyActivityData](https://developer.apple.com/documentation/familycontrols/familyactivitydata)
- The new entitlement `com.apple.developer.family-controls.app-and-website-usage` (iOS 26.4+) "lets your app use FamilyActivityData to retrieve the actual bundle identifiers of installed applications, domain names of visited websites, and display names of activity categories," with explicit permission from the user. — [Apple Docs: Family Controls App and Website Usage entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.family-controls.app-and-website-usage)
- `AuthorizationStatus` has `notDetermined`, `denied`, `approved` and `approvedWithDataAccess`. The last means approved "with access to non-tokenized family activity data". — [Apple Docs: AuthorizationStatus](https://developer.apple.com/documentation/familycontrols/authorizationstatus)
- A developer reported that on iOS 26.4, once the App and Website Usage capability is added, users can only grant full data access or no access. They cannot approve shielding without data access. The thread has no replies. — [Apple Forums thread 820283, Mar 2026](https://developer.apple.com/forums/thread/820283)

**What can be shielded (`ManagedSettingsStore.shield` / `ShieldSettings`)**
- `ManagedSettingsStore` exposes `shield: ShieldSettings` ("what apps and websites to cover with a shielding view"), `application: ApplicationSettings` ("apps and categories of apps a user can run"), `webContent: WebContentSettings`, plus settings for the App Store, media, Safari, Siri, passcode, account, cellular, date and time, and Game Center. You can create named stores with `init(named:)`. You can list them with `static var stores` and delete them with `deleteStore()` and `deleteStores(_:)`. — [Apple Docs: ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore)
- "The system doesn't guarantee that the settings you specify govern the device's behavior. The system is responsible for determining its effective state based on all the settings it receives." — [Apple Docs: ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore)
- "All apps except X": the `ShieldSettings.ActivityCategoryPolicy.all(except:)` page says an app can list up to 50 application or web domain tokens as exceptions. The `applicationCategories` page says an app can shield up to 50 category tokens. There is also `.specific(_:except:)`. — [Apple Docs: all(except:)](https://developer.apple.com/tutorials/data/documentation/managedsettings/shieldsettings/activitycategorypolicy/all(except:).md); [Apple Docs: applicationCategories](https://developer.apple.com/tutorials/data/documentation/managedsettings/shieldsettings/applicationcategories-swift.property.md). These two came from search-result excerpts of the doc pages; I did not open the full pages.
- A developer reports that 50 or fewer tokens in `store.shield.applications` shields correctly, but 51 or more blocks nothing (iOS 17.2). This is not documented. — [Apple Forums thread 733361](https://developer.apple.com/forums/thread/733361). Another developer reports blocking up to 50 apps per store through `store.application.blockedApplications`. — [Apple Forums thread 773488, Jan 2025](https://developer.apple.com/forums/thread/773488)
- Category shields do not cover apps in the user's Screen Time "Always Allowed" list. Shielding with `.all` leaves some system apps unshielded (Messages, Phone, FaceTime, Maps). Messages can be shielded if the user removes it from Always Allowed. A store returns only the settings you put in it, so you cannot get the list of apps a category policy affects. — [Apple Forums thread 729891](https://developer.apple.com/forums/thread/729891); [thread 793613](https://developer.apple.com/forums/thread/793613); [thread 725796](https://developer.apple.com/forums/thread/725796)
- react-native-device-activity limits web domain lists to 50 entries each and offers a web content filter policy (`auto` / `specific` / `all`). — [GitHub: kingstinct/react-native-device-activity](https://github.com/kingstinct/react-native-device-activity)
- iOS 26.5 adds `ManagedSettingsStore.TokenExpiryMessage`, "A message that is posted in NotificationCenter when ManagedSettingsStore tokens are expired... Use these messages to refresh tokens in your database that are expired." It also lists static `refresh(_:)` methods for `[ApplicationToken]`, `[ActivityCategoryToken]` and `[WebDomainToken]`. — [Apple Docs: TokenExpiryMessage](https://developer.apple.com/documentation/managedsettings/managedsettingsstore/tokenexpirymessage); [Apple Docs: ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore)

### Inferences
- For the wrapper app: the user picks Instagram, TikTok and YouTube once in `FamilyActivityPicker`. The app stores the encoded `FamilyActivitySelection` in the App Group and shields those tokens. Outside the EU, the app's code and the AI agent cannot know that token A is Instagram unless the user says so. The shield extension can show "Instagram" on the shield, but it cannot pass that name back to the app.
- Saved tokens may expire on iOS 26.5+. The app should listen for `TokenExpiryMessage` and call `refresh`.
- Users may run into the 50-token cap if they select many individual apps. Selecting the "Social" category avoids it.

### Gaps
- I could not confirm from Apple docs whether the 50-token cap on `shield.applications` is a hard documented limit. The evidence is forum reports only.
- The doc says when a token is "expired" but not under what conditions tokens expire.
- I did not verify a documented limit on the number of named `ManagedSettingsStore` instances.

---

## 2. Shield extensions: customization, button actions, opening the host app, and workarounds

### Takeaway
`ShieldConfigurationDataSource` lets you customize a static shield. You can set the background blur and color, an icon, the title and subtitle, the primary button label and color, a secondary button label, and, on iOS 26.4+, a submenu of up to three items on the secondary button. `ShieldActionDelegate` can return `.none`, `.close` or `.defer`. Apple's docs also list `.openParentalControlsApp` as available on iOS 26.5+. That would be the first official way to open the host app from a shield. However, developers and an Apple DTS reply from 2026 still describe opening the app as unsupported, so the team must test it on a device before relying on it. The established workaround is a local notification the user taps.

### Cited Findings
**What the shield UI can show (ManagedSettingsUI.ShieldConfiguration, iOS 15+)**
- Initializer: `ShieldConfiguration(backgroundBlurStyle: UIBlurEffect.Style?, backgroundColor: UIColor?, icon: UIImage?, title: ShieldConfiguration.Label?, subtitle: ShieldConfiguration.Label?, primaryButtonLabel: Label?, primaryButtonBackgroundColor: UIColor?, secondaryButtonLabel: Label?)`. A newer variant adds `secondaryButtonSubmenuItems: [String]?`. "The system provides a default appearance for any properties you set to nil." — [Apple Docs: ShieldConfiguration](https://developer.apple.com/documentation/managedsettingsui/shieldconfiguration)
- `secondaryButtonSubmenuItems` (iOS 26.4+): "the system displays a submenu on secondary button taps. Add up to three array elements". Apple's examples are "1 more minute", "15 more minutes" and "1 more hour". Taps arrive as `ShieldAction.firstSecondarySubmenuItemPressed`, `.secondSecondarySubmenuItemPressed` or `.thirdSecondarySubmenuItemPressed`. The system adds a Cancel button. — [Apple Docs: secondaryButtonSubmenuItems](https://developer.apple.com/documentation/managedsettingsui/shieldconfiguration/secondarybuttonsubmenuitems)
- `ShieldAction` cases: `primaryButtonPressed`, `secondaryButtonPressed`, and the three submenu cases. — [Apple Docs: ShieldAction](https://developer.apple.com/documentation/managedsettings/shieldaction)
- Data source methods: `configuration(shielding: Application)`, `configuration(shielding: Application, in: ActivityCategory)`, `configuration(shielding: WebDomain)` and `configuration(shielding: WebDomain, in: ActivityCategory)`. "Your extension is expected to return an appropriate configuration as quickly as possible". The system shows the default shield "if it takes too long to return a configuration." — [Apple Docs: ShieldConfigurationDataSource](https://developer.apple.com/documentation/managedsettingsui/shieldconfigurationdatasource)
- The shield is a static snapshot with no countdown or animation (FB14237883). — [Apple Forums thread 838231, Jul 2026](https://developer.apple.com/forums/thread/838231)

**What a button tap can do (ShieldActionDelegate / ShieldActionResponse)**
- Handlers: `handle(action:for: ApplicationToken, completionHandler:)`, `handle(action:for: ActivityCategoryToken, ...)` and `handle(action:for: WebDomainToken, ...)`. — [Apple Docs: ShieldActionDelegate](https://developer.apple.com/documentation/managedsettings/shieldactiondelegate)
- `ShieldActionResponse` cases: `.close` ("close the current application or web browser"), `.defer` ("defer a response to the action"), `.none` ("doesn't need to take any additional action"), and `.openParentalControlsApp` ("open your parental controls app that is responsible for shielding the application or web browser"). — [Apple Docs: ShieldActionResponse](https://developer.apple.com/documentation/managedsettings/shieldactionresponse)
- `.openParentalControlsApp` availability is iOS 26.5+ / iPadOS 26.5+. The page has no discussion text and does not say whether it works with `.individual` authorization. — [Apple Docs: openParentalControlsApp](https://developer.apple.com/documentation/managedsettings/shieldactionresponse/openparentalcontrolsapp)
- **Conflict:** an Oct 2026 developer article says Apple DTS states no API lets a shield extension launch its parent app. It lists only `.none`, `.close` and `.defer`, and reports that `NSExtensionContext().open(url)` did nothing in the author's September 2026 device testing. — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e). In July 2026 an Apple DTS engineer wrote that "Launching an app without user interaction violates all user policies". The same reply says iOS has no supported self-foregrounding, Family Controls grants no exception, and there is no app-open callback (no NSUserActivity, URL scheme, App Intent or Live Activity hook). Shortcuts automations are "solely for the user's own use," and APNs push can only wake the app in the background. — [Apple Forums thread 838231, Jul 2026](https://developer.apple.com/forums/thread/838231). None of these sources mentions `.openParentalControlsApp`.

**History and workarounds**
- In Oct 2024 an Apple Frameworks Engineer wrote: "There is not a supported way to do this. Some apps may have figured out ways to call up private API that should be rejected in App Review." In May 2025 the developer of one sec relayed DTS saying that private API exists and works, risks account termination, and that some apps have used it for years. `UIApplication.shared.open` and `NSExtensionContext` are unavailable in the delegate. WellSpent sells an SDK and app that opens the parent app from the shield, mechanism unknown. — [Apple Forums thread 766644](https://developer.apple.com/forums/thread/766644)
- one sec ("Doom Scroll Emergency Brake") currently uses a notification flow. The user must allow notifications, exempt them from AI prioritization (otherwise they arrive about 10 s late), allow them during Focus modes, and then tap them. The developer asked for `ShieldActionResponse.openParentApp` and has filed FB22347946, FB18846650, FB15500681, FB15079668 and FB10393561 without responses. — [Apple Forums thread 820790, Mar 2026](https://developer.apple.com/forums/thread/820790)
- Notification workaround as one developer implements it: the ShieldConfiguration extension posts a debounced local notification when the shield is shown. The user taps it, the app reads the payload from the App Group, and the app clears the notification when it opens. — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- Shortcuts workaround (one sec): the user manually creates one Personal Automation per app with the "App is opened" trigger and "Run Immediately" on, running the "Activate one sec (when app opens)" action. one sec separately uses Screen Time permission to shield apps such as Shortcuts, which helps stop users from disabling the automation. — [one sec help: Initial Setup iOS 17+](https://feedback.one-sec.app/help/articles/3470183). An app cannot create these automations itself. — [Apple Forums thread 838231](https://developer.apple.com/forums/thread/838231)

### Inferences
- The AI conversation cannot happen on the shield. The shield is a static snapshot with no text input and only labels, two buttons and a three-item submenu. It must happen in the host app.
- Suggested flow: a shield on Instagram reads "Tell the coach why you need it". On iOS 26.5+, the primary button returns `.openParentalControlsApp` if a device test shows it works with individual authorization. Otherwise, the extension posts a local notification and returns `.close` or `.none`. The user taps the notification and the host app opens to the AI chat. The submenu could offer fixed choices such as "I need to message someone", which the host app later checks.
- Do not use private API to open the app. Apple has said App Review should reject it, and it risks account termination.

### Gaps
- I found no developer report, sample code or WWDC session confirming how `.openParentalControlsApp` behaves. Open questions: does it work for `.individual` authorization, can the app tell which token triggered it, and is it limited to some deployment configuration? This needs testing on a real device running iOS 26.5 or later.
- I found no engineering write-ups from Opal, ScreenZen, Jomo or Brick on their shield-to-app flow. The one sec details come from the developer's own forum posts.

---

## 3. Temporary unlocks (N minutes) and re-locking, plus reliability

### Takeaway
The usual pattern has four steps. The host app removes the shield, either by deleting tokens from the store or, on iOS 26.5+, by setting `isActive = false` on a named store. It then starts a `DeviceActivitySchedule` and/or a `DeviceActivityEvent` usage threshold. When `intervalDidEnd` or `eventDidReachThreshold` fires, the `DeviceActivityMonitor` extension re-applies the shield, because the host app is usually suspended by then. Schedules must be at least 15 minutes long and at most 20 activities can be monitored. iOS 26 brought serious reliability bugs (phantom and early thresholds), so a defensive design is required.

### Cited Findings
- DeviceActivity features: `DeviceActivitySchedule` ("calendar-based schedule"), `DeviceActivityEvent` (an app, category or website activity threshold), `DeviceActivityName`, `DeviceActivityCenter` (starts monitoring) and `DeviceActivityMonitor` (the extension principal class). — [Apple Docs: Device Activity](https://developer.apple.com/documentation/deviceactivity)
- `MonitoringError` cases: `excessiveActivities` ("monitoring too many activities"), `intervalTooLong`, `intervalTooShort`, `invalidDateComponents` and `unauthorized`. — [Apple Docs: MonitoringError](https://developer.apple.com/documentation/deviceactivity/deviceactivitycenter/monitoringerror)
- The callbacks (`intervalDidStart`, `intervalDidEnd`, `eventDidReachThreshold` and the warning variants) run in the extension, not the app. The app is usually suspended or killed by the time a limit is reached, so the monitor extension re-applies the shield. — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- Schedule behavior one developer observed:
  - Schedules shorter than 15 minutes are rejected.
  - A non-repeating schedule that starts "now" gets booked for the next day, so backdate the start.
  - A schedule that already contains the current time starts immediately.
  - Full year/month/day components made callbacks unreliable.
  - Calling `stopMonitoring`, or calling `startMonitoring` again on a running name, triggers `intervalDidEnd`. That can re-shield apps by mistake. The fix is to clear actions first and add a `neverTriggerBefore` timestamp.

  — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- `includesPastActivity: false` (iOS 17.4+, the default) ignores usage from before the event was registered. DeviceActivity has no call to query usage. To meter usage, the author registers one threshold event per 15 s of use. — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- Monitors are capped at 20 at once. — [GitHub: react-native-device-activity](https://github.com/kingstinct/react-native-device-activity)
- `ManagedSettingsStore.isActive` (iOS 26.5+): "An inactive store is not included in the effective settings calculation. Defaults to true." Other store methods are `clearAllSettings()` and `deleteStore()`. — [Apple Docs: isActive](https://developer.apple.com/documentation/managedsettings/managedsettingsstore/isactive); [Apple Docs: ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore)
- With `secondaryButtonSubmenuItems` (iOS 26.4+), Apple itself suggests "1 more minute / 15 more minutes / 1 more hour" choices on the shield. — [Apple Docs: secondaryButtonSubmenuItems](https://developer.apple.com/documentation/managedsettingsui/shieldconfiguration/secondarybuttonsubmenuitems)

**Reliability issues**
- iOS 26 "phantom thresholds": `eventDidReachThreshold` fires with no real usage (forum threads 809410, 811305, 814559). It was reportedly fixed in a 26.5 beta, but reports continued. Later sub-minute thresholds were also missed during intermittent use. The author's guards:
  - Ignore thresholds that fire sooner than wall-clock time allows.
  - Treat a burst of thresholds within about 3 s as a phantom.
  - Re-arm the monitor each time the app goes to the background.

  — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- A developer reports `eventDidReachThreshold` arriving within minutes of starting to monitor, despite a high usage limit, on iOS 26.2 and 26.3. — [Apple Forums thread 812472](https://developer.apple.com/forums/thread/812472)
- An iOS 26 report says threshold events fire immediately and incorrectly (thread 808470). Apple DTS did not address it. — [Apple Forums thread 838231, Jul 2026](https://developer.apple.com/forums/thread/838231)
- Other reports describe severe inconsistencies, such as DeviceActivity not firing and impossible usage data. — [Apple Forums thread 819997](https://developer.apple.com/forums/thread/819997)
- One blog says iOS 27 left long-standing blocker requests unaddressed: reliable long-running monitoring, readable shield state, and event-based unlock triggers. — [HabitDoom blog: iOS 27 Screen Time changes](https://habitdoom.com/blog/ios-27-screen-time-changes). This is a third-party, unverified source.

### Inferences
- A 5-minute unlock could work like this. Approval removes Instagram's token, or deactivates the named store holding it. The app then calls `startMonitoring` with a schedule of 15 minutes or more starting now (backdated), plus a `DeviceActivityEvent` for that token with a 5-minute threshold. `eventDidReachThreshold` and, as a backstop, `intervalDidEnd` both re-shield. The 15-minute minimum means an unlock shorter than 15 minutes must use a usage threshold, not a schedule.
- Usage thresholds count only time spent in the app. A "5 minutes" unlock could last longer in wall-clock time if the user switches away. The team should decide whether that is acceptable.
- Because of the iOS 26 phantom-threshold bugs, the re-lock code should be idempotent. A re-shield that fires too early only ends the unlock early. That is safer than failing to re-lock.

### Gaps
- I found no Apple statement confirming the 15-minute minimum, the 20-activity cap, or the fix status of the phantom thresholds in iOS 26.5 or 27. These come from developer reports.
- I did not test whether `isActive` toggling from the monitor extension takes effect immediately.

---

## 4. DeviceActivityReport: available usage data and its privacy sandbox

### Takeaway
`DeviceActivityReport` (iOS 16+) is a SwiftUI view rendered by your report extension. It can show per-app, per-category and per-domain usage, filtered by date segment, user and device. The extension's sandbox blocks network requests and blocks moving data out. Usage data therefore cannot normally be sent to a server or to a cloud AI. The exception is the EU-only `approvedWithDataAccess` path on iOS 26.4+.

### Cited Findings
- "When you create a report, the system asks your app's device activity report extension to provide a View representing the user's device activity. To protect the user's privacy, your extension runs in a sandbox. This sandbox prevents your extension from making network requests or moving sensitive content outside the extension's address space." The extension point is `com.apple.deviceactivityui.report-extension`. — [Apple Docs: DeviceActivityReport](https://developer.apple.com/documentation/deviceactivity/deviceactivityreport)
- Filters use `DeviceActivityFilter(segment: .daily/.hourly/.weekly(during:), users: .children / ..., devices: [.iPhone, .iPad], applications:, categories:, webDomains:)` with a custom `DeviceActivityReport.Context`. Data is provided only if the user authorized Family Controls on their own device or on a child's device. — [Apple Docs: DeviceActivityReport](https://developer.apple.com/documentation/deviceactivity/deviceactivityreport)
- Related types: `DeviceActivityReportExtension`, `DeviceActivityReportScene`, `DeviceActivityData` ("Activity data for a person on a specific device") and `DeviceActivityResults` ("asynchronous sequence of filtered device activity results"). — [Apple Docs: Device Activity](https://developer.apple.com/documentation/deviceactivity)
- Developers report that every way out fails from the report extension. App Group UserDefaults writes are silently dropped, file writes fail with EPERM, HTTP is blocked, and local notifications and pasteboard writes also fail. Reading from the App Group works. One developer got per-app usage out to the host app and reported it to Apple Security, which closed the report as "expected behavior". — summary of [Apple Forums thread 809823](https://developer.apple.com/forums/thread/809823) and [thread 736351](https://developer.apple.com/forums/thread/736351), from search-result excerpts.
- Another developer asked what "address space" covers, for example how Opal lets users tag apps as distracting. The thread got no answer. — [Apple Forums thread 795661, Aug 2025](https://developer.apple.com/forums/thread/795661)
- The EU path: with the `app-and-website-usage` entitlement and `approvedWithDataAccess`, the app can read real bundle IDs, visited domains and category names through `FamilyActivityData` (iOS 26.4+, EU customers only). — [Apple Docs: FamilyActivityData](https://developer.apple.com/documentation/familycontrols/familyactivitydata); [Apple Docs: entitlement](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.family-controls.app-and-website-usage)

### Inferences
- The AI agent cannot be given "you spent 2 h on TikTok today" from DeviceActivityReport outside the EU. Two workarounds stay within the rules. The app can show the report to the user, who then self-reports to the AI. Or the app can use its own counters from monitor threshold events that it created, such as "unlock #3 today, 15 min used". It knows those counts because it set the thresholds, without reading Apple's usage data.
- An on-device model (Foundation Models) avoids sending the user's explanation off the device. It still cannot read report data, because the report extension's data cannot leave it.

### Gaps
- No Apple doc confirms the reported 100 MB memory limit for the report extension. It appeared in search snippets only.
- The documented status of the "host app can reconstruct usage" behavior that Apple Security called expected is unclear.

---

## 5. Extension sandbox limits: memory, network, App Group sharing

### Takeaway
All four extension types share data with the host app only through an App Group. Apple documents that the ShieldConfiguration and DeviceActivityReport extensions cannot make network requests. Developers report the DeviceActivityMonitor extension has a 6 MB memory limit. I found no documented network ban for the monitor or shield-action extensions, and the evidence there conflicts. Do heavy work, AI calls and networking in the host app.

### Cited Findings
- ShieldConfigurationDataSource: "your extension runs in a sandbox. This sandbox prevents your extension from making network requests or moving sensitive content outside the extension's address space." — [Apple Docs: ShieldConfigurationDataSource](https://developer.apple.com/documentation/managedsettingsui/shieldconfigurationdatasource)
- DeviceActivityReport has the same sandbox wording. — [Apple Docs: DeviceActivityReport](https://developer.apple.com/documentation/deviceactivity/deviceactivityreport)
- The ShieldActionDelegate doc has no sandbox or network statement. — [Apple Docs: ShieldActionDelegate](https://developer.apple.com/documentation/managedsettings/shieldactiondelegate)
- DeviceActivityMonitor memory: a developer feedback post (FB22279215) says the 6 MB cap has existed since iOS 15 and never changed. Developers report the extension being killed under memory pressure and threshold callbacks arriving bunched together. — [Apple Forums thread 823431](https://developer.apple.com/forums/thread/823431); [thread 760474](https://developer.apple.com/forums/thread/760474); [thread 827783](https://developer.apple.com/forums/thread/827783)
- Monitor network access, conflicting reports:
  - react-native-device-activity's `configureActions` offers background callbacks "such as web requests or notifications", which implies the monitor extension can make network calls. — [GitHub: react-native-device-activity](https://github.com/kingstinct/react-native-device-activity)
  - One forum poster says the DeviceActivityMonitor extension has the same write restriction as the report extension. — summary of [Apple Forums thread 809823](https://developer.apple.com/forums/thread/809823)
- The App Group is the only channel between the app and its extensions, which rarely run at the same time. Extensions call `CFPreferencesAppSynchronize` before reading shared preferences. — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- Core Data fetches from an App Group store inside the ShieldConfiguration extension caused the default shield to appear. An Apple DTS engineer pointed to the sandbox as a likely cause. — [Apple Forums thread 762431](https://developer.apple.com/forums/thread/762431), from a search-result excerpt.
- The ShieldConfiguration extension must return quickly, or the system shows the default shield. — [Apple Docs: ShieldConfigurationDataSource](https://developer.apple.com/documentation/managedsettingsui/shieldconfigurationdatasource)

### Inferences
- Keep the extensions tiny. Precompute the shield text, such as "You've unlocked Instagram 3 times today", in the host app and write it to App Group UserDefaults. Read it with plain UserDefaults rather than Core Data or SwiftData in the shield extension.
- The AI agent, whether on-device or a cloud API, must run in the host app. It will not fit in a 6 MB monitor extension, and shield and report extensions cannot reach the network.

### Gaps
- I found no Apple-documented memory limits for any of the four extension types. The 6 MB figure comes from developers.
- I could not confirm from Apple whether `URLSession` works in DeviceActivityMonitor or ShieldActionDelegate extensions.

---

## 6. Entitlements, authorization types, and distribution (and the hardware needed)

### Takeaway
You need a paid Apple Developer Program team. Free Personal Teams do not get the Family Controls capability. The development entitlement lets you build and run on a real iPhone from Xcode. App Store and TestFlight distribution needs a separate "Family Controls (Distribution)" approval, requested by the Account Holder for the app and each extension's bundle ID. Approvals have taken from days to more than a month. Self-blocking uses `.individual` authorization (iOS 16+), confirmed with Face ID or Touch ID. The Simulator is effectively unusable for this API, so plan on a Mac with Xcode and a physical iPhone.

### Cited Findings
**Authorization**
- `FamilyControlsMember` (iOS 16+) has two cases. `.child`: "a parent or guardian must enter their authorization credentials". `.individual`: "the user can enter their authorization credentials." — [Apple Docs: FamilyControlsMember](https://developer.apple.com/documentation/familycontrols/familycontrolsmember)
- "Authorizing parental controls for an individual requires approval from the owner of the device. The system displays a biometric authentication alert". For a child, a parent in the same Family Sharing group must approve. A child-authorized app cannot be deleted by the child, and the child can't sign out of iCloud. In iPhone and iPad apps running on visionOS, authorization "always fail[s]". — [Apple Docs: Family Controls](https://developer.apple.com/documentation/familycontrols)
- Individual authorization asks for Face ID or Touch ID the first time; later calls don't ask again. Authorization can be revoked with `revokeAuthorization(completionHandler:)`. — [Apple Docs: AuthorizationCenter](https://developer.apple.com/documentation/familycontrols/authorizationcenter.md), from a search-result excerpt.
- Under `.individual`, nothing in the API stops the user from deleting the app or revoking access in Settings. The anti-deletion protection is described only for children. — [Apple Docs: Family Controls](https://developer.apple.com/documentation/familycontrols). This is my reading of the doc; it does not say this explicitly.

**Entitlement and distribution**
- "You must add the Family Controls capability to your app before you call `requestAuthorization(for:)`... Before submitting your app to the App Store, you must request permission to use the entitlement" at developer.apple.com/contact/request/family-controls-distribution. — [Apple Docs: Family Controls](https://developer.apple.com/documentation/familycontrols)
- "Your Apple Developer Account Holder must request permission". If the app has a Device Activity Monitor, Device Activity Report, Shield Action or Shield Configuration extension, "submit the same request for the extension." You can also use the Capability Requests tab in Certificates, Identifiers & Profiles. After approval the capability shows "Assigned". Check that Provisioning Support lists every distribution method you need. With automatic signing, Xcode switches the development capability to distribution. — [Apple Docs: Requesting the Family Controls entitlement](https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement)
- One developer's app needed four requests: the app plus three extensions. Approvals aren't instant, so file them all on day one. — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- Reported approval times vary: about 3 weeks, "quick", and 31 and 33 days on two accounts. Support could not check status, and some requests sat at "submitted" for weeks. Extensions can be approved separately from the app. — [Apple Forums thread 820811](https://developer.apple.com/forums/thread/820811); [thread 824726](https://developer.apple.com/forums/thread/824726); [thread 826743](https://developer.apple.com/forums/thread/826743)
- Even after approval, the capability can be missing from profiles or hidden under "Additional Capabilities". — [Apple Forums thread 716853](https://developer.apple.com/forums/thread/716853); [thread 829311](https://developer.apple.com/forums/thread/829311)
- Free Personal Team: an Apple DTS engineer said the capability "should show up if you're a member of a paid team" and suspected free provisioning, because Personal Teams have "significant limitations and this is one of them". — [Apple Forums thread 764682](https://developer.apple.com/forums/thread/764682) / [thread 735123](https://developer.apple.com/forums/thread/735123). This came from a search excerpt; I did not identify which of the two threads holds the DTS quote.
- Until the distribution entitlement covers every bundle ID, you can only make local Xcode development builds. Expo Dev Client and EAS builds aren't possible. — [GitHub: react-native-device-activity](https://github.com/kingstinct/react-native-device-activity)
- App Store Connect rejects builds made with an SDK older than iOS 26 (ITMS-90725). — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)

**Simulator and hardware**
- On the iOS 26 Simulator, the prompt and picker appear, but authorization never completes, the picker is empty, and the monitor never runs. Unauthorized ManagedSettings calls triggered a passcode prompt. — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- flutter_family_controls requires iOS 16+ on a real device and states the Simulator is not supported. — [pub.dev: flutter_family_controls](https://pub.dev/documentation/flutter_family_controls/latest/)

### Inferences
- For a student team on Windows, the minimum setup is:
  - A paid developer team. A university team account may be an option.
  - Access to a Mac with Xcode 26 or later.
  - At least one physical iPhone running iOS 16+, ideally iOS 26.5+ to try `.openParentalControlsApp` and `isActive`.
- A class demo can run on a development-signed device with only the development entitlement. TestFlight and the App Store need the distribution approval for all four bundle IDs, which can take a month or more, so request it early.
- What Apple reviews for approval is not public. The request form asks about the app's use case. Describing it clearly as a self-control (individual) app is the natural framing, but this is unverified.

### Gaps
- I found no Apple doc listing the criteria for distribution approval, or stating whether student or academic projects get special treatment.
- I found no official Apple statement on Simulator support for Family Controls.
- I did not check whether development builds with the Family Controls entitlement can be installed on teammates' devices without the distribution entitlement (ad-hoc distribution).

---

## 7. Changes by iOS version (16 to 27), and on-device AI (Foundation Models)

### Takeaway
The core design has changed little since iOS 16: tokens, shields, a monitor extension, and a report extension. iOS 26.4 and 26.5 brought the first meaningful changes for blocker apps:
- Shield submenu items (iOS 26.4)
- EU-only de-tokenized data (iOS 26.4)
- `.openParentalControlsApp` (iOS 26.5)
- `isActive` stores (iOS 26.5)
- Token expiry and refresh (iOS 26.5)

iOS 27 (released 14 Sep 2026) redesigned Screen Time for parents, but third-party sources say the developer frameworks did not change. Foundation Models (iOS 26+) offers a free on-device LLM with tool calling. In iOS 27 it also routes to Private Cloud Compute and to third-party providers such as Claude and Gemini.

### Cited Findings
**Timeline of Screen Time API changes**
- **iOS 15 (2021):** Family Controls, ManagedSettings and DeviceActivity introduced. — [WWDC Notes, WWDC21](https://wwdcnotes.com/notes/wwdc21/10123). ShieldConfiguration, ShieldAction and ShieldActionDelegate are iOS 15+. — [Apple Docs: ShieldConfiguration](https://developer.apple.com/documentation/managedsettingsui/shieldconfiguration); [Apple Docs: ShieldActionDelegate](https://developer.apple.com/documentation/managedsettings/shieldactiondelegate)
- **iOS 16 (2022):** `FamilyControlsMember` with `.individual` arrived (iOS 16+), so people can authorize the API for themselves. — [Apple Docs: FamilyControlsMember](https://developer.apple.com/documentation/familycontrols/familycontrolsmember). `DeviceActivityReport` is iOS 16+. — [Apple Docs: DeviceActivityReport](https://developer.apple.com/documentation/deviceactivity/deviceactivityreport)
- **iOS 17:** `DeviceActivityAuthorization` (also macOS 14), with `authorizedClientIdentifiers`, `isOverridden` and `sharingEnabled`. It has no doc text. — [Apple Docs: DeviceActivityAuthorization](https://developer.apple.com/documentation/deviceactivity/deviceactivityauthorization)
- **iOS 17.4:** `includesPastActivity` for events (default false). — [dev.to, Willheim](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- **iOS 18:** I found no Screen Time API changes in my sources (see Gaps).
- **iOS 26:** `ManagedSettingsStore` became available on tvOS 26. — [Apple Docs: ManagedSettingsStore](https://developer.apple.com/documentation/managedsettings/managedsettingsstore). Phantom and early threshold bugs began around iOS 26.x. — [Apple Forums thread 812472](https://developer.apple.com/forums/thread/812472); [dev.to](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- **iOS 26.4:**
  - `ShieldConfiguration.secondaryButtonSubmenuItems` and the three `...SubmenuItemPressed` actions. — [Apple Docs](https://developer.apple.com/documentation/managedsettingsui/shieldconfiguration/secondarybuttonsubmenuitems)
  - `FamilyActivityData` (EU only). — [Apple Docs](https://developer.apple.com/documentation/familycontrols/familyactivitydata)
  - The `app-and-website-usage` entitlement and `approvedWithDataAccess`. — [Apple Docs](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.family-controls.app-and-website-usage)
- **iOS 26.5:**
  - `ShieldActionResponse.openParentalControlsApp`. — [Apple Docs](https://developer.apple.com/documentation/managedsettings/shieldactionresponse/openparentalcontrolsapp)
  - `ManagedSettingsStore.isActive`. — [Apple Docs](https://developer.apple.com/documentation/managedsettings/managedsettingsstore/isactive)
  - `ManagedSettingsStore.TokenExpiryMessage` and token `refresh`. — [Apple Docs](https://developer.apple.com/documentation/managedsettings/managedsettingsstore/tokenexpirymessage)
- **iOS 27 (released 14 Sep 2026):** consumer and parental features:
  - Time Allowances by category (Entertainment, Games, Social Media) and custom categories
  - Day-of-week schedules
  - Temporary pause and limited-time grants
  - Ask to Browse in Safari
  - Contact approval
  - A redesigned Screen Time architecture that syncs faster; every device in the family must run version 27

  — [9to5Mac, 14 Sep 2026](https://9to5mac.com/2026/09/14/heres-whats-new-with-parental-control-features-in-ios-27-ipados-27-and-macos-27/)
- **iOS 27, developer side:** one blog says FamilyControls and ManagedSettings are unchanged and that iOS 27 added PermissionKit (which powers Ask to Browse) and the Declared Age Range API. — [HabitDoom](https://habitdoom.com/blog/ios-27-screen-time-changes). Apple's WWDC26 iOS developer guide does not mention Screen Time, Family Controls, Managed Settings, Device Activity, PermissionKit or Declared Age Range. — [Apple WWDC26 iOS guide](https://developer.apple.com/wwdc26/guides/ios/). **Possible conflict:** Apple's June 2025 newsroom post tied Declared Age Range to the iOS 26 cycle, not iOS 27. — [Apple Newsroom, Jun 2025](https://www.apple.com/newsroom/2025/06/apple-expands-tools-to-help-parents-protect-kids-and-teens-online/) (seen as a search excerpt).

**On-device AI: Foundation Models framework**
- `SystemLanguageModel` (iOS/iPadOS/macOS/visionOS 26.0+) is "the on-device text foundation model that powers Apple Intelligence." It has three model versions so far: 26.0–26.3, 26.4 and 27.0. Before use, check `availability`: `.available`, `.unavailable(.deviceNotEligible)` or `.unavailable(.modelNotReady)`. It exposes `contextSize`, `tokenCount(for:)`, `supportedLanguages` and `Guardrails`. — [Apple Docs: SystemLanguageModel](https://developer.apple.com/documentation/foundationmodels/systemlanguagemodel)
- The framework has `LanguageModelSession`, `Instructions`, `@Generable` guided generation (the model fills a typed Swift struct) and the `Tool` protocol (the model calls app functions). "To use Apple Foundation Models, people need a device that supports Apple Intelligence." Newer additions (WWDC26):
  - `PrivateCloudComputeLanguageModel`, which needs the `com.apple.developer.private-cloud-compute` entitlement
  - Dynamic profiles
  - Multimodal image prompts
  - A custom `LanguageModel` provider protocol
  - Running Core AI models

  — [Apple Docs: Foundation Models](https://developer.apple.com/documentation/foundationmodels)
- iOS 27: "You can now work with any language model, including Apple Foundation Models, cloud models like Claude and Gemini, or any other provider that conforms to the Language Model protocol." Apps in the App Store Small Business Program with fewer than 2 million first-time downloads "can access the next generation of Apple Foundation Models running on Private Cloud Compute at no cloud API cost." — [Apple WWDC26 iOS guide](https://developer.apple.com/wwdc26/guides/ios/)
- Third-party reports put the on-device context window at 4,096 tokens, shared by instructions, history, tool output and the prompt. Overflowing it throws `.exceededContextWindowSize`. — [InfoQ, Mar 2026](https://infoq.com/news/2026/03/apple-foundation-models-context). These are third-party figures; Apple exposes `contextSize` at runtime instead.
- Gemini is available through the Firebase Apple SDK using the same API surface. — [Fonearena, WWDC26](https://www.fonearena.com/blog/484623/apple-wwdc26-foundation-models-gemini-support-xcode-27-agentic-coding-tools.html)

### Inferences
- The "explain your reason" agent could run free and on-device with `LanguageModelSession`:
  - `Instructions` define the coach persona.
  - A `@Generable struct UnlockDecision { approve: Bool; minutes: Int; reason: String }` gives a structured verdict.
  - A `Tool` could read the app's own unlock history from the App Group.
- The agent works only on Apple Intelligence–capable iPhones, so the app needs a fallback for other devices. Options are a cloud LLM called from the host app, or the iOS 27 provider protocol with Claude or Gemini. The agent must run in the host app, not in an extension.
- A short context window favors a few short turns plus a structured decision over a long conversation.

### Gaps
- I did not verify the Apple Intelligence device list or the minimum iPhone model.
- I found no Apple doc on running Foundation Models inside app extensions. Given the 6 MB monitor limit, it is unlikely to work there.
- iOS 18: I found no sourced list of Screen Time API changes. Older Apple "Updates" pages returned 404.
- I could not get Apple's developer release notes for iOS 26.4, 26.5 or 27 with the Screen Time items listed, or WWDC25/WWDC26 session transcripts on Screen Time. Many availability labels above therefore come only from doc metadata.

---

## 8. Can the Screen Time API block only part of an app (e.g. Instagram Reels)?

### Takeaway
No. Shields apply to a whole app (by `ApplicationToken` or by category) or to a web domain. No API reaches inside another app, so Reels or Shorts cannot be blocked inside the native Instagram or YouTube apps. Blockers that claim to do this use a web wrapper or browser extension, or they run on Android, which has Accessibility services that iOS lacks.

### Cited Findings
- Every shield target in the API is an `Application`, `ActivityCategory` or `WebDomain`. There is no finer-grained target. — [Apple Docs: ShieldConfigurationDataSource](https://developer.apple.com/documentation/managedsettingsui/shieldconfigurationdatasource); [Apple Docs: ShieldActionDelegate](https://developer.apple.com/documentation/managedsettings/shieldactiondelegate)
- AppBlock: "When you block Instagram, the whole app is blocked — not just Reels. Apple doesn't provide APIs that allow third-party apps to control what happens inside another app." — [AppBlock blog](https://appblock.app/can-appblock-block-instagram-reels-youtube-shorts-or-snapchat-stories-on-iphone/)
- Opal's team said in its community forum that it cannot block at this level of detail (Reels, YouTube Shorts) because of the Screen Time API. — [Opal Community: subdomain blocking](https://community.opal.so/t/subdomain-blocking-youtube-shorts-facebook-business-instagram-reels/1015); [Opal Community: Blocking Instagram Reels](https://community.opal.so/t/blocking-instagram-reels-feature-request/6808)
- Dull runs Instagram in its own browser view and removes Reels as the page renders, noting that iOS doesn't let third-party apps modify the official Instagram app. — [Dull: Block Reels on iPhone](https://getdull.app/block-reels-iphone/)
- Android blockers such as YourHour use the Accessibility Service to detect Reels and Shorts, which iOS doesn't offer. — search-result summary of the YourHour listing; [APKMirror: YourHour 4.2.36](https://www.apkmirror.com/apk/mindefy-labs/yourhour-screentime-app/yourhour-screen-time-control-4-2-36-release/)

### Inferences
- The wrapper app could shield the native Instagram app completely and offer an in-app web view of instagram.com with Reels hidden by injected CSS/JS, as Dull does. That is a different technique from the Screen Time API, and it may run into Instagram's terms of service and web view limits.

### Gaps
- I found no Apple statement explicitly ruling out in-app feature blocking. The conclusion follows from the API surface plus vendor statements.

---

## 9. Cross-platform: React Native, Flutter and Capacitor

### Takeaway
React Native/Expo is the most mature option, through `react-native-device-activity` (kingstinct). It wraps the picker, shields, shield actions, monitoring and web filtering, and ships an Expo config plugin that generates the three extension targets. Flutter has early-stage plugins, and most teams end up writing a native Swift bridge. I found no maintained Capacitor plugin. Whatever the framework, the extensions themselves are native Swift targets.

### Cited Findings
- `react-native-device-activity` features:
  - Pickers: `DeviceActivitySelectionView`, `DeviceActivitySelectionSheetView`, persisted variants keyed by `familyActivitySelectionId`, and a `useDeviceActivityPicker` hook
  - Monitoring: `startMonitoring`, `stopMonitoring`, events and `onDeviceActivityMonitorEvent`
  - Shields: `updateShield` (title, subtitle, colors, icon, blur), `ShieldActions`, `blockSelection` and `unblockSelection`
  - Background actions: `configureActions`
  - Web filtering: `setWebContentFilterPolicy`
  - Storage: `userDefaultsSet` / `userDefaultsGet`

  Expo setup: the plugin takes `appleTeamId` and `appGroup`, then `npx expo prebuild` creates `ActivityMonitorExtension`, `ShieldAction` and `ShieldConfiguration`. Known limitations:
  - At most 20 monitors.
  - The shield can't always tell which selection an event belongs to.
  - The SwiftUI picker can crash with large categories.
  - Event listeners work only while the app is running.
  - `getAuthorizationStatus` can return `notDetermined` incorrectly.

  — [GitHub: kingstinct/react-native-device-activity](https://github.com/kingstinct/react-native-device-activity)
- Practical notes from a production app using v0.6.1:
  - `expo prebuild` overwrites custom extension sources unless `copyToTargetFolder: false` is set.
  - `blockSelection` adds to the blocklist, so call `resetBlocks()` first.
  - Activity and event names must not contain underscores.
  - With EAS, declare extensions under `extra.eas.build.experimental.ios.appExtensions`.

  — [dev.to, Willheim, Oct 2026](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)
- Flutter options:
  - `flutter_family_controls` 0.0.3 handles authorization, the native picker and ManagedSettings restrictions. It needs iOS 16+ on a real device and comes from an unverified publisher. — [pub.dev: flutter_family_controls](https://pub.dev/documentation/flutter_family_controls/latest/)
  - `app_blocker` uses a Screen Time Shield on iOS and a custom block screen on Android. — [pub.dev: app_blocker](https://pub.dev/packages/app_blocker)
  - `screen_time_api_ios` is minimal. — [pub-web mirror: screen_time_api_ios](https://pub-web-s1.flutter-io.cn/documentation/screen_time_api_ios/0.0.4)
  - A guide recommends a custom MethodChannel bridge to Swift, with all targets in one App Group. — [dev.to: Flutter Screen Time app](https://dev.to/eniolaajani/building-a-custom-screen-time-flutter-app-with-ios-native-apis-4k9f)
- There is no sanctioned Android equivalent. HonorFit's Android version uses a `specialUse` foreground service, polls `UsageStatsManager`, and draws a `TYPE_APPLICATION_OVERLAY` lock screen. — [dev.to, Willheim](https://dev.to/twillywill/the-ios-screen-time-api-in-2026-what-apples-docs-dont-tell-you-151e)

### Inferences
- A team that already knows JavaScript could build the AI chat UI in React Native/Expo with react-native-device-activity. They would still need a Mac and Xcode for development-entitlement builds until Apple grants distribution approval.
- If the team uses Foundation Models for the agent, it needs a small native Swift module. That makes the case for a native SwiftUI app stronger.

### Gaps
- Capacitor/Ionic: I found no maintained plugin for FamilyControls or ManagedSettings in my searches.
- I could not confirm whether react-native-device-activity exposes `.openParentalControlsApp` (iOS 26.5) or `secondaryButtonSubmenuItems` (iOS 26.4). Its README, as fetched, does not mention them.
