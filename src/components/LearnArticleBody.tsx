import { MarkdownBody } from "@/components/MarkdownBody";
import { rewriteLearnMarkdownLinks } from "@/lib/learn";

type Props = {
  tenantId: string;
  body: string;
  className?: string;
};

export function LearnArticleBody({ tenantId, body, className }: Props) {
  const markdown = rewriteLearnMarkdownLinks(body, tenantId);
  return (
    <MarkdownBody
      markdown={markdown}
      tenantId={tenantId}
      className={className ?? "worksheet-markdown learn-markdown"}
    />
  );
}
