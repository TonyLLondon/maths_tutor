import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getAccountById } from "@/lib/accounts";
import { getChessTrainerProgress } from "@/lib/chess/chess-progress";
import { totalPliesForLevel, parseChessLevel } from "@/lib/chess/chess-level";
import { isTenantId } from "@/lib/tenants";
import { ServerTenantNav } from "@/components/ServerTenantNav";
import { chessHomeTrail } from "@/lib/nav-crumbs";
import { ChessOpeningTrainer } from "@/components/chess/ChessOpeningTrainer";

type Props = { params: Promise<{ tenant: string }> };

export default async function ChessSubjectPage({ params }: Props) {
  const { tenant } = await params;
  if (!isTenantId(tenant)) notFound();
  const session = await requireSession(tenant);
  const account = await getAccountById(session.userId);
  const progress = await getChessTrainerProgress(session.userId);
  const totalPlies = totalPliesForLevel(
    parseChessLevel(account?.chessLevel),
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <ServerTenantNav tenantId={tenant} crumbs={chessHomeTrail(tenant)} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2 sm:px-4 sm:py-3">
        <ChessOpeningTrainer
          tenant={tenant}
          displayName={session.displayName}
          totalPlies={totalPlies}
          initialProgress={progress}
        />
      </main>
    </div>
  );
}


