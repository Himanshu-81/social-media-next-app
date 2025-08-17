import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";
import UserLinkWithTooltip from "./UserLinkWithTooltip";

interface LinkifyProps {
  children: React.ReactNode;
}

export default function Linkify({ children }: LinkifyProps) {
  return <LinkifyUrl>{children}</LinkifyUrl>;
}

function LinkifyUrl({ children }: LinkifyProps) {
  return (
    <LinkyfyUsername>
      <LinkifyHashtag>
        <LinkItUrl className="text-primary hover:underline">
          {children}
        </LinkItUrl>
      </LinkifyHashtag>
    </LinkyfyUsername>
  );
}

function LinkyfyUsername({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/@([a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <UserLinkWithTooltip key={key} username={match.slice(1)}>
          {match}
        </UserLinkWithTooltip>
      )}
    >
      {children}
    </LinkIt>
  );
}

function LinkifyHashtag({ children }: LinkifyProps) {
  return (
    <LinkIt
      regex={/#([a-zA-Z0-9]+)/}
      component={(match, key) => (
        <Link
          key={key}
          href={`/hashtag/${match.slice(1)}`}
          className="hover:underline text-primary"
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
