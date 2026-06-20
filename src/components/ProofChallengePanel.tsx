import { useEffect, useMemo, useState } from "react";
import { getProposition } from "../propositions";
import { useGeometryStore } from "../state/useGeometryStore";

type ProofClaim = {
  id: string;
  text: string;
};

type ProofChallenge = {
  claims: ProofClaim[];
  correctOrder: string[];
};

const proofChallenges: Record<string, ProofChallenge> = {
  "I.1": {
    claims: [
      { id: "circle-a", text: "C lies on the circle centered at A." },
      { id: "ac-ab", text: "Therefore AC equals AB." },
      { id: "circle-b", text: "C lies on the circle centered at B." },
      { id: "bc-ab", text: "Therefore BC equals AB." },
      { id: "transfer", text: "Things equal to the same thing are equal to one another." },
      { id: "equilateral", text: "Therefore triangle ABC is equilateral." },
    ],
    correctOrder: ["circle-a", "ac-ab", "circle-b", "bc-ab", "transfer", "equilateral"],
  },
};

function shuffleProofStepIds(ids: string[]) {
  const shuffled = [...ids];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function isSameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function shuffleProofStepIdsSafely(ids: string[]) {
  let shuffled = shuffleProofStepIds(ids);
  let attempts = 0;

  while (ids.length > 2 && isSameOrder(shuffled, ids) && attempts < 5) {
    shuffled = shuffleProofStepIds(ids);
    attempts += 1;
  }

  return shuffled;
}

function challengeFromReplay(propositionId: string): ProofChallenge {
  const proposition = getProposition(propositionId);
  const claims = proposition.replaySteps.map((step, index) => ({
    id: step.id || `step-${index + 1}`,
    text: step.text,
  }));
  const correctOrder = claims.map((claim) => claim.id);

  return {
    claims,
    correctOrder,
  };
}

function getProofChallenge(propositionId: string): ProofChallenge {
  return proofChallenges[propositionId] ?? challengeFromReplay(propositionId);
}

export function ProofChallengePanel() {
  const currentPropositionId = useGeometryStore((state) => state.currentPropositionId);
  const completeProofChallenge = useGeometryStore((state) => state.completeProofChallenge);
  const proposition = getProposition(currentPropositionId);
  const challenge = useMemo(() => getProofChallenge(currentPropositionId), [currentPropositionId]);
  const [selectedClaimIds, setSelectedClaimIds] = useState<string[]>([]);
  const [displayClaimIds, setDisplayClaimIds] = useState<string[]>(() => shuffleProofStepIdsSafely(challenge.correctOrder));
  const [message, setMessage] = useState("");

  useEffect(() => {
    setSelectedClaimIds([]);
    setDisplayClaimIds(shuffleProofStepIdsSafely(challenge.correctOrder));
    setMessage("");
  }, [challenge, currentPropositionId]);

  const remainingClaims = useMemo(() => {
    const claimById = new Map(challenge.claims.map((claim) => [claim.id, claim]));
    return displayClaimIds
      .map((claimId) => claimById.get(claimId))
      .filter((claim): claim is ProofClaim => Boolean(claim))
      .filter((claim) => !selectedClaimIds.includes(claim.id));
  }, [challenge, displayClaimIds, selectedClaimIds]);

  const chooseClaim = (claimId: string) => {
    const nextIndex = selectedClaimIds.length;
    const expectedClaimId = challenge.correctOrder[nextIndex];

    if (claimId !== expectedClaimId) {
      setMessage("That claim does not follow yet.");
      return;
    }

    const nextSelection = [...selectedClaimIds, claimId];
    setSelectedClaimIds(nextSelection);
    setMessage("");

    if (nextSelection.length === challenge.correctOrder.length) {
      completeProofChallenge();
    }
  };

  return (
    <section className="proof-challenge-panel" aria-label={`Proof challenge for ${proposition.id}`}>
      <p className="panel-label">Play the proof</p>
      <h2>Prove the proposition by clicking the steps in right order.</h2>

      <ol className="proof-slots" aria-label="Selected proof claims">
        {selectedClaimIds.map((claimId) => {
          const claim = challenge.claims.find((candidate) => candidate.id === claimId);
          return <li key={claimId}>{claim?.text}</li>;
        })}
      </ol>

      <div className="claim-grid" aria-label="Available proof claims">
        {remainingClaims.map((claim) => (
          <button className="claim-button" key={claim.id} type="button" onClick={() => chooseClaim(claim.id)}>
            {claim.text}
          </button>
        ))}
      </div>

      {message && <p className="proof-challenge-message">{message}</p>}
    </section>
  );
}
