const fs = require('node:fs');
const path = require('node:path');
const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} = require('firebase/firestore');

const projectId = 'demo-studentclubconnect';
const testEnv = {};

before(async () => {
  testEnv.instance = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8'),
    },
  });
});

after(async () => {
  await testEnv.instance?.cleanup();
});

beforeEach(async () => {
  await testEnv.instance.clearFirestore();
  await testEnv.instance.withSecurityRulesDisabled(async ({ firestore }) => {
    const seed = writeBatch(firestore);
    const users = [
      ['student-a', 'student'],
      ['student-b', 'student'],
      ['president-a', 'president', 'coding'],
      ['president-b', 'president', 'robotics'],
      ['admin-user', 'admin'],
    ];

    users.forEach(([uid, role, presidentOf]) => {
      seed.set(doc(firestore, 'users', uid), profileData(uid, role, presidentOf));
    });

    seed.set(doc(firestore, 'clubs', 'coding'), clubData('president-a', 1));
    seed.set(doc(firestore, 'clubs', 'robotics'), clubData('president-b', 1));
    seed.set(doc(firestore, 'clubs', 'other'), clubData(null, 0));
    seed.set(doc(firestore, 'clubs', 'coding', 'members', 'student-b'), {
      userId: 'student-b', role: 'member', joinedAt: new Date(),
    });
    seed.set(doc(firestore, 'events', 'coding-event'), eventData('coding'));
    seed.set(doc(firestore, 'events', 'robotics-event'), eventData('robotics'));
    seed.set(doc(firestore, 'announcements', 'coding-news'), announcementData('coding', 'president-a'));
    seed.set(doc(firestore, 'announcements', 'robotics-news'), announcementData('robotics', 'president-b'));
    seed.set(doc(firestore, 'eventRegistrations', 'student-b_coding-event'), {
      userId: 'student-b', eventId: 'coding-event', registeredAt: new Date(),
    });
    seed.set(doc(firestore, 'bookmarks', 'student-b_club_coding'), {
      userId: 'student-b', itemId: 'coding', itemType: 'club', createdAt: new Date(),
    });
    await seed.commit();
  });
});

