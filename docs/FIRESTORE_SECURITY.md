# Firestore security

## Roles and permissions

Roles are stored in `users/{uid}.role` and must be `student`, `president`, or
`admin`. Rules verify the authenticated Firebase UID against the profile.

| Data | Student | President | Admin |
| --- | --- | --- | --- |
| Read clubs, events, announcements | Any | Any | Any |
| Create clubs | No | No | Yes |
| Update clubs | No | Assigned club | Yes |
| Delete clubs | No | No | Yes |
| Create events and announcements | No | Assigned club | Yes |
| Update/delete events and announcements | No | Assigned club | Yes |
| Memberships | Own join/leave | View assigned club | View all clubs |
| Event registrations | Own register/cancel | Own only | Manage |
| Bookmarks | Own records | Own records | Own records |
| Read all profiles | No | No | Yes |
| Update profile fields | Own permitted fields | Own permitted fields | Permitted fields; president assignments only through a consistent atomic club/profile write |

## Collections and ownership

- `users/{uid}` stores `uid`, `fullName`, `studentId`, `email`, `programme`,
  `department`, `semester`, `phone`, `role`, `createdAt`, and `updatedAt`;
  `presidentOf` is optional.
- `clubs/{clubId}` stores descriptive fields, `presidentId`, `memberCount`, and
  timestamps. Memberships are `clubs/{clubId}/members/{uid}`.
- `events/{eventId}` stores event fields and `clubId`.
- `eventRegistrations/{uid}_{eventId}` stores `userId`, `eventId`, and
  `registeredAt`.
- `announcements/{id}` stores `title`, `message`, `clubId`, `createdBy`, and
  `createdAt`.
- `bookmarks/{uid}_{itemType}_{itemId}` stores `userId`, `itemId`, `itemType`,
  and `createdAt`.

President access requires all three values to agree: the profile role is
`president`, `users/{uid}.presidentOf` equals the club ID, and
`clubs/{clubId}.presidentId` equals the authenticated UID. Admins can assign a
student to a club through the app's atomic batch: the club reference and the
student's role/club profile must agree in the batch's after-state. Rules reject
partial assignments and require the previous president to be demoted in the
same batch when replaced. Admin role provisioning still requires a trusted
Admin SDK workflow. Ordinary clients cannot change another user's role or
president assignment.

## Limitations to review

Club member counts are stored in `clubs/{clubId}.memberCount`. Joining and
leaving now update that value in the same transaction as the caller's membership
document. Rules permit member-list queries only to administrators and the
assigned club president. Collection-group queries are limited to the caller's
own memberships, except for administrators.

The existing repository created clubs with `memberCount: 0` but never updated
the field when members joined or left. Before deploying these rules, backfill
each existing club's `memberCount` from its `members` subcollection using a
trusted Admin SDK process. Until that backfill is done, counts for previously
joined students can be stale, and a leave operation for a club whose stored
count is zero will be rejected by the rules.

The app currently supports students joining/leaving themselves and presidents
viewing assigned-club members. It has no client workflow for an administrator
or president to add/remove another member; the rules do not permit those
operations. Add a trusted, count-aware management flow before enabling such
operations.

Deleting a club document does not delete its membership subcollection. The
admin client currently deletes only the club document, so related-data cleanup
needs a trusted deletion workflow.

## Emulator

`firebase.json` points the Firestore Emulator at `firestore.rules` on port 8080.
Start it with:

```sh
npx firebase-tools emulators:start --only firestore --project demo-studentclubconnect
```

The Firestore Emulator can be used with `@firebase/rules-unit-testing` to test
authorization. Run the complete rules suite with:

```sh
npm run test:firestore-rules
```

The emulator requires a Java JDK. Production rules are not deployed by this
repository setup.
