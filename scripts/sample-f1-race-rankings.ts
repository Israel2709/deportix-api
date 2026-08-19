import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function loadEnv(path: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
  return env;
}

async function main(): Promise<void> {
  const env = loadEnv(".env.local");
  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const app = initializeApp(
    {
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      projectId: env.FIREBASE_PROJECT_ID,
    },
    "dac8e-schema-compare",
  );
  const db = getFirestore(app);

  const count = (await db.collection("f1_race_rankings").count().get()).data().count;
  const snap = await db.collection("f1_race_rankings").limit(3).get();
  const fields = new Set<string>();
  snap.docs.forEach((doc) => Object.keys(doc.data()).forEach((key) => fields.add(key)));

  const raceSnap = await db.collection("f1_races").where("external_id", "==", "785").limit(1).get();
  const raceId = raceSnap.docs[0]?.id;
  let race785: Record<string, unknown>[] = [];
  if (raceId) {
    const rs = await db.collection("f1_race_rankings").where("race_id", "==", raceId).limit(2).get();
    race785 = rs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  process.stdout.write(
    JSON.stringify(
      {
        project: env.FIREBASE_PROJECT_ID,
        count,
        fields: [...fields].sort(),
        samples: snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        race785,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