test('authentication and profile ownership are enforced', async () => {
  const anonymous = testEnv.instance.unauthenticatedContext().firestore();
  const student = testEnv.instance.authenticatedContext('student-a').firestore();
  const admin = testEnv.instance.authenticatedContext('admin-user').firestore();

  await assertFails(getDoc(doc(anonymous, 'clubs', 'coding')));
  await assertSucceeds(getDoc(doc(student, 'users', 'student-a')));
  await assertFails(getDoc(doc(student, 'users', 'student-b')));
  await assertFails(getDocs(collection(student, 'users')));
  await assertSucceeds(getDocs(collection(admin, 'users')));
  await assertSucceeds(updateDoc(doc(student, 'users', 'student-a'), { phone: '555-0100', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(student, 'users', 'student-a'), { role: 'admin', updatedAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(admin, 'users', 'student-a'), { role: 'admin', updatedAt: serverTimestamp() }));
});

test('club write access is limited to admins and the assigned president', async () => {
  const student = testEnv.instance.authenticatedContext('student-a').firestore();
  const president = testEnv.instance.authenticatedContext('president-a').firestore();
  const admin = testEnv.instance.authenticatedContext('admin-user').firestore();

  await assertFails(updateDoc(doc(student, 'clubs', 'coding'), { name: 'Changed' }));
  await assertSucceeds(updateDoc(doc(president, 'clubs', 'coding'), {
    name: 'Coding Collective', updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(doc(president, 'clubs', 'robotics'), {
    name: 'Changed', updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(setDoc(doc(admin, 'clubs', 'new-club'), {
    ...clubData(null, 0), createdAt: serverTimestamp(),
  }));
});

test('presidents can manage events and announcements only for their assigned club', async () => {
  const president = testEnv.instance.authenticatedContext('president-a').firestore();

  await assertSucceeds(setDoc(doc(president, 'events', 'new-coding-event'), {
    ...eventData('coding'), createdAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(president, 'events', 'new-robotics-event'), {
    ...eventData('robotics'), createdAt: serverTimestamp(),
  }));
  await assertSucceeds(updateDoc(doc(president, 'events', 'coding-event'), {
    title: 'Updated Coding Event',
  }));
  await assertFails(updateDoc(doc(president, 'events', 'robotics-event'), {
    title: 'Changed Event',
  }));

  await assertSucceeds(setDoc(doc(president, 'announcements', 'new-coding-news'), {
    ...announcementData('coding', 'president-a'), createdAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(president, 'announcements', 'new-robotics-news'), {
    ...announcementData('robotics', 'president-a'), createdAt: serverTimestamp(),
  }));
  await assertSucceeds(updateDoc(doc(president, 'announcements', 'coding-news'), { title: 'Updated News' }));
  await assertFails(updateDoc(doc(president, 'announcements', 'robotics-news'), { title: 'Changed News' }));
});

test('membership access is club-scoped and self join/leave updates the count atomically', async () => {
  const student = testEnv.instance.authenticatedContext('student-a').firestore();
  const president = testEnv.instance.authenticatedContext('president-a').firestore();
  const outsiderPresident = testEnv.instance.authenticatedContext('president-b').firestore();
  const memberRef = doc(student, 'clubs', 'coding', 'members', 'student-a');
  const clubRef = doc(student, 'clubs', 'coding');

  await assertFails(getDocs(collection(student, 'clubs', 'coding', 'members')));
  await assertSucceeds(getDocs(collection(president, 'clubs', 'coding', 'members')));
  await assertFails(getDocs(collection(outsiderPresident, 'clubs', 'coding', 'members')));
  await assertSucceeds(getDocs(query(collectionGroup(student, 'members'), where('userId', '==', 'student-a'))));
  await assertFails(getDocs(query(collectionGroup(student, 'members'), where('userId', '==', 'student-b'))));
  assert.equal((await assertSucceeds(getDoc(clubRef))).data().memberCount, 1);

  const joinBatch = writeBatch(student);
  joinBatch.set(memberRef, { userId: 'student-a', role: 'member', joinedAt: serverTimestamp() });
  joinBatch.update(clubRef, { memberCount: 2 });
  await assertSucceeds(joinBatch.commit());
  await assertSucceeds(getCountFromServer(collection(president, 'clubs', 'coding', 'members')));

  const leaveBatch = writeBatch(student);
  leaveBatch.delete(memberRef);
  leaveBatch.update(clubRef, { memberCount: 1 });
  await assertSucceeds(leaveBatch.commit());

  await assertFails(setDoc(doc(student, 'clubs', 'robotics', 'members', 'student-b'), {
    userId: 'student-b', role: 'member', joinedAt: serverTimestamp(),
  }));
  await assertFails(deleteDoc(doc(outsiderPresident, 'clubs', 'coding', 'members', 'student-b')));
});

test('event registrations are private to their owner', async () => {
  const student = testEnv.instance.authenticatedContext('student-a').firestore();
  const registrationRef = doc(student, 'eventRegistrations', 'student-a_coding-event');

  assert.equal((await assertSucceeds(getDoc(registrationRef))).exists(), false);
  await assertSucceeds(setDoc(registrationRef, {
    userId: 'student-a', eventId: 'coding-event', registeredAt: serverTimestamp(),
  }));
  await assertFails(getDoc(doc(student, 'eventRegistrations', 'student-b_coding-event')));
  await assertFails(setDoc(doc(student, 'eventRegistrations', 'student-b_robotics-event'), {
    userId: 'student-b', eventId: 'robotics-event', registeredAt: serverTimestamp(),
  }));
});

test('bookmarks are private, owner-scoped, and accept only valid existing items', async () => {
  const student = testEnv.instance.authenticatedContext('student-a').firestore();
  const ownRef = doc(student, 'bookmarks', 'student-a_club_coding');

  assert.equal((await assertSucceeds(getDoc(ownRef))).exists(), false);
  await assertSucceeds(setDoc(ownRef, {
    userId: 'student-a', itemId: 'coding', itemType: 'club', createdAt: serverTimestamp(),
  }));
  await assertSucceeds(setDoc(doc(student, 'bookmarks', 'student-a_event_coding-event'), {
    userId: 'student-a', itemId: 'coding-event', itemType: 'event', createdAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(student, 'bookmarks', 'student-a_club_robotics'), {
    userId: 'student-b', itemId: 'robotics', itemType: 'club', createdAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(student, 'bookmarks', 'student-a_post_missing'), {
    userId: 'student-a', itemId: 'missing', itemType: 'post', createdAt: serverTimestamp(),
  }));
  await assertFails(getDoc(doc(student, 'bookmarks', 'student-b_club_coding')));
  await assertFails(getDocs(query(collection(student, 'bookmarks'), where('userId', '==', 'student-b'))));
  await assertFails(updateDoc(ownRef, { itemId: 'robotics' }));
  await assertSucceeds(deleteDoc(ownRef));
});

function clubData(presidentId, memberCount) {
  return {
    name: 'Sample Club',
    description: '',
    category: 'Technology',
    presidentId,
    imageUrl: '',
    memberCount,
    createdAt: new Date(),
  };
}

function profileData(uid, role, presidentOf) {
  return {
    uid,
    fullName: 'Test User',
    studentId: `id-${uid}`,
    email: `${uid}@example.com`,
    programme: '',
    department: '',
    semester: '',
    phone: '',
    role,
    ...(presidentOf ? { presidentOf } : {}),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function eventData(clubId) {
  return {
    title: 'Sample Event',
    description: 'Details',
    date: '1 Jan 2030',
    time: '10:00 AM',
    location: 'Campus',
    clubId,
    imageUrl: '',
    createdAt: new Date(),
  };
}

function announcementData(clubId, createdBy) {
  return {
    title: 'Sample Announcement',
    message: 'Details',
    clubId,
    createdBy,
    createdAt: new Date(),
  };
}
